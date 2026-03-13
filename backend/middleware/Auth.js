import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ THIS IS THE FIX
    const user = await User.findById(decoded.id).select("_id email");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // <-- real MongoDB document
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};