import nodemailer from 'nodemailer';

import { SMTP } from '../constants/index.js';
import { getEnvVar } from './getEnvVar.js';

const transporter = nodemailer.createTransport({
  host: getEnvVar(SMTP.SMTP_HOST),
  port: Number(getEnvVar(SMTP.SMTP_PORT)),
  auth: {
    user: getEnvVar(SMTP.SMTP_USER),
    pass: getEnvVar(SMTP.SMTP_PASSWORD),
  },
});

export const sendEmail = (payload) => {
  const from = getEnvVar('SMTP_FROM');
  const email = { ...payload, from };
  return transporter.sendMail(email);
};

// import nodemailer from 'nodemailer';
// import 'dotenv/config';
// import { getEnvVar } from './getEnvVar.js';

// const host = getEnvVar('SMTP_HOST');
// const port = getEnvVar('SMTP_PORT');
// const user = getEnvVar('SMTP_USER');
// const pass = getEnvVar('SMTP_PASSWORD');
// const from = getEnvVar('SMTP_FROM');

// const nodemailerConfig = {
//   host,
//   port,
//   secure: true,
//   auth: {
//     user,
//     pass,
//   },
// };

// const transport = nodemailer.createTransport(nodemailerConfig);

// export const sendEmail = (payload) => {
//   const email = { ...payload, from };
//   return transport.sendMail(email);
// };
