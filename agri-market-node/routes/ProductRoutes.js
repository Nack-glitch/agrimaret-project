import express from "express";
import { getPublicProducts } from "../controllers/productController.js";

const router = express.Router();

router.get("/public", getPublicProducts);

export default router;
