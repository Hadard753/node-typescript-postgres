import { NextFunction } from 'express';
import * as express from 'express';
import * as cors from 'cors';

import * as middlewares from '../middlewares';
import auth from '../../auth';
import config from '../../config';
import controller from './controller';
import { AppRequest, AppResponse } from '../../models/app-req-res';

const router = express.Router();

router.use(cors(config.CORS_OPTIONS));
router.use(middlewares.unhandledErrorMiddleware);

// Add new Stock to DB
router.post('', auth.authenticationMiddleware,
(req: AppRequest, res: AppResponse, next: NextFunction) => {
    next(controller.addStock(req.body.name, req.body.name));
  }
);

// Get a specific Stock from DB
router.get('/:id',
  (req: AppRequest, res: AppResponse, next: NextFunction) => {
    const id = req.params['id'] as number;
    next(controller.getById(id));
  }
);

// Get all Stocks from Cache
router.get('',
  (req: AppRequest, res: AppResponse, next: NextFunction) => {
    next(controller.getCache());
  });

// ************ Votes ************//
router.post('/vote', auth.authenticationMiddleware,
(req: AppRequest, res: AppResponse, next: NextFunction) => {
  let {stockId, buy} = req.body;
  next(controller.vote(stockId, buy, req.user));
}); 

// router.get('/init-stock-db', 
//   (req: AppRequest, res: AppResponse, next: NextFunction) => {
//     console.log("hello");
//     next(controller.initStockDB());
//   }
// );

router.use(middlewares.postResponseMiddleware);
router.use(middlewares.postErrorMiddleware);

module.exports = router;
