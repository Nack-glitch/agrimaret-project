import Order from "../models/orderModel.js";
import Product from "../models/productModels.js";
import User from "../models/UserModel.js";

const getOrCreateCart = async (clientId) => {
  let cart = await Order.findOne({ client: clientId, status: "pending" });
  if (!cart) cart = await Order.create({ client: clientId, items: [], totalETB: 0, status: "pending" });
  return cart;
};

export const viewCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    await cart.populate("items.product", "name priceETB");
    res.json({ status: true, cart });
  } catch (err) { next(err); }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, qty } = req.body;
    if (!productId || !qty || qty < 1) return res.status(400).json({ status: false, message: "Invalid quantity" });

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) return res.status(404).json({ status: false, message: "Product not found" });
    if (product.quantity < qty) return res.status(400).json({ status: false, message: "Not enough stock" });

    const cart = await getOrCreateCart(req.user._id);
    const idx = cart.items.findIndex(i => String(i.product) === String(product._id));
    if (idx >= 0) {
      cart.items[idx].qty += qty;
      cart.items[idx].priceETB = product.priceETB;
    } else {
      cart.items.push({ product: product._id, farmer: product.farmer, qty, priceETB: product.priceETB });
    }

    cart.totalETB = cart.items.reduce((s, it) => s + it.qty * it.priceETB, 0);
    await cart.save();
    await cart.populate("items.product", "name priceETB");
    res.status(201).json({ status: true, cart });
  } catch (err) { next(err); }
};

export const checkout = async (req, res, next) => {
  try {
    const cart = await Order.findOne({ client: req.user._id, status: "pending" }).populate("items.product");
    if (!cart || cart.items.length === 0) return res.status(400).json({ status: false, message: "Cart empty" });

    let total = 0;
    for (const it of cart.items) {
      const fresh = await Product.findById(it.product._id);
      if (!fresh || !fresh.isActive) return res.status(400).json({ status: false, message: "Item unavailable" });
      if (fresh.quantity < it.qty) return res.status(400).json({ status: false, message: `Insufficient stock for ${fresh.name}` });
      it.priceETB = fresh.priceETB;
      it.farmer = fresh.farmer;
      total += it.qty * it.priceETB;
    }

    cart.totalETB = total;
    cart.status = "paid";
    cart.payment = { method: "mock", txRef: `TX-${Date.now()}`, paidAt: new Date(), currency: "ETB" };
    await cart.save();

    for (const it of cart.items) {
      await Product.updateOne({ _id: it.product }, { $inc: { quantity: -it.qty } });
    }

    const sums = {};
    for (const it of cart.items) {
      const fid = String(it.farmer);
      sums[fid] = (sums[fid] || 0) + it.qty * it.priceETB;
    }
    const updates = Object.entries(sums).map(([fid, amt]) => User.updateOne({ _id: fid }, { $inc: { balanceETB: amt } }));
    await Promise.all(updates);

    res.json({ status: true, message: "Order paid (mock ETB)", order: cart });
  } catch (err) { next(err); }
};

export const myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ client: req.user._id, status: { $ne: "pending" } }).sort({ createdAt: -1 });
    res.json({ status: true, orders });
  } catch (err) { next(err); }
};

export const farmerEarnings = async (req, res, next) => {
  try {
    const balance = req.user.balanceETB || 0;
    const recent = await Order.aggregate([
      { $match: { status: "paid" } },
      { $unwind: "$items" },
      { $match: { "items.farmer": req.user._id } },
      { $project: { createdAt: 1, amountETB: { $multiply: ["$items.qty", "$items.priceETB"] }, product: "$items.product", qty: "$items.qty", priceETB: "$items.priceETB" } },
      { $sort: { createdAt: -1 } },
      { $limit: 20 }
    ]);
    res.json({ status: true, balanceETB: balance, recent });
  } catch (err) { next(err); }
};
