import express from "express";
import { initializeChapa } from "../controllers/chapaController.js";

const router = express.Router();

router.post("/initialize", initializeChapa);

export default router;
