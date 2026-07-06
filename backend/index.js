import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user_routes.js"; // ✅ Importing routes
import cartRoute from "./routes/cartRoutes.js";
import restaurantRoute from "./routes/restaurantRoutes.js";
import paymentRoutes from "./routes/payment_routes.js";
import orderRouter from "./routes/order_routes.js";


const app = express();

connectDB();

app.use(express.json()); 

app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}))

app.get("/", (req, res) => {
    res.send("CORS enabled backend running 🚀123");
});


app.use("/api/v1/user", userRoutes); 
// app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/restaurant", restaurantRoute);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/order", orderRouter);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));