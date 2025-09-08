import Product from "../models/ProductModel.js";

export const addProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, image } = req.body;
    const farmerId = req.user._id; 

    if (!name || !price || !quantity) {
      return res.status(400).json({ message: "Name, price, and quantity are required" });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      image,
      farmer: farmerId,
    });

    await newProduct.save();

    res.status(201).json({ status: true, product: newProduct });
  } catch (err) {
    console.error("Add Product Error:", err);
    res.status(500).json({ message: err.message || "Failed to add product" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("farmer", "name email farmName");
    res.json({ status: true, products });
  } catch (err) {
    console.error("Get Products Error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch products" });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const farmerId = req.user._id;
    const products = await Product.find({ farmer: farmerId });
    res.json({ status: true, products });
  } catch (err) {
    console.error("Get My Products Error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch products" });
  }
};
