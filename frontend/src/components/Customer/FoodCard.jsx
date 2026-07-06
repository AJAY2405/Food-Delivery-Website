import React from "react";
import { ShoppingCart, Store, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const FoodCard = ({ food, onAddToCart }) => {
  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden border shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
        !food.isAvailable && "opacity-70"
      }`}
    >
      {/* ================= Food Image ================= */}
      <div className="relative">
        <img
          src={food.image || "https://placehold.co/500x300?text=Food"}
          alt={food.name}
          className="w-full h-52 object-cover"
        />

        {/* Veg / Non-Veg */}
        <span
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${
            food.type?.toLowerCase() === "veg"
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          {food.type?.toLowerCase() === "veg" ? "🟢 Veg" : "🔴 Non-Veg"}
        </span>

        {/* Availability */}
        <span
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
            food.isAvailable
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {food.isAvailable ? "Available" : "Unavailable"}
        </span>
      </div>

      {/* ================= Card Body ================= */}
      <div className="p-4">

        {/* Restaurant */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold text-orange-600">
              {food.restaurant?.restaurantName ||
                food.restaurant?.username ||
                "Restaurant"}
            </span>
          </div>

          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              food.restaurant?.isOpen
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {food.restaurant?.isOpen ? "Open" : "Closed"}
          </span>
        </div>

        {/* Food Name */}
        <h2 className="text-lg font-bold text-gray-800 truncate">
          {food.name}
        </h2>

        {/* Category */}
        <p className="text-sm text-gray-500 mt-1">
          {food.category}
        </p>

        {/* Description */}
        {food.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {food.description}
          </p>
        )}

        {/* Cuisine */}
        {food.restaurant?.cuisine && (
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            {food.restaurant.cuisine}
          </div>
        )}

        {/* Bottom */}
        <div className="flex items-center justify-between mt-5">
          <div>
            <p className="text-2xl font-bold text-orange-600">
              ₹{food.price}
            </p>
          </div>

          <Button
            disabled={
              !food.isAvailable || !food.restaurant?.isOpen
            }
            onClick={() => onAddToCart(food)}
            className="bg-orange-500 hover:bg-orange-600 rounded-xl"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;