import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import FoodCard from "./FoodCard";

const AllFoods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/restaurant/food/all`
      );

      if (res.data.success) {
        setFoods(res.data.foods || []);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load foods"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (food) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/cart/add`,
        {
          foodId: food._id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        const replace = window.confirm(
          error.response.data.message
        );

        if (!replace) return;

        try {
          const token = localStorage.getItem("token");

          const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/v1/cart/add`,
            {
              foodId: food._id,
              quantity: 1,
              replaceCart: true,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            }
          );

          if (res.data.success) {
            toast.success("Cart replaced successfully.");
          }
        } catch (err) {
          toast.error(
            err?.response?.data?.message ||
              "Failed to replace cart."
          );
        }
      } else {
        toast.error(
          error?.response?.data?.message ||
            "Failed to add item to cart."
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <section className="py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Explore All Foods
          </h2>

          <p className="text-gray-500 mt-2">
            Delicious meals from every restaurant.
          </p>
        </div>

        {foods.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No foods available.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {foods.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AllFoods;