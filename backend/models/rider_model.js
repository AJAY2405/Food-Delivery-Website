// models/rider_model.js
import mongoose from "mongoose";


const riderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "bicycle", "car"],
      default: "bike",
    },
    vehicleNumber: { type: String, default: "" },
    licenseNumber: { type: String, default: "" },

    /* Rider must flip this on to receive orders in "Available Orders" */
    isAvailable: { type: Boolean, default: false },

    /* Live location — updated by the rider's app while a delivery is
       in progress (and optionally while just "online"). */
    currentLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date, default: null },
    },

    /* Denormalized stats, cheap to keep here instead of aggregating
       the Order collection on every profile view. */
    totalDeliveries: { type: Number, default: 0 },
    rating: { type: Number, default: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Rider = mongoose.model("Rider", riderSchema);
