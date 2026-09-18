import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const FoodCard = ({ food, onAddToCart }) => {
  const navigate = useNavigate();
  const rating = food.rating || 0;
  const numRatings = food.numRatings || 0;

  const handleAddClick = (e) => {
    e.stopPropagation(); // don't trigger navigation when clicking "Add"
    onAddToCart(food);
  };

  const handleCardClick = () => {
    navigate(`/food/${food._id || food.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white rounded-2xl overflow-hidden border shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
        !food.isAvailable && "opacity-70"
      }`}
    >
      <div className="relative">
        <img
          src={food.image || "https://placehold.co/500x300?text=Food"}
          alt={food.name}
          className="w-full h-40 object-cover"
        />
        <span
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${
            food.type?.toLowerCase() === "veg" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {food.type?.toLowerCase() === "veg" ? "🟢 Veg" : "🔴 Non-Veg"}
        </span>
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

      <div className="p-4">
        <h2 className="text-base font-bold text-gray-800 truncate">
          {food.name}
        </h2>

        {food.description && (
          <p className="text-xs text-gray-500 mt-1 truncate">
            {food.description}
          </p>
        )}

        <div className="flex items-center gap-1 mt-1.5">
          <Star
            className={`h-3.5 w-3.5 ${
              rating > 0 ? "fill-orange-500 text-orange-500" : "text-gray-300"
            }`}
          />
          <span
            className={`text-xs font-semibold ${
              rating > 0 ? "text-gray-700" : "text-gray-400"
            }`}
          >
            {rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">
            ({numRatings} rating{numRatings !== 1 ? "s" : ""})
          </span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-xl font-bold text-orange-600">₹{food.price}</p>

          <Button
            disabled={!food.isAvailable || !food.restaurant?.isOpen}
            onClick={handleAddClick}
            className="bg-orange-500 hover:bg-orange-600 rounded-xl"
            size="sm"
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