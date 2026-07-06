// import { Router } from "express";
// import { createOrder, verifyPayment } from "../controller/payment_controller.js";
// import { isAuthenticated } from "../middlewires/isAuthenticated.js";

// const router = Router();

// /* Both routes require a logged-in customer */
// // router.use(isAuthenticated);

// router.post("/create-order",isAuthenticated, createOrder);
// router.post("/verify",isAuthenticated, verifyPayment);

// export default router;




// routes/payment.routes.js
import express from "express";
import { createOrder, verifyPayment } from "../controller/payment_controller.js";
import { isAuthenticated } from "../middlewires/isAuthenticated.js";

const router = express.Router();

router.post("/create-order", isAuthenticated, createOrder);
router.post("/verify", isAuthenticated, verifyPayment);

export default router;