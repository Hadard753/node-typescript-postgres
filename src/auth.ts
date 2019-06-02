import { Application } from "express";
import { AppRequest, AppResponse } from "./models";

import * as createError from "http-errors";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import * as bearerToken from "express-bearer-token";
import config from "./config";

import User from "./db-models/user";
import { UserProfile } from "../shared/models";

export class Authentication {
  init(express: Application) {
    // Allow parsing bearer tokens easily
    express.use(bearerToken());
  }

  /**
   * Checks if the provided email and password valid, if so, returns the user match. If not, returns null.
   * @param email
   * @param password
   */
  authenticate(email: string, password: string): Promise<UserProfile> {
    return User.findOne({ where: {email: email} }).then(user => {
      if (!user) return null;

      return bcrypt.compare(password, user.password).then(match => {
        return match && user;
      });
    });
  }

  authenticationMiddleware(
    req: AppRequest,
    res: AppResponse,
    next: () => void
  ) {
    if (req.method === "OPTIONS") return next();

    if (req.token) {
      const decodedUser = jwt.verify(
        req.token,
        config.JWT_SECRET
      ) as UserProfile;
      if (decodedUser) {
        return User.findOne({where: {id: decodedUser.id}})
          .then(user => {
            req.user = user;
            return next();
          })
          .catch(error => {
            throw createError(500, `Internal server error`);
          });
      }
    }

    throw createError(400, `Provided token is invalid!`);
  }

  /**
   * Generates a JWT token with the specified user data.
   * @param user
   */
  generateToken(user: UserProfile): string {
    return jwt.sign(JSON.stringify(user), config.JWT_SECRET);
  }

  /**
   * Decodes a JWT token and returns the user found.
   * @param token
   */
  decodeToken(token: string): UserProfile {
    return jwt.verify(token, config.JWT_SECRET) as UserProfile;
  }
}

export default new Authentication();
