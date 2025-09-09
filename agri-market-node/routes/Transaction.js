import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ client: req.user.id });
    res.status(200).json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

export default router;
