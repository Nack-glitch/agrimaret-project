import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        unit: { type: String, required: true },
      },
    ],
    total: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid"], default: "pending" }, // ✅ Only two statuses
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
