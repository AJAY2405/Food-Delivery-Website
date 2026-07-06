import express from "express";
import {
  updateRestaurantProfile,
  getRestaurantProfile,
  getAllRestaurants,
} from "../controller/restaurantProfileController.js";
import {
  addFood,
  editFood,
  deleteFood,
  toggleFoodAvailability,
  getMyFoodItems,
  getFoodsByRestaurant,
  getAllFoodsGroupedByRestaurant,
  getAllFoods,
} from "../controller/foodController.js";
import { isAuthenticated } from "../middlewires/isAuthenticated.js";
import { singleUpload } from "../middlewires/multer.js";

const router = express.Router();


router.put(
  "/profile/update",
  isAuthenticated,
  singleUpload,
  updateRestaurantProfile
);
router.get("/all", getAllRestaurants); 
router.get("/:restaurantId", getRestaurantProfile); 

router.post("/food/add", isAuthenticated, singleUpload, addFood);
router.put("/food/edit/:foodId", isAuthenticated, singleUpload, editFood);
router.delete("/food/delete/:foodId", isAuthenticated, deleteFood);
router.patch(
  "/food/toggle/:foodId",
  isAuthenticated,
  toggleFoodAvailability
);
router.get("/food/my-items", isAuthenticated, getMyFoodItems);

router.get("/food/by-restaurant/:restaurantId", getFoodsByRestaurant);
router.get("/food/all-grouped", getAllFoodsGroupedByRestaurant);
router.get("/food/all", getAllFoods);
// router.get("/food/:foodId", isAuthenticated, getFoodById);


export default router;
