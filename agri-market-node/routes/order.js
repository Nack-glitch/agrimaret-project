import express from "express";
import Order from "../models/orderModel.js";

const router = express.Router();

// Example route: Get all orders for a user
router.get("/my-orders", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get orders by status (pending or paid)
router.get("/my-orders/:status", async (req, res) => {
  const { status } = req.params;
  try {
    const orders = await Order.find({ user: req.user.id, status });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
