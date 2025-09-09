import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import handlebars from 'handlebars';

import { SMTP } from '../constants/index.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendEmail.js';
import {
  validateGoogleOAuthCode,
  getFullNameFromGooglePayload,
} from '../utils/googleOAuth2.js';

import { TEMPLATES_DIR } from '../constants/index.js';

import SessionCollection from '../db/models/Session.js';
import UserCollection from '../db/models/User.js';

import {
  accessTokenLifeTime,
  refreshTokenLifeTime,
} from '../constants/auth-constants.js';

export const createSession = () => ({
  accessToken: randomBytes(30).toString('base64'),
  refreshToken: randomBytes(30).toString('base64'),
  accessTokenValidUntil: new Date(Date.now() + accessTokenLifeTime),
  refreshTokenValidUntil: new Date(Date.now() + refreshTokenLifeTime),
});
export const findSession = (query) => SessionCollection.findOne(query);
export const findUser = (query) => UserCollection.findOne(query);

const verifyTemplatePath = path.join(TEMPLATES_DIR, 'verify-email.html'); // <-- читаємо шлях до шаблону верифікації емейлу
const verifyTemplateSource = await readFile(verifyTemplatePath, 'utf-8'); // <-- читаємо і отримуємо зміст шаблону
const appDomain = getEnvVar('APP_DOMAIN');
const jwtSecret = getEnvVar('JWT_SECRET');

export const registerUser = async (payload) => {
  const { email, password } = payload;
  const user = await UserCollection.findOne({ email });
  if (user) {
    throw createHttpError(409, 'Email in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  // return UserCollection.create({ ...payload, password: hashPassword });
  const newUser = await UserCollection.create({
    ...payload,
    password: hashPassword,
  });

  const template = handlebars.compile(verifyTemplateSource); // <-- зі строки робимо хендлбар шаблон
  const verifyPayload = {
    email,
  };
  const token = jwt.sign(verifyPayload, jwtSecret, { expiresIn: '15m' });
  const html = template({
    //  <-- з шаблону отримуємо html
    verifyLink: `${appDomain}/auth/verify?token=${token}`,
  });

  const verifyEmail = {
    to: email,
    subject: 'Verify email',
    html,
  };

  await sendEmail(verifyEmail);

  return newUser;
};

export const verifyUser = async (token) => {
  try {
    const { email } = jwt.verify(token, jwtSecret);
    await UserCollection.findOneAndUpdate({ email }, { verify: true });
  } catch (error) {
    throw createHttpError(401, error.message);
  }
};

export const loginUser = async ({ email, password }) => {
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Email or password invalid');
  }

  if (!user.verify) {
    throw createHttpError(401, 'Email not verified');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw createHttpError(401, 'Email or password invalid');
  }

  await SessionCollection.findOneAndDelete({ userId: user._id });

  const session = createSession();

  return SessionCollection.create({
    userId: user._id,
    ...session,
  });
};

export const refreshUserSession = async ({ refreshToken, sessionId }) => {
  const oldSession = await findSession({ refreshToken, _id: sessionId });
  if (!oldSession) {
    throw createHttpError(401, 'Session not found');
  }

  await SessionCollection.findByIdAndDelete(oldSession._id);

  if (oldSession.refreshTokenValidUntil < new Date()) {
    throw createHttpError(401, 'Session token expired');
  }

  const newSession = createSession();

  return SessionCollection.create({
    userId: oldSession.userId,
    ...newSession,
  });
};

export const logoutUser = (sessionId) =>
  SessionCollection.findOneAndDelete({ _id: sessionId });

export const sendResetToken = async (email) => {
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    jwtSecret,
    {
      expiresIn: '15m',
    },
  );

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  );

  const resetTemplateSource = await readFile(
    resetPasswordTemplatePath,
    'utf-8',
  );

  const template = handlebars.compile(resetTemplateSource);
  const html = template({
    name: user.name,
    resetLink: `${appDomain}/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: getEnvVar(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html,
  });
};

export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, jwtSecret);
  } catch (err) {
    if (err instanceof Error) throw createHttpError(401, err.message);
    throw err;
  }

  const user = await UserCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await UserCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );
};

export const loginWithGoogleOAuth = async (code) => {
  const loginTicket = await validateGoogleOAuthCode(code); //  <--- чи валідний код
  const payload = loginTicket.getPayload(); //  <--- замість деструктуризації
  if (!payload) throw createHttpError(401, 'Google payload missing');

  let user = await findUser({ email: payload.email }); //  <--- чи є така людина в базі
  if (!user) {
    const password = await bcrypt.hash(randomBytes(10).toString('base64'), 10);
    const name = getFullNameFromGooglePayload(payload);
    user = await UserCollection.create({
      name,
      email: payload.email,
      password,
    });
  }

  await SessionCollection.findOneAndDelete({ userId: user._id });

  const session = createSession();

  return SessionCollection.create({
    userId: user._id,
    ...session,
  });
};
