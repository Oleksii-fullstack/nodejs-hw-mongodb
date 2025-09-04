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

export const registerUser = async (payload) => {
  const { email, password } = payload;
  const user = await UserCollection.findOne({ email });
  if (user) {
    throw createHttpError(409, 'Email in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  return UserCollection.create({ ...payload, password: hashPassword });
};

export const loginUser = async ({ email, password }) => {
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Email or password invalid');
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
    getEnvVar('JWT_SECRET'),
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
    resetLink: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`,
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
    entries = jwt.verify(payload.token, getEnvVar('JWT_SECRET'));
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
