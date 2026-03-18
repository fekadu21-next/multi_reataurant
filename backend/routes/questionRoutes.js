import express from "express";
import { sendQuestion } from "../controllers/sendQuestion.js";

const router = express.Router();

router.post("/ask-question", sendQuestion);

export default router;