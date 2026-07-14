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
      console.error(" Razorpay env vars missing");
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
    console.error(" createOrder error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
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

    /* ── Fetch cart ── */
    const cart = await Cart.findOne({ customer: customerId }).populate([
      { path: "items.food", select: "name price image type isAvailable" },
      { path: "restaurant", select: "username restaurantName" },
    ]);

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart not found or already empty",
      });
    }

    /* ── Compute totals ── */
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

    /* ── Fall back to the customer's saved profile address if the
       checkout request didn't include one for some reason ── */
    let resolvedAddress = deliveryAddress?.trim();
    if (!resolvedAddress) {
      const user = await User.findById(customerId).select("address");
      resolvedAddress = user?.address || "";
    }

    /* ── Save order ── */
    const order = await Order.create({
      customer: customerId,
      restaurant: cart.restaurant._id,
      items: orderItems,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: "placed",
      deliveryAddress: resolvedAddress, // ← this line was missing entirely
    });

    /* ── Clear cart ── */
    cart.items = [];
    cart.restaurant = null;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed",
      orderId: order._id,
    });
  } catch (error) {
    console.error(" verifyPayment error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};