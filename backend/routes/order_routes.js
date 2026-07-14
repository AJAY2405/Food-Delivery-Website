
// routes/order_routes.js
import express from "express";
import {
  getRestaurantOrders,
  updateOrderStatus,
  acceptOrder,
  rejectOrder,
  getCustomerOrders,
  cancelOrder,
} from "../controller/order_controller.js";
import { isAuthenticated } from "../middlewires/isAuthenticated.js";

const router = express.Router();

/* ── Restaurant routes ── */
// GET   /api/v1/order/restaurant-orders          → all orders for this restaurant
router.get("/restaurant-orders", isAuthenticated, getRestaurantOrders);

router.patch("/restaurant/:orderId/accept", isAuthenticated, acceptOrder);

router.patch("/restaurant/:orderId/reject", isAuthenticated, rejectOrder);

router.patch("/restaurant/:orderId/status", isAuthenticated, updateOrderStatus);

router.get("/my-orders", isAuthenticated, getCustomerOrders);

router.patch("/cancel/:orderId", isAuthenticated, cancelOrder);

export default router;