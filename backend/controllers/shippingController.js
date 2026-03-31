import Shipping from "../models/Shipping.js";

// GET current shipping & commission settings
export const getShippingSettings = async (req, res) => {
  try {
    let settings = await Shipping.findOne();

    // If not found → create default
    if (!settings) {
      settings = await Shipping.create({});
    }

    res.status(200).json(settings);
  } catch (err) {
    console.error("Get Shipping Settings Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE shipping & commission settings (Admin only)
export const updateShippingSettings = async (req, res) => {
  try {
    const { shippingOptions, commissionPercent } = req.body;

    let settings = await Shipping.findOne();
    if (!settings) {
      // Create if not exists
      settings = new Shipping({ shippingOptions, commissionPercent });
    } else {
      // Update existing
      if (shippingOptions) settings.shippingOptions = shippingOptions;
      if (commissionPercent !== undefined) settings.commissionPercent = commissionPercent;
    }

    await settings.save();
    res.status(200).json({ message: "Settings updated successfully", settings });
  } catch (err) {
    console.error("Update Shipping Settings Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};