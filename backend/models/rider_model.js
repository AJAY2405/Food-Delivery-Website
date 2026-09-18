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


    isAvailable: { type: Boolean, default: false },


    currentLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date, default: null },
    },

    totalDeliveries: { type: Number, default: 0 },
    rating: { type: Number, default: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Rider = mongoose.model("Rider", riderSchema);
