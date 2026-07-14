// scripts/backfillFoodRatings.js
import Rating from "../models/rating_model.js";
import { Food } from "../models/food_model.js";

export const backfillFoodRatings = async () => {
  try {
    const stats = await Rating.aggregate([
      { $group: { _id: "$food", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    for (const s of stats) {
      await Food.findByIdAndUpdate(s._id, {
        rating: Math.round(s.avg * 10) / 10,
        numRatings: s.count,
      });
      console.log(`Updated food ${s._id}: rating=${s.avg}, count=${s.count}`);
    }

    console.log(`✅ Backfill complete — ${stats.length} food item(s) updated`);
  } catch (err) {
    console.error("❌ Backfill error:", err.message);
  }
};