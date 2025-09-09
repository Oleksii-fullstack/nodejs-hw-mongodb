import { OAuth2Client } from 'google-auth-library';
import createHttpError from 'http-errors';

import { getEnvVar } from './getEnvVar.js';

const clientId = getEnvVar('GOOGLE_OAUTH_CLIENT_ID');
const clientSecret = getEnvVar('GOOGLE_OAUTH_CLIENT_SECRET');
const redirectUri = getEnvVar('GOOGLE_OAUTH_REDIRECT');

const googleOAuthClient = new OAuth2Client({
  clientId,
  clientSecret,
  redirectUri,
});

export const generateGoogleOAuthUrl = () =>
  googleOAuthClient.generateAuthUrl({
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });

export const validateGoogleOAuthCode = async (code) => {
  const response = await googleOAuthClient.getToken(code);

  if (!response.tokens.id_token) {
    throw createHttpError(401, 'Invalid token');
  }
  const ticket = await googleOAuthClient.verifyIdToken({
    idToken: response.tokens.id_token,
  });
  return ticket;
};

export const getFullNameFromGooglePayload = ({
  name,
  given_name,
  family_name,
}) => {
  if (name) return name;
  if (!given_name && !family_name) return 'Guest';
  let fullName = '';
  if (given_name) {
    fullName += `${given_name} `;
  }
  if (family_name) {
    fullName += family_name;
  }
  return fullName;
};
