import express from "express";
import { contact } from "../controllers/contactController.js";

const router = express.Router();

// POST: send contact / question email
router.post("/contact", contact);

export default router;