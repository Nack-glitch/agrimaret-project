import Product from "../models/ProductModel.js";

// Public products
export const getPublicProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

// Farmer products
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your products", error: err.message });
  }
};

// Add product
export const addProduct = async (req, res) => {
  try {
    const { name, price, quantity, unit, category, description } = req.body;
    const product = await Product.create({
      name,
      price,
      quantity,
      unit,
      category,
      description,
      farmer: req.user._id,
      farmName: req.user.farmName,
      image: req.file?.path,
    });
    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ message: "Failed to add product", error: err.message });
  }
};
