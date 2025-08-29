import { Router } from 'express';

import { validateBody } from '../middlewares/validateBody.js';
import { registerSchema, loginSchema } from '../validation/authSchemas.js';
import {
  registerController,
  loginController,
  refreshSessionController,
  logoutUserController,
} from '../controllers/authControllers.js';

const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), registerController);

authRouter.post('/login', validateBody(loginSchema), loginController);

authRouter.post('/refresh', refreshSessionController);

authRouter.post('/logout', logoutUserController);

export default authRouter;
