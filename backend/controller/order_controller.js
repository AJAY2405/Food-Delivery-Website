// controllers/order_controller.js
import Order from "../models/order_model.js";
import { getIO } from "../utils/socket.js";

export const getRestaurantOrders = async (req, res) => {
  try {
    const restaurantId = req.userId;

    const orders = await Order.find({ restaurant: restaurantId })
      .populate("customer", "username email phone address")
      .populate("rider", "username phone vehicleType vehicleNumber")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("getRestaurantOrders error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ── Restaurant accepts a newly placed order ── */
export const acceptOrder = async (req, res) => {
  try {
    const restaurantId = req.userId;
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurantId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "placed") {
      return res.status(400).json({
        success: false,
        message: `Cannot accept an order that is already "${order.status}"`,
      });
    }

    order.status = "confirmed";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order accepted",
      order,
    });
  } catch (error) {
    console.error("acceptOrder error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ── Restaurant rejects an order before it's been prepared ── */
export const rejectOrder = async (req, res) => {
  try {
    const restaurantId = req.userId;
    const { orderId } = req.params;

    const REJECTABLE_STATUSES = ["placed", "confirmed"];

    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurantId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!REJECTABLE_STATUSES.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reject an order that is already "${order.status}"`,
      });
    }

    order.status = "cancelled";
    order.cancelledBy = "restaurant";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order rejected",
      order,
    });
  } catch (error) {
    console.error("rejectOrder error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
  Restaurant-controlled statuses only go up to "ready_for_pickup".
  From there, a rider claims the order (via riderController.pickOrder),
  which is what actually flips it to "out_for_delivery" — and only the
  assigned rider can later mark it "delivered". This keeps a single
  writer for each transition instead of both the restaurant and the
  rider racing to update the same field.
*/
export const updateOrderStatus = async (req, res) => {
  try {
    const restaurantId = req.userId;
    const { orderId } = req.params;
    const { status } = req.body;

    const RESTAURANT_SETTABLE = ["confirmed", "preparing", "ready_for_pickup", "cancelled"];

    if (!status || !RESTAURANT_SETTABLE.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Restaurants can set: ${RESTAURANT_SETTABLE.join(", ")}. Delivery pickup and drop-off are handled by the rider.`,
      });
    }

    /* Make sure the order belongs to this restaurant */
    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurantId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /* Prevent updating terminal / rider-owned statuses */
    if (["delivered", "cancelled", "out_for_delivery"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${order.status} order`,
      });
    }

    if (order.status === "placed" && !["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Order must be accepted before it can be moved to "${status}"`,
      });
    }

    order.status = status;
    if (status === "cancelled") order.cancelledBy = "restaurant";
    await order.save();

    // Food's packed and waiting — let every online rider know.
    if (status === "ready_for_pickup") {
      getIO().to("riders").emit("order:ready", { orderId: order._id });
    }

    getIO().to(`order_${order._id}`).emit("order:status", {
      orderId: order._id,
      status: order.status,
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.userId;

    const orders = await Order.find({ customer: customerId })
      .populate("restaurant", "username restaurantName photoUrl avatar")
      .populate("rider", "username phone vehicleType vehicleNumber avatar photoUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("getCustomerOrders error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const customerId = req.userId;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, customer: customerId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Customer can still back out any time before a rider has physically
    // picked the food up — once it's "out_for_delivery" it's too late.
    const CANCELLABLE = ["placed", "confirmed", "preparing", "ready_for_pickup"];
    if (!CANCELLABLE.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order that is already "${order.status}"`,
      });
    }

    order.status = "cancelled";
    order.cancelledBy = "customer";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("cancelOrder error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
