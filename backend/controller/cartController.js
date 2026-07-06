import { Cart } from "../models/cart_model.js";
import { Food } from "../models/food_model.js";
import { User } from "../models/user_model.js";


const buildCartResponse = async (cart) => {
  if (!cart) {
    return { items: [], restaurant: null, subtotal: 0, totalItems: 0 };
  }

  await cart.populate([
    {
      path: "items.food",
      select: "name price image type category isAvailable",
    },
    {
      path: "restaurant",
      select: "username restaurantName photoUrl avatar isOpen",
    },
  ]);

  let subtotal = 0;
  let totalItems = 0;

  const items = cart.items.map((item) => {
    const lineTotal = item.priceAtAdd * item.quantity;
    subtotal += lineTotal;
    totalItems += item.quantity;
    return {
      _id: item._id,
      food: item.food,
      quantity: item.quantity,
      priceAtAdd: item.priceAtAdd,
      lineTotal,
    };
  });

  return {
    _id: cart._id,
    restaurant: cart.restaurant,
    items,
    subtotal,
    totalItems,
  };
};

/**
 * Get the logged-in customer's cart
 */
export const getCart = async (req, res) => {
  try {
    const customerId = req.userId;
    const cart = await Cart.findOne({ customer: customerId });

    const data = await buildCartResponse(cart);

    return res.status(200).json({
      success: true,
      cart: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
 */
export const addToCart = async (req, res) => {
  try {
    const customerId = req.userId;
    const { foodId, quantity, replaceCart } = req.body;

    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: "Food item is required",
      });
    }

    const qty = Number(quantity) > 0 ? Number(quantity) : 1;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    if (!food.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This item is currently unavailable",
      });
    }

    let cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
      cart = await Cart.create({
        customer: customerId,
        restaurant: food.restaurant,
        items: [{ food: food._id, quantity: qty, priceAtAdd: food.price }],
      });
    } else if (
      cart.restaurant &&
      cart.restaurant.toString() !== food.restaurant.toString() &&
      cart.items.length > 0
    ) {
      // cart has items from a different restaurant
      if (!replaceCart) {
        return res.status(409).json({
          success: false,
          message:
            "Your cart has items from another restaurant. Replace cart to continue?",
          conflict: true,
        });
      }
      // replace cart with the new restaurant's item
      cart.restaurant = food.restaurant;
      cart.items = [
        { food: food._id, quantity: qty, priceAtAdd: food.price },
      ];
    } else {
      // same restaurant (or empty cart) - merge quantity if item exists
      const existingItem = cart.items.find(
        (item) => item.food.toString() === food._id.toString()
      );
      if (existingItem) {
        existingItem.quantity += qty;
      } else {
        cart.items.push({
          food: food._id,
          quantity: qty,
          priceAtAdd: food.price,
        });
      }
      cart.restaurant = food.restaurant;
    }

    await cart.save();
    const data = await buildCartResponse(cart);

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update quantity of a specific cart item (set to an exact number)
 */
export const updateCartItem = async (req, res) => {
  try {
    const customerId = req.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({ customer: customerId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    item.quantity = Number(quantity);
    await cart.save();

    const data = await buildCartResponse(cart);

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Remove a single item from the cart
 */
export const removeCartItem = async (req, res) => {
  try {
    const customerId = req.userId;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ customer: customerId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    item.deleteOne();

    // if cart is now empty, clear the restaurant lock too
    if (cart.items.length === 0) {
      cart.restaurant = null;
    }

    await cart.save();

    const data = await buildCartResponse(cart);

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Clear the entire cart
 */
export const clearCart = async (req, res) => {
  try {
    const customerId = req.userId;

    const cart = await Cart.findOne({ customer: customerId });
    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart already empty",
        cart: await buildCartResponse(null),
      });
    }

    cart.items = [];
    cart.restaurant = null;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart: await buildCartResponse(cart),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
