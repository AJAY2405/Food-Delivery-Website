import { Food } from "../models/food_model.js";
import { User } from "../models/user_model.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";


export const addFood = async (req, res) => {
  try {
    const restaurantId = req.userId;
    const { name, description, price, category, type, isAvailable } =
      req.body;
    const file = req.file;

    if (!name || !price || !type) {
      return res.status(400).json({
        success: false,
        message: "Name, price and type (veg/non-veg) are required",
      });
    }

    const restaurant = await User.findById(restaurantId);
    if (!restaurant || restaurant.role !== "restaurant") {
      return res.status(403).json({
        success: false,
        message: "Only restaurant accounts can add food items",
      });
    }

    let imageUrl = "";
    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri, {
        folder: "food_items",
      });
      imageUrl = cloudResponse.secure_url;
    }

    const food = await Food.create({
      restaurant: restaurantId,
      name,
      description,
      price,
      category,
      type,
      image: imageUrl,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    return res.status(201).json({
      success: true,
      message: "Food item added successfully",
      food,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


  // Edit an existing food item (restaurant only, must own the item)

export const editFood = async (req, res) => {
  try {
    const restaurantId = req.userId;
    const { foodId } = req.params;
    const { name, description, price, category, type, isAvailable } =
      req.body;
    const file = req.file;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    if (food.restaurant.toString() !== restaurantId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this food item",
      });
    }

    if (name !== undefined) food.name = name;
    if (description !== undefined) food.description = description;
    if (price !== undefined) food.price = price;
    if (category !== undefined) food.category = category;
    if (type !== undefined) food.type = type;
    if (isAvailable !== undefined) food.isAvailable = isAvailable;

    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri, {
        folder: "food_items",
      });
      food.image = cloudResponse.secure_url;
    }

    await food.save();

    return res.status(200).json({
      success: true,
      message: "Food item updated successfully",
      food,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


  // Delete a food item (restaurant only, must own the item)

export const deleteFood = async (req, res) => {
  try {
    const restaurantId = req.userId;
    const { foodId } = req.params;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    if (food.restaurant.toString() !== restaurantId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this food item",
      });
    }

    await food.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Food item deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//  Toggle / set availability of a food item quickly (restaurant only)

export const toggleFoodAvailability = async (req, res) => {
  try {
    const restaurantId = req.userId;
    const { foodId } = req.params;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    if (food.restaurant.toString() !== restaurantId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this food item",
      });
    }

    food.isAvailable = !food.isAvailable;
    await food.save();

    return res.status(200).json({
      success: true,
      message: `Food item marked as ${
        food.isAvailable ? "available" : "unavailable"
      }`,
      food,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


  // Get all food items for the logged-in restaurant (restaurant's own menu management)

export const getMyFoodItems = async (req, res) => {
  try {
    const restaurantId = req.userId;
    const foods = await Food.find({ restaurant: restaurantId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      foods,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//  Get all food items for ONE restaurant (public, customer-facing)

export const getFoodsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const foods = await Food.find({ restaurant: restaurantId }).sort({
      category: 1,
      name: 1,
    });

    return res.status(200).json({
      success: true,
      foods,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getAllFoodsGroupedByRestaurant = async (req, res) => {
  try {
    const restaurants = await User.find({ role: "restaurant" })
      .select(
       
        "username restaurantName photoUrl avatar cuisine isOpen openingTime closingTime address latitude longitude"
      )
      .sort({ restaurantName: 1 })
      .lean();

    const restaurantIds = restaurants.map((r) => r._id);

    const foods = await Food.find({
      restaurant: { $in: restaurantIds },
    }).lean();

    // group foods under their restaurant
    const grouped = restaurants.map((restaurant) => ({
      restaurant,
      foods: foods.filter(
        (f) => f.restaurant.toString() === restaurant._id.toString()
      ),
    }));

    return res.status(200).json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};





  // Get ALL food items across all restaurants
  // (used on Home Page / Explore Foods)
 
export const getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find()
      .populate(
        "restaurant",
        "restaurantName username photoUrl avatar cuisine isOpen openingTime closingTime address latitude longitude"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalFoods: foods.length,
      foods,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




// ── Add these two exports to foodController.js ──


  // Get a single food item by id (public, customer-facing detail page)

export const getFoodById = async (req, res) => {
  try {
    const { foodId } = req.params;

    const food = await Food.findById(foodId).populate(
      "restaurant",
      "restaurantName username photoUrl avatar cuisine isOpen openingTime closingTime address latitude longitude"
    );

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    return res.status(200).json({
      success: true,
      food,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getSimilarFoods = async (req, res) => {
  try {
    const { foodId } = req.params;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    
    const STOP_WORDS = new Set([
      "and", "with", "the", "of", "in", "special", "a", "an",
    ]);
    const words = food.name
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w.toLowerCase()));

    // Fallback for very short names (e.g. "Dosa") — just use the whole name.
    const searchWords = words.length > 0 ? words : [food.name];
    const regexes = searchWords.map(
      (w) => new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    );

    const foods = await Food.find({
      _id: { $ne: food._id },
      name: { $in: regexes },
    })
      .populate(
        "restaurant",
        "restaurantName username photoUrl avatar cuisine isOpen openingTime closingTime address latitude longitude"
      )
      .limit(8);

    return res.status(200).json({
      success: true,
      foods,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};