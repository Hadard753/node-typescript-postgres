import * as createError from 'http-errors';

import {
  UserProfile,
  ActionResponse,
  LoginActionResponse
} from './../../shared/models';

import User from '../db-models/user';
import auth from '../auth';
import { RegisterForm } from './forms';

class ApiController {
  register(registerForm: RegisterForm): Promise<ActionResponse<UserProfile>> {
    if (!registerForm.isValid()) {
      return Promise.reject(registerForm.getFormError());
    }

    return registerForm.getHashedPassword().then(hashedPassword => {
      return User.create({
        ...registerForm,
        password: hashedPassword
      }).then(user => {
        return this.login(user.email, registerForm.password);
      }).catch(err => {
        return Promise.reject(createError(500, err || 'Cannot create user at the moment. Please try again later'))
      });
    });
  }

  async login(email: string, password: string): Promise<LoginActionResponse> {
    return auth.authenticate(email, password).then(user => {
      if (!user) {
        return Promise.reject(createError(401, `Email or password are invalid!`));
      }

      const token = auth.generateToken(user);
      return Promise.resolve({
          token: token,
          profile: user
      });
    });
  }

  getProfile(user: UserProfile): Promise<UserProfile> {
    return Promise.resolve(user);
  }

  logout(): Promise<ActionResponse<any>> {
    // TODO: Implement your own logout mechanisem (JWT token blacklists, etc...)
    return Promise.reject(`Logout has not been implemented!`);
  }
}

export default new ApiController();
