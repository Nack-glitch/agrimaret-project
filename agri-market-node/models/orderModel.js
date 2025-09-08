import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    qty: { type: Number, required: true },
    priceETB: { type: Number, required: true }
  }],
  totalETB: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "paid"], default: "pending" },
  payment: { method: String, txRef: String, paidAt: Date, currency: String }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
