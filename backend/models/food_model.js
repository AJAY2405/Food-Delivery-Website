import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    category: { type: String, default: "Main Course" }, 
    type: {
      type: String,
      enum: ["veg", "non-veg"],
      required: true,
    },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },       // ← new: average rating
    numRatings: { type: Number, default: 0 }, 
  },
  { timestamps: true }
);

export const Food = mongoose.model("Food", foodSchema);
