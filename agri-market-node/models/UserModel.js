import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["client", "farmer"], default: "client" },
  farmName: { type: String },
  location: { type: String },
  phoneNumber: { type: String, required: true },
});

export default mongoose.model("User", userSchema);
