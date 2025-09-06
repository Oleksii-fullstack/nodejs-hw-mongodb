import { Router } from 'express';

import { validateBody } from '../middlewares/validateBody.js';
import {
  registerSchema,
  loginSchema,
  sendResetEmailSchema,
  resetPasswordSchema,
} from '../validation/authSchemas.js';
import {
  registerController,
  verifyController,
  loginController,
  refreshSessionController,
  logoutUserController,
  sendResetEmailController,
  resetPasswordController,
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

export default authRouter;
