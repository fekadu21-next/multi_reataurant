import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["customer", "restaurant_owner", "admin"],
      default: "customer",
    },

    profileImage: { type: String, default: "" },

    /* =======================
       BILLING / ADDRESS
       ======================= */
    address: {
      street: { type: String },
      city: { type: String },
      phone: { type: String }, // ✅ OTP sent here
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    /* =======================
       OTP (TEMPORARY)
       ======================= */
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },

    favorites: [
      {
        type: {
          type: String,
          enum: ["restaurant", "dish"],
          required: true,
        },

        restaurantId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Restaurant",
          required: function () {
            return this.type === "restaurant" || this.type === "dish";
          },
        },

        dishId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem", // ✅ FIXED
          required: function () {
            return this.type === "dish";
          },
        },
      },
    ],
    orderHistory: [
      {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        orderedAt: { type: Date },
      },
    ],

    aiPreferences: {
      recommendedFoods: [{ type: String }],
      cuisineInterest: [{ type: String }],
    },

    restaurant: {
      name: { type: String },
      restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    },

    paymentInfo: {
      provider: { type: String }, // chapa | telebirr | bank
      customerToken: { type: String },
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
