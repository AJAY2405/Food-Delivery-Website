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



    //  /* ── Idempotency guard ──
    //    If the webhook already created/updated an order for this
    //    razorpay_order_id (e.g. it arrived slightly before this request,
    //    or the customer double-clicked something client-side), don't
    //    create a second order for the same payment. */
    // const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    // if (existingOrder) {
    //   return res.status(200).json({
    //     success: true,
    //     message: "Order already placed for this payment",
    //     orderId: existingOrder._id,
    //   });
    // }


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





  // ──────────────────────────────────────────────────────────────── */
// export const handleRazorpayWebhook = async (req, res) => {
//   try {
//     const signature = req.headers["x-razorpay-signature"];
 
//     if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
//       console.error(" RAZORPAY_WEBHOOK_SECRET missing from .env");
//       return res.status(500).json({ success: false, message: "Webhook not configured" });
//     }
 
//     if (!signature) {
//       return res.status(400).json({ success: false, message: "Missing signature" });
//     }
 
//     // req.body is a raw Buffer here because of express.raw() in app.js —
//     // do NOT JSON.parse before verifying, the signature is computed over
//     // the exact raw bytes Razorpay sent.
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
//       .update(req.body)
//       .digest("hex");
 
//     if (expectedSignature !== signature) {
//       console.warn(" Webhook signature mismatch — possible spoofed request");
//       return res.status(400).json({ success: false, message: "Invalid signature" });
//     }
 
//     const event = JSON.parse(req.body.toString());
 
//     if (event.event === "payment.captured") {
//       const payment = event.payload.payment.entity;
//       const razorpayOrderId = payment.order_id;
 
//       const order = await Order.findOne({ razorpayOrderId });
 
//       if (order) {
//         // Idempotent: only touch the DB if it isn't already marked paid,
//         // since Razorpay can and will send the same event more than once.
//         if (order.paymentStatus !== "paid") {
//           order.paymentStatus = "paid";
//           order.razorpayPaymentId = payment.id;
//           await order.save();
//           console.log(` Webhook confirmed payment for order ${order._id}`);
//         }
//       } else {
//         // The webhook arrived before /verify finished creating the order
//         // (normal race condition — webhooks are often fast) or /verify
//         // never ran at all (browser closed, network dropped, etc).
//         // The cart-based order-creation logic lives in verifyPayment and
//         // needs the customer's live cart, which isn't available here, so
//         // we can't safely reconstruct the order from the webhook alone.
//         // Flagging it for follow-up instead of silently dropping it:
//         console.warn(
//           ` Webhook received payment.captured for Razorpay order ${razorpayOrderId} ` +
//           `but no matching Order exists yet. If /verify never runs, this needs manual reconciliation.`
//         );
//         // Optional: persist this to a "pendingReconciliation" collection,
//         // or notify an admin (email/Slack) so it doesn't get lost.
//       }
//     }
 
//     if (event.event === "payment.failed") {
//       const payment = event.payload.payment.entity;
//       const order = await Order.findOne({ razorpayOrderId: payment.order_id });
//       if (order && order.paymentStatus !== "paid") {
//         order.paymentStatus = "failed";
//         await order.save();
//       }
//       console.log(` Webhook: payment failed for Razorpay order ${payment.order_id}`);
//     }
 
//     // Always respond 200 quickly so Razorpay doesn't retry unnecessarily.
//     return res.status(200).json({ received: true });
//   } catch (error) {
//     console.error(" handleRazorpayWebhook error:", error);
//     // Still return 200 here if the error is on our side after verifying
//     // the signature, so Razorpay doesn't hammer retries for a bug that
//     // won't fix itself. If you'd rather get retries, use 500 instead.
//     return res.status(200).json({ received: true, note: "processed with errors" });
//   }
// };
 