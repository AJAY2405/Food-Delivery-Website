import mongoose from "mongoose";
import Rating from "../models/rating_model.js";
import Order from "../models/order_model.js";
import { Food } from "../models/food_model.js";

const recalculateFoodRating = async (foodId) => {
  const foodObjectId = new mongoose.Types.ObjectId(foodId); // ← cast explicitly

  const stats = await Rating.aggregate([
    { $match: { food: foodObjectId } },
    { $group: { _id: "$food", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};
  await Food.findByIdAndUpdate(foodId, {
    rating: Math.round(avg * 10) / 10,
    numRatings: count,
  });
};

/**
 * Customer rates (or edits their rating for) a food item —
 * only allowed once the order containing it is delivered.
 */
export const submitRating = async (req, res) => {
  try {
    const customerId = req.userId;
    const { foodId, orderId, rating, review } = req.body;

    if (!foodId || !orderId || !rating) {
      return res.status(400).json({
        success: false,
        message: "foodId, orderId and rating are required",
      });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const order = await Order.findOne({ _id: orderId, customer: customerId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.status !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "You can only rate items from delivered orders",
      });
    }

    const itemInOrder = order.items.some((i) => i.food.toString() === foodId);
    if (!itemInOrder) {
      return res.status(400).json({
        success: false,
        message: "This item is not part of the order",
      });
    }

    const ratingDoc = await Rating.findOneAndUpdate(
      { food: foodId, customer: customerId, order: orderId },
      { rating, review: review || "" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await recalculateFoodRating(foodId);

    return res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      rating: ratingDoc,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get the logged-in customer's own ratings for a given order,
 * so the frontend can show "Rate" vs "Edit rating" per item.
 */
export const getRatingsForOrder = async (req, res) => {
  try {
    const customerId = req.userId;
    const { orderId } = req.params;

    const ratings = await Rating.find({ order: orderId, customer: customerId });

    const map = {};
    ratings.forEach((r) => {
      map[r.food.toString()] = { rating: r.rating, review: r.review };
    });

    return res.status(200).json({ success: true, ratings: map });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getFoodRatings = async (req, res) => {
  try {
    const { foodId } = req.params;

    const ratings = await Rating.find({ food: foodId })
      .populate("customer", "username")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, ratings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};