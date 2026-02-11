import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    // Internal system key (used in code, filtering)
    key: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      // Example: DRINKS, FASTFOOD, TRADITIONAL
    },

    // Display name (English)
    name: {
      type: String,
      required: true,
      trim: true,
      // Example: Drinks
    },

    // Localized label (Amharic)
    label: {
      type: String,
      trim: true,
      // Example: መጠጦች
    },

    // Icon identifier for frontend
    icon: {
      type: String,
      // Example: cup, flame, coffee
    },

    // Control visibility
    isActive: {
      type: Boolean,
      default: true,
    },

    // Order in UI
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Category", categorySchema);
