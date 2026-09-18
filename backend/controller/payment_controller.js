// controllers/payment.controller.js
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/order_model.js";
import { Cart } from "../models/cart_model.js";
import { User } from "../models/user_model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const customerId = req.userId;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay env vars missing");
      return res.status(500).json({
        success: false,
        message: "Payment not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env",
      });
    }

    const { amount } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const user = await User.findById(customerId).select("username email phone");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      // userId in notes is what lets the webhook recover the order later
      // if the client disappears (refresh/crash) before /verify runs.
      notes: { userId: customerId.toString() },
    });

    return res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      userName: user.username || "",
      userEmail: user.email || "",
      userPhone: user.phone || "",
    });
  } catch (error) {
    console.error("createOrder error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};



const placeOrderFromCart = async ({
  customerId,
  razorpayOrderId,
  razorpayPaymentId,
  deliveryAddress,
}) => {
  // If an order already exists for this Razorpay order, just reuse it
  // instead of creating a duplicate.
  const existing = await Order.findOne({ razorpayOrderId });
  if (existing) return existing;

  const cart = await Cart.findOne({ customer: customerId }).populate([
    { path: "items.food", select: "name price image type isAvailable" },
    { path: "restaurant", select: "username restaurantName" },
  ]);

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart not found or already empty");
  }

  const deliveryFee = 30;
  let subtotal = 0;

  const orderItems = cart.items.map((item) => {
    subtotal += item.priceAtAdd * item.quantity;
    return {
      food: item.food._id,
      name: item.food.name,
      quantity: item.quantity,
      price: item.priceAtAdd,
    };
  });

  let resolvedAddress = deliveryAddress?.trim();
  if (!resolvedAddress) {
    const user = await User.findById(customerId).select("address");
    resolvedAddress = user?.address || "";
  }

  let order;
  try {
    order = await Order.create({
      customer: customerId,
      restaurant: cart.restaurant._id,
      items: orderItems,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      razorpayOrderId,
      razorpayPaymentId,
      status: "placed",
      deliveryAddress: resolvedAddress,
    });
  } catch (err) {
    // Race guard: webhook and /verify fired at nearly the same time and
    // both tried to create the order. Whoever lost, just reuse the winner.
    // Requires a unique index on razorpayOrderId in the Order model.
    if (err.code === 11000) {
      const winner = await Order.findOne({ razorpayOrderId });
      if (winner) return winner;
    }
    throw err;
  }

  cart.items = [];
  cart.restaurant = null;
  await cart.save();

  return order;
};

export const verifyPayment = async (req, res) => {
  try {
    const customerId = req.userId;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      deliveryAddress,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment signature mismatch",
      });
    }

    const order = await placeOrderFromCart({
      customerId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      deliveryAddress,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed",
      orderId: order._id,
    });
  } catch (error) {
    console.error("verifyPayment error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────────────────────────── */
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.error("RAZORPAY_WEBHOOK_SECRET missing from .env");
      return res.status(500).json({ success: false, message: "Webhook not configured" });
    }

    if (!signature) {
      return res.status(400).json({ success: false, message: "Missing signature" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("Webhook signature mismatch — possible spoofed request");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      let order = await Order.findOne({ razorpayOrderId });

      if (order) {
        if (order.paymentStatus !== "paid") {
          order.paymentStatus = "paid";
          order.razorpayPaymentId = payment.id;
          await order.save();
          console.log(`Webhook confirmed payment for order ${order._id}`);
        }
      } else {
        // /verify never ran (e.g. user refreshed mid-payment). Recover
        // using the userId we stored in notes when the Razorpay order
        // was created, and rebuild the order from their (still-intact) cart.
        try {
          const rzpOrder = await razorpay.orders.fetch(razorpayOrderId);
          const customerId = rzpOrder.notes?.userId;

          if (!customerId) {
            console.warn(
              `Webhook: no userId in notes for ${razorpayOrderId}, cannot auto-recover — needs manual reconciliation`
            );
          } else {
            order = await placeOrderFromCart({
              customerId,
              razorpayOrderId,
              razorpayPaymentId: payment.id,
            });
            console.log(`Webhook recovered order ${order._id} after missed /verify`);
          }
        } catch (recoveryErr) {
          console.error(
            `Webhook recovery failed for ${razorpayOrderId}:`,
            recoveryErr.message
          );
        }
      }
    }

    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const order = await Order.findOne({ razorpayOrderId: payment.order_id });
      if (order && order.paymentStatus !== "paid") {
        order.paymentStatus = "failed";
        await order.save();
      }
      console.log(`Webhook: payment failed for Razorpay order ${payment.order_id}`);
    }

    // Always respond 200 quickly so Razorpay doesn't retry unnecessarily.
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("handleRazorpayWebhook error:", error);
    return res.status(200).json({ received: true, note: "processed with errors" });
  }
};