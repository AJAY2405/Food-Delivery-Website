import express from "express";
import { submitRating, getRatingsForOrder, getFoodRatings } from "../controller/ratingController.js";
import { isAuthenticated } from "../middlewires/isAuthenticated.js";

const router = express.Router();

router.post("/submit", isAuthenticated, submitRating);
router.get("/order/:orderId", isAuthenticated, getRatingsForOrder);
router.get("/food/:foodId", isAuthenticated, getFoodRatings); // ← new


export default router;