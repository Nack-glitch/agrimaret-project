import Order from "../models/orderModel.js";

// Add to cart / create order
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity, price, unit } = req.body;
    const userId = req.user._id;

    const newOrder = new Order({
      farmer: req.body.farmer, // from frontend
      items: [{ product: productId, quantity, price, unit }],
      total: price * quantity,
      status: "pending", // default
      user: userId,
    });

    await newOrder.save();
    res.status(201).json({ status: true, order: newOrder });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: err.message || "Failed to add order" });
  }
};

// Update payment status to "paid"
export const markPaid = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "paid";
    await order.save();

    res.json({ status: true, order });
  } catch (err) {
    console.error("Mark paid error:", err);
    res.status(500).json({ message: err.message || "Failed to update order" });
  }
};
