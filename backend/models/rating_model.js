import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: "" },
  },
  { timestamps: true }
);

ratingSchema.index({ food: 1, customer: 1, order: 1 }, { unique: true });

export default mongoose.model("Rating", ratingSchema);