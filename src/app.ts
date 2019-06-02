import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';

import db from './db';
import auth from './auth';
import socialAuth from './social-auth';
import config from './config';
import logger, { getExpressLoggingMiddleware } from './logger';

// App class will encapsulate our web server.
export class App {
  express: express.Application;

  constructor() {}

  init(port: string | number, ready?: () => void) {
    this.express = express();

    if (config.DEBUG_MODE) logger.info(`Debug mode is ON`);
    logger.info(`Loaded configurations for environment: ${config.ENVIRONMENT}`);

    console.log(`Connecting to database...`);
    db.init(() => {
      this.mountPreMiddlewares();
      this.mountRoutes();

      // if (!config.DEBUG_MODE) this.mountAngular();
      this.mountPostMiddlewares();

      this.express.listen(port);
      logger.info(`Server is now listening on port ${port}...`);
      ready && ready();
    });
  }

  private mountPreMiddlewares(): void {
    // Allow parsing JSON data obtained from post
    this.express.use(bodyParser.json());

    // parse application/x-www-form-urlencoded
    this.express.use(bodyParser.urlencoded({ extended: true }));

    auth.init(this.express);
    socialAuth.init(this.express);
  }

  private mountPostMiddlewares(): void {}

  private mountRoutes(): void {
    this.express.use('/api', require('./api/routes'));
  }
}

// The express instance is reachable through the public express property.
export default new App();
