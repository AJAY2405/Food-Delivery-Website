// import { User } from "../models/user_model.js";
// import getDataUri from "../utils/dataUri.js";
// import cloudinary from "../utils/cloudinary.js";


// export const updateRestaurantProfile = async (req, res) => {
//   try {
//     const userId = req.userId;
//     const {
//       restaurantName,
//       restaurantDescription,
//       cuisine,
//       openingTime,
//       closingTime,
//       isOpen,
//       address,
//       phone,
//     } = req.body;
//     const file = req.file;

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     if (user.role !== "restaurant") {
//       return res.status(403).json({
//         success: false,
//         message: "Only restaurant accounts can update restaurant profile",
//       });
//     }

//     if (restaurantName !== undefined) user.restaurantName = restaurantName;
//     if (restaurantDescription !== undefined)
//       user.restaurantDescription = restaurantDescription;
//     if (cuisine !== undefined) user.cuisine = cuisine;
//     if (openingTime !== undefined) user.openingTime = openingTime;
//     if (closingTime !== undefined) user.closingTime = closingTime;
//     if (isOpen !== undefined) user.isOpen = isOpen;
//     if (address !== undefined) user.address = address;

//     // if (phone && phone !== user.phone) {
//     //   const phoneExists = await User.findOne({ phone });
//     //   if (phoneExists) {
//     //     return res.status(400).json({
//     //       success: false,
//     //       message: "Phone number already exists",
//     //     });
//     //   }
//     //   user.phone = phone;
//     // }

//     if (file) {
//       const fileUri = getDataUri(file);
//       const cloudResponse = await cloudinary.uploader.upload(fileUri, {
//         folder: "restaurant_profiles",
//       });
//       user.photoUrl = cloudResponse.secure_url;
//       user.avatar = cloudResponse.secure_url;
//     }

//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "Restaurant profile updated successfully",
//       user,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /**
//  * Get a single restaurant's public profile (used on customer-facing pages)
//  */
// export const getRestaurantProfile = async (req, res) => {
//   try {
//     const { restaurantId } = req.params;
//     const restaurant = await User.findOne({
//       _id: restaurantId,
//       role: "restaurant",
//     }).select(
//       "username restaurantName restaurantDescription cuisine openingTime closingTime isOpen address photoUrl avatar"
//     );

//     if (!restaurant) {
//       return res.status(404).json({
//         success: false,
//         message: "Restaurant not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       restaurant,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /**
//  * Get all restaurants (for browsing / sorting on the customer side)
//  */
// export const getAllRestaurants = async (req, res) => {
//   try {
//     const restaurants = await User.find({ role: "restaurant" })
//       .select(
//         "username restaurantName restaurantDescription cuisine openingTime closingTime isOpen address photoUrl avatar"
//       )
//       .sort({ restaurantName: 1 }); // alphabetical by restaurant name

//     return res.status(200).json({
//       success: true,
//       restaurants,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };




import { User } from "../models/user_model.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";

export const updateRestaurantProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      restaurantName,
      restaurantDescription,
      cuisine,
      openingTime,
      closingTime,
      isOpen,
      address,
      phone,
      latitude,
      longitude,
    } = req.body;
    const file = req.file;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "restaurant") {
      return res.status(403).json({
        success: false,
        message: "Only restaurant accounts can update restaurant profile",
      });
    }

    if (restaurantName !== undefined) user.restaurantName = restaurantName;
    if (restaurantDescription !== undefined)
      user.restaurantDescription = restaurantDescription;
    if (cuisine !== undefined) user.cuisine = cuisine;
    if (openingTime !== undefined) user.openingTime = openingTime;
    if (closingTime !== undefined) user.closingTime = closingTime;
    if (isOpen !== undefined) user.isOpen = isOpen;
    if (address !== undefined) user.address = address;

    // Coordinates are sent alongside the text address whenever the
    // restaurant uses "Use current location". Guard against empty
    // strings from FormData (multipart sends everything as strings,
    // and "" would otherwise pass the !== undefined check).
    if (latitude !== undefined && latitude !== "") {
      const lat = parseFloat(latitude);
      if (!Number.isNaN(lat)) user.latitude = lat;
    }
    if (longitude !== undefined && longitude !== "") {
      const lng = parseFloat(longitude);
      if (!Number.isNaN(lng)) user.longitude = lng;
    }

    // if (phone && phone !== user.phone) {
    //   const phoneExists = await User.findOne({ phone });
    //   if (phoneExists) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Phone number already exists",
    //     });
    //   }
    //   user.phone = phone;
    // }

    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri, {
        folder: "restaurant_profiles",
      });
      user.photoUrl = cloudResponse.secure_url;
      user.avatar = cloudResponse.secure_url;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Restaurant profile updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get a single restaurant's public profile (used on customer-facing pages)
 */
export const getRestaurantProfile = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await User.findOne({
      _id: restaurantId,
      role: "restaurant",
    }).select(
      "username restaurantName restaurantDescription cuisine openingTime closingTime isOpen address latitude longitude photoUrl avatar"
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all restaurants (for browsing / sorting on the customer side)
 */
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await User.find({ role: "restaurant" })
      .select(
        "username restaurantName restaurantDescription cuisine openingTime closingTime isOpen address latitude longitude photoUrl avatar"
      )
      .sort({ restaurantName: 1 }); // alphabetical by restaurant name

    return res.status(200).json({
      success: true,
      restaurants,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};