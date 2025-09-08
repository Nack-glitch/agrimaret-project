import express from "express";
import Product from "../models/productModels.js";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const { name, price, quantity, unit, category, description } = req.body;
    const farmerId = req.user._id;

    const newProduct = new Product({
      name,
      price,
      quantity,
      unit,
      category,       
      description,
      farmer: farmerId,
      image: req.file ? `/uploads/${req.file.filename}` : undefined,
    });

    const product = await newProduct.save();
    await product.populate("farmer", "name farmName");

    if (req.app.get("io")) {
      req.app.get("io").emit("new-product", product);
    }

    res.status(201).json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add product", error: err.message });
  }
});

router.get("/mine", protect, async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id }).populate("farmer", "name farmName");
    res.json({ status: true, products });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});


router.get("/public", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== "All" ? { category } : {};

    const products = await Product.find(filter).populate("farmer", "name farmName");
    res.json({ status: true, products });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

export default router;
