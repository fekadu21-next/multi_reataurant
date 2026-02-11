import mongoose from "mongoose";
const MONGO_URI =
  "mongodb+srv://fekaducs:Fe121210$@cluster0.xvfh2mr.mongodb.net/marakiEatsDB?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};
export default connectDB;
