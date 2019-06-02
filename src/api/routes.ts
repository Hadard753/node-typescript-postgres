import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import * as cors from 'cors';

import * as middlewares from './middlewares';
import auth from '../auth';
import config from '../config';
import controller from './controller';
import { AppRequest, AppResponse } from '../models/app-req-res';
import { RegisterForm } from './forms';

const router = express.Router();

router.use(cors(config.CORS_OPTIONS));
router.use(middlewares.unhandledErrorMiddleware);


router.post('/register', (req: Request, res: Response, next: NextFunction) => {
  const registerForm = new RegisterForm(req.body as RegisterForm);
  next(controller.register(registerForm));
});

router.use('/social-login', require('./social-login/routes'));

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  const loginForm: { email: string; password: string } = req.body;
  next(controller.login(loginForm.email, loginForm.password));
});

router.get('/profile', auth.authenticationMiddleware,
  (req: AppRequest, res: AppResponse, next: NextFunction) => {
    next(controller.getProfile(req.user));
  }
);

router.get('/logout', auth.authenticationMiddleware,
  (req: AppRequest, res: AppResponse, next: NextFunction) => {
    next(controller.logout());
  }
);

router.use(middlewares.postResponseMiddleware);
router.use(middlewares.postErrorMiddleware);

module.exports = router;
