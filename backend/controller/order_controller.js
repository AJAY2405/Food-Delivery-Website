// controllers/order_controller.js
import Order from "../models/order_model.js";

export const getRestaurantOrders = async (req, res) => {
  try {
    const restaurantId = req.userId;

    const orders = await Order.find({ restaurant: restaurantId })
      .populate("customer", "username email phone address")
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

export const updateOrderStatus = async (req, res) => {
  try {
    const restaurantId = req.userId;
    const { orderId } = req.params;
    const { status } = req.body;

    const VALID_STATUSES = [
      "placed",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
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

    /* Prevent updating terminal statuses */
    if (order.status === "delivered" || order.status === "cancelled") {
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
    await order.save();

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
 
    const CANCELLABLE = ["placed", "confirmed"];
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