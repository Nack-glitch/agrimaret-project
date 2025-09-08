import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "kg" },
    category: { 
      type: String, 
      enum: ["Vegetables", "Fruits", "Grains", "Herbs"], 
      default: "Vegetables"
    },
    image: { type: String },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
