import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";

// TEMP STORE (replace with DB or Redis in production)
const otpStore = new Map();

// REGISTER
export const register = async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ fullname, email, password: hashed, role });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user and populate restaurant info
    const user = await User.findOne({ email }).populate(
      "restaurant.restaurantId",
    );
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // 2️⃣ Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // 3️⃣ Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // 4️⃣ Return user data including restaurant
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        restaurant: user.restaurant
          ? {
              name: user.restaurant.name,
              restaurantId: user.restaurant.restaurantId?._id || null,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  res.json({ message: "Logout successful" });
};

// GET USERS
export const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

// SAVE BILLING INFO
export const saveBillingInfo = async (req, res) => {
  const { street, city, email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  res.json({
    message: "Billing info received",
    billing: { street, city, email },
  });
};

// SEND EMAIL OTP
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// VERIFY EMAIL OTP
export const verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);

  if (!record) return res.status(400).json({ message: "OTP not found" });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ message: "OTP expired" });
  }
  if (record.otp !== otp)
    return res.status(400).json({ message: "Invalid OTP" });

  otpStore.delete(email);
  res.json({ message: "OTP verified successfully" });
};

// SINGLE USER
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

// CREATE, UPDATE, DELETE USER
export const createUser = async (req, res) => {
  const { fullname, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ fullname, email, password: hashed, role });
  res.status(201).json({ message: "User created", user });
};

export const updateUser = async (req, res) => {
  const updates = { ...req.body };
  if (updates.password)
    updates.password = await bcrypt.hash(updates.password, 10);
  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
  }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User updated", user });
};

export const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted successfully" });
};
