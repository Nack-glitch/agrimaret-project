import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  unit: String,
  category: String,
  image: String,
  organic: Boolean,
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Product", productSchema);
