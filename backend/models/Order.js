import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    /* ================= CUSTOMER INFO ================= */

    // 🔐 Logged-in user (optional)
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 👤 Guest or logged-in customer email (REQUIRED)
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // 👤 Customer full name
    customerName: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // 📞 Customer phone (verified by OTP)
    customerPhone: {
      type: String,
      required: true,
    },

    /* ================= RESTAURANT ================= */

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    /* ================= ORDER ITEMS ================= */

    items: [
      {
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "MenuItem",
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    /* ================= PAYMENT ================= */

    totalPrice: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["BANK or TELEBIRR", "CHAPA", "COD"],
      required: true,
    },

    paymentReference: {
      type: String,
      default: "",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING", // ✅ IMPORTANT FIX
    },
    isSeen: {
      type: Boolean,
      default: false, // new orders are unseen by default
    },
    /* ================= ORDER STATUS ================= */
    adminSeen: { type: Boolean, default: false },

    orderStatus: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "PREPARING", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },

    /* ================= COMMISSION ================= */

    // commissionPercent: {
    //   type: Number,
    //   default: 15,
    // },
    adminCommission: {
      type: Number,
      required: true,
    },

    restaurantAmount: {
      type: Number,
      required: true,
    },

    /* ================= DELIVERY ================= */

    deliveryAddress: {
      street: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        required: true,
      },
    },



    instructions: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
