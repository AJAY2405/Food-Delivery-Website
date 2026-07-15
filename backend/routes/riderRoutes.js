// routes/riderRoutes.js
import express from "express";
import { isAuthenticated } from "../middlewires/isAuthenticated.js";
import { checkRole } from "../middlewires/checkRole.js";
import {
  toggleAvailability,
  getAvailableOrders,
  pickOrder,
  getActiveOrders,
  getOrderDetails,
  markDelivered,
  updateLocation,
  getDeliveryHistory,
  getRiderProfile,
  updateRiderProfile,
} from "../controller/riderController.js";

const router = express.Router();

// Every route here requires a logged-in user with role "rider"
router.use(isAuthenticated, checkRole("rider"));

router.patch("/availability", toggleAvailability);

router.get("/orders/available", getAvailableOrders);
router.patch("/orders/:orderId/pick", pickOrder);
router.get("/orders/active", getActiveOrders);
router.get("/orders/history", getDeliveryHistory);
router.get("/orders/:orderId", getOrderDetails);
router.patch("/orders/:orderId/deliver", markDelivered);

router.patch("/location", updateLocation);

router.get("/profile", getRiderProfile);
router.patch("/profile", updateRiderProfile);

export default router;
