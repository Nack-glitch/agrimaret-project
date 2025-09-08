import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { addToCart, viewCart, checkout, myOrders, farmerEarnings } from "../controllers/orderController.js";

const router = express.Router();

router.use(protect);

router.get("/cart", viewCart);        
router.post("/cart", addToCart);      
router.post("/checkout", checkout);    
router.get("/my-orders", myOrders);   
router.get("/earnings", requireRole("farmer"), farmerEarnings); 

export default router;
