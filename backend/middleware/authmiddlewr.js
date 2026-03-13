import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const optionalProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (user) {
        req.user = user;
      }
    }

    next(); // Always continue
  } catch (error) {
    console.log("Optional auth error:", error.message);
    next(); // Still continue for guests
  }
};