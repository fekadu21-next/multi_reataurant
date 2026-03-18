import express from "express";
import {
  confirmPayment,
} from "../controllers/paymentsController.js";
import { initiatePayment } from "../controllers/chapaController.js";

const router = express.Router();

// router.post("/initiate", initiatePayment);
router.post("/confirm", confirmPayment);
router.post("/initialize", initiatePayment);
export default router;







