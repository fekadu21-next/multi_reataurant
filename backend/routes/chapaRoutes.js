import express from "express";
import { initiatePayment } from "../controllers/chapaController.js";

const router = express.Router();

router.post("/initialize", initiatePayment);

export default router;
