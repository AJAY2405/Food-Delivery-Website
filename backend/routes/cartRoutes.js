import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controller/cartController.js";
import { isAuthenticated } from "../middlewires/isAuthenticated.js";

const router = express.Router();

router.get("/", isAuthenticated, getCart);
router.post("/add", isAuthenticated, addToCart);
router.put("/item/:itemId", isAuthenticated, updateCartItem);
router.delete("/item/:itemId", isAuthenticated, removeCartItem);
router.delete("/clear", isAuthenticated, clearCart);

export default router;
