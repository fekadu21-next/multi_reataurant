import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    customer: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
    },

    amount: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      enum: ["CHAPA", "TELEBIRR", "BANK"],
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    transactionRef: {
      type: String,
      required: true,
      unique: true,
    },

    orderData: {
      type: Object,
      required: true, // snapshot of order
    },
  },
  { timestamps: true },
);

export default mongoose.model("Payment", paymentSchema);
