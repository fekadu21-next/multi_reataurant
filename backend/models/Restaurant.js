import mongoose from "mongoose";
const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    categories: [{ type: String }],
    rating: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    deliveryTime: { type: String },
    description: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
export default mongoose.model("Restaurant", restaurantSchema);
