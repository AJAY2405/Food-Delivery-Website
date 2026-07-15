// controller/riderController.js
import Order from "../models/order_model.js";
import { Rider } from "../models/rider_model.js";
import { User } from "../models/user_model.js";
import { getIO } from "../utils/socket.js";

/* Small helper — every rider action needs their Rider profile doc,
   so just-in-time create it the first time it's touched. */
const getOrCreateRiderDoc = async (userId) => {
  let rider = await Rider.findOne({ userId });
  if (!rider) {
    rider = await Rider.create({ userId });
  }
  return rider;
};

/**
 * Rider flips themself online/offline. Only "available" riders show up
 * as eligible to receive orders (available-orders is a shared feed
 * either way, but this gates whether they've opted in for the day).
 */
export const toggleAvailability = async (req, res) => {
  try {
    const riderId = req.userId;
    const { isAvailable } = req.body;

    const rider = await getOrCreateRiderDoc(riderId);
    rider.isAvailable = !!isAvailable;
    await rider.save();

    return res.status(200).json({
      success: true,
      message: rider.isAvailable ? "You're online" : "You're offline",
      isAvailable: rider.isAvailable,
    });
  } catch (error) {
    console.error("toggleAvailability error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Orders the restaurant has packed and left at the counter, not yet
 * claimed by anyone. This is the feed every online rider polls / listens
 * to over sockets.
 */
export const getAvailableOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "ready_for_pickup", rider: null })
      .populate("restaurant", "username restaurantName address latitude longitude phone")
      .populate("customer", "username phone")
      .sort({ updatedAt: 1 }); // oldest-waiting first

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("getAvailableOrders error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Claim an order. This is the one place that has to be race-safe:
 * two riders can tap "Pick up" on the same order within milliseconds
 * of each other. findOneAndUpdate with `rider: null` in the filter is
 * atomic at the DB level — only the first request to reach Mongo wins,
 * the second gets back null and a clean "already picked" response.
 */
export const pickOrder = async (req, res) => {
  try {
    const riderId = req.userId;
    const { orderId } = req.params;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, status: "ready_for_pickup", rider: null },
      {
        rider: riderId,
        status: "out_for_delivery",
        pickedAt: new Date(),
      },
      { new: true }
    )
      .populate("customer", "username phone addresses")
      .populate("restaurant", "username restaurantName address latitude longitude phone");

    if (!order) {
      return res.status(409).json({
        success: false,
        message: "This order was already picked up by another rider",
      });
    }

    // Tell every other rider watching the feed to remove this card.
    getIO().to("riders").emit("order:claimed", { orderId: order._id });

    // Tell the customer (and anyone already viewing the order) that a
    // rider is assigned, so the UI can switch to "Track Rider".
    getIO().to(`order_${order._id}`).emit("order:status", {
      orderId: order._id,
      status: "out_for_delivery",
    });

    return res.status(200).json({
      success: true,
      message: "Order picked up",
      order,
    });
  } catch (error) {
    console.error("pickOrder error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** Orders this rider currently has out for delivery. */
export const getActiveOrders = async (req, res) => {
  try {
    const riderId = req.userId;

    const orders = await Order.find({ rider: riderId, status: "out_for_delivery" })
      .populate("customer", "username phone addresses")
      .populate("restaurant", "username restaurantName address latitude longitude phone")
      .sort({ pickedAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("getActiveOrders error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** Full detail for one order — used by the rider's OrderDetails screen. */
export const getOrderDetails = async (req, res) => {
  try {
    const riderId = req.userId;
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      $or: [{ rider: riderId }, { rider: null, status: "ready_for_pickup" }],
    })
      .populate("customer", "username phone addresses")
      .populate("restaurant", "username restaurantName address latitude longitude phone");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("getOrderDetails error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** Rider marks an order as handed to the customer. */
export const markDelivered = async (req, res) => {
  try {
    const riderId = req.userId;
    const { orderId } = req.params;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, rider: riderId, status: "out_for_delivery" },
      { status: "delivered", deliveredAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not assigned to you",
      });
    }

    await Rider.findOneAndUpdate(
      { userId: riderId },
      { $inc: { totalDeliveries: 1 } }
    );

    getIO().to(`order_${order._id}`).emit("order:status", {
      orderId: order._id,
      status: "delivered",
    });

    return res.status(200).json({
      success: true,
      message: "Order marked as delivered",
      order,
    });
  } catch (error) {
    console.error("markDelivered error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * REST fallback for pushing a location update (the primary path is the
 * "rider:location" socket event in utils/socket.js — this exists for
 * clients that poll instead of holding a socket open, and to persist
 * the latest point so a customer who loads the page mid-delivery still
 * sees a starting position before the next socket tick arrives).
 */
export const updateLocation = async (req, res) => {
  try {
    const riderId = req.userId;
    const { lat, lng, orderId } = req.body;

    if (lat == null || lng == null) {
      return res.status(400).json({ success: false, message: "lat and lng are required" });
    }

    await Rider.findOneAndUpdate(
      { userId: riderId },
      { currentLocation: { lat, lng, updatedAt: new Date() } },
      { upsert: true }
    );

    if (orderId) {
      getIO().to(`order_${orderId}`).emit("rider:location", {
        orderId,
        lat,
        lng,
        riderId,
        updatedAt: new Date(),
      });
    }

    return res.status(200).json({ success: true, message: "Location updated" });
  } catch (error) {
    console.error("updateLocation error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** Delivered orders for this rider, most recent first. */
export const getDeliveryHistory = async (req, res) => {
  try {
    const riderId = req.userId;

    const orders = await Order.find({ rider: riderId, status: "delivered" })
      .populate("customer", "username")
      .populate("restaurant", "username restaurantName")
      .sort({ deliveredAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("getDeliveryHistory error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** Combined User + Rider profile info. */
export const getRiderProfile = async (req, res) => {
  try {
    const riderId = req.userId;

    const user = await User.findById(riderId).select("-password -otp -otpExpiry");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const rider = await getOrCreateRiderDoc(riderId);

    return res.status(200).json({ success: true, user, rider });
  } catch (error) {
    console.error("getRiderProfile error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** Update vehicle info / avatar. */
export const updateRiderProfile = async (req, res) => {
  try {
    const riderId = req.userId;
    const { username, vehicleType, vehicleNumber } = req.body;

    const user = await User.findById(riderId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (username) user.username = username;
    if (vehicleType) user.vehicleType = vehicleType;
    if (vehicleNumber) user.vehicleNumber = vehicleNumber;
    await user.save();

    const rider = await getOrCreateRiderDoc(riderId);
    if (vehicleType) rider.vehicleType = vehicleType;
    if (vehicleNumber) rider.vehicleNumber = vehicleNumber;
    await rider.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
      rider,
    });
  } catch (error) {
    console.error("updateRiderProfile error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
