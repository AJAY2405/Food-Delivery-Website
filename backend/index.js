import dns from "node:dns";
import net from "node:net";                    // ← new import

dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily(false); 

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user_routes.js"; // ✅ Importing routes
import cartRoute from "./routes/cartRoutes.js";
import restaurantRoute from "./routes/restaurantRoutes.js";
import paymentRoutes from "./routes/payment_routes.js";
import orderRouter from "./routes/order_routes.js";
import ratingRoute from "./routes/rating_route.js"
import { backfillFoodRatings } from "./scripts/backfillFoodRatings.js";
import { initSocket } from "./utils/socket.js";
import riderRoutes from "./routes/riderRoutes.js";
import { createServer } from "http";



const app = express();

connectDB();

backfillFoodRatings();

app.use(express.json()); 

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://food-delivery-website-gules.vercel.app",
    ],
    credentials: true,
  })
);

app.get("/", (req, res) => {
    res.send("CORS enabled backend running 🚀123");
});


app.use("/api/v1/user", userRoutes); 
// app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/restaurant", restaurantRoute);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/rating", ratingRoute);
app.use("/api/v1/rider", riderRoutes);


const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
initSocket(httpServer);


httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));