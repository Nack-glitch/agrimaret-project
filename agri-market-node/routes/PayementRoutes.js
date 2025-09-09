import express from "express";
import axios from "axios";
import Order from "../models/orderModel.js";

const router = express.Router();

// Initialize payment
router.post("/initialize", async (req, res) => {
  try {
    const { amount, email, first_name, last_name, tx_ref, orderId } = req.body;

    // Chapa API initialization
    const chapaRes = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount,
        currency: "ETB",
        email,
        first_name,
        last_name,
        tx_ref,
        callback_url: "http://localhost:3000/api/payments/callback", // update for your frontend
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Save tx_ref to the order
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { paymentRef: tx_ref });
    }

    return res.json({ status: true, data: chapaRes.data.data });
  } catch (err) {
    console.error("Chapa initialization error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to initialize payment" });
  }
});

// Callback from Chapa after payment
router.post("/callback", async (req, res) => {
  try {
    const { tx_ref, status } = req.body;

    // Find the order by tx_ref
    const order = await Order.findOne({ paymentRef: tx_ref });
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Update order status based on Chapa response
    if (status === "success") {
      order.status = "paid";
      await order.save();
    }

    return res.json({ status: true, order });
  } catch (err) {
    console.error("Chapa callback error:", err.message);
    return res.status(500).json({ error: "Failed to process callback" });
  }
});

export default router;
