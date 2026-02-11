import Order from "../models/Order.js";
export const createOrder = async (req, res) => {
  try {
    const {
      customerId,
      restaurantId,
      items,
      totalPrice,
      deliveryAddress,
      instructions,
    } = req.body;
    const order = await Order.create({
      customerId,
      restaurantId,
      items,
      totalPrice,
      deliveryAddress,
      instructions,
    });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// GET all orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "fullname email")
      .populate("restaurantId", "name");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET orders by customer
export const getOrdersByCustomer = async (req, res) => {
  try {
    const orders = await Order.find({
      customerId: req.params.customerId,
    }).populate("restaurantId", "name");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET orders by restaurant
export const getOrdersByRestaurant = async (req, res) => {
  try {
    const orders = await Order.find({
      restaurantId: req.params.restaurantId,
    }).populate("customerId", "fullname email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// UPDATE order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, driverLocation } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus, paymentStatus, driverLocation },
      { new: true },
    );

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order updated", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE an order
export const deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
