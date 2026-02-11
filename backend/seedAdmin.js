import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js"; // reuse your db connection
import User from "./models/User.js"; // adjust the path if needed

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@gmail.com" });
    if (existingAdmin) {
      console.log("Admin already exists ✅");
      process.exit();
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("12345678", 10);

    // Create the admin user
    const admin = await User.create({
      fullname: "Admin User",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin", // optional if you use roles
    });

    console.log("Admin seeded successfully ✅");
    console.log({
      id: admin._id,
      fullname: admin.fullname,
      email: admin.email,
      role: admin.role,
    });

    process.exit();
  } catch (error) {
    console.error("Error seeding admin ❌:", error);
    process.exit(1);
  }
};

seedAdmin();
