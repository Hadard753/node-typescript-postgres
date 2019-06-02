import * as cors from "cors";
import * as express from "express";
import { Request, Response } from "express";

import config from "../config";;
import controller from "./api.controller";
import * as middlewares from "./middlewares";

const router = express.Router();

router.use(cors(config.CORS_OPTIONS));
router.use(middlewares.unhandledErrorMiddleware);

router.post("/leads", (req: Request, res: Response, next: (data) => void) => {
  const lead = req.body;
  next(controller.addLeadToCRM(lead));
});

router.use(middlewares.postResponseMiddleware);
router.use(middlewares.postErrorMiddleware);

module.exports = router;
