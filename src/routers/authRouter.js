import { Router } from 'express';

import { validateBody } from '../middlewares/validateBody.js';
import {
  registerSchema,
  loginSchema,
  sendResetEmailSchema,
  resetPasswordSchema,
  googleOAuthCodeSchema,
} from '../validation/authSchemas.js';
import {
  registerController,
  verifyController,
  loginController,
  refreshSessionController,
  logoutUserController,
  sendResetEmailController,
  resetPasswordController,
  getGoogleOAuthUrlController,
  loginWithGoogleOAuthController,
} from '../controllers/authControllers.js';

const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), registerController);

authRouter.get('/verify', verifyController);

authRouter.post('/login', validateBody(loginSchema), loginController);

authRouter.post('/refresh', refreshSessionController);

authRouter.post('/logout', logoutUserController);

authRouter.post(
  '/send-reset-email',
  validateBody(sendResetEmailSchema),
  sendResetEmailController,
);

authRouter.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  resetPasswordController,
);

authRouter.get('/google/get-oauth-url', getGoogleOAuthUrlController);

authRouter.post(
  '/google/confirm-oauth',
  validateBody(googleOAuthCodeSchema),
  loginWithGoogleOAuthController,
);

export default authRouter;
