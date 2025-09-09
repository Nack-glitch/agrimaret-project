const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  farmerName: { type: String, required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  buyerName: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  amount: { type: Number, required: true },
  quantity: { type: Number, required: true },
  method: { type: String, enum: ["Bank", "Paystack"], required: true },
  reference: { type: String, required: true },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);
