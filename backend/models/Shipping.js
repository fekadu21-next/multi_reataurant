import mongoose from "mongoose";

const shippingSchema = new mongoose.Schema(
  {
    // Three shipping options with default values
    shippingOptions: {
      type: [
        {
          type: {
            type: String,
            enum: ["EXPRESS", "REGIONAL", "PICKUP"],
            required: true
          },
          name: { type: String, required: true },
          price: { type: Number, required: true },
        },
      ],
      default: [
        { type: "EXPRESS", name: "Express Delivery (Addis Ababa)", price: 200 },
        { type: "REGIONAL", name: "Regional Delivery", price: 500 },
        { type: "PICKUP", name: "Pickup From Store", price: 0 },
      ],
    },

    // Commission percent
    commissionPercent: {
      type: Number,
      required: true,
      default: 15,
    },
  },
  { timestamps: true }
);

// Only one document is expected in this collection
export default mongoose.model("Shipping", shippingSchema);