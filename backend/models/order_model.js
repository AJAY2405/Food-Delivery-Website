// models/order.model.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],

    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 30 },
    total: { type: Number, required: true },

    status: {
      type: String,
      enum: ["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
      default: "placed",
    },

    /* Only set when status === "cancelled" — tells us whether the
       customer backed out or the restaurant rejected the order, so
       the UI can show the right message on either side. */
    cancelledBy: {
      type: String,
      enum: ["customer", "restaurant"],
      default: null,
    },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      default: "razorpay",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },

    deliveryAddress: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);