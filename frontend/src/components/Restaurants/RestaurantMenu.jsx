import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const authHeaders = () => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
  withCredentials: true,
});

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Pencil, Trash2, UtensilsCrossed } from "lucide-react";

const RestaurantMenu = () => {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/restaurant/food/my-items`,
        authHeaders()
      );
      if (res.data.success) {
        setFoods(res.data.foods || []);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleToggle = async (foodId) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/restaurant/food/toggle/${foodId}`,
        {},
        authHeaders()
      );
      if (res.data.success) {
        setFoods((prev) =>
          prev.map((f) => (f._id === foodId ? res.data.food : f))
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update");
    }
  };

  const handleDelete = async (foodId) => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/restaurant/food/delete/${foodId}`,
        authHeaders()
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setFoods((prev) => prev.filter((f) => f._id !== foodId));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete item");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <UtensilsCrossed className="h-7 w-7 text-orange-500" />
              My Menu
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your food items, pricing and availability
            </p>
          </div>
          <Button
            onClick={() => navigate("/restaurant/add-food")}
            className="bg-orange-500 hover:bg-orange-600 rounded-xl"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : foods.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No food items yet. Add your first dish to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {foods.map((food) => (
              <div
                key={food._id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex gap-4"
              >
                <img
                  src={food.image || "https://placehold.co/80x80?text=Food"}
                  alt={food.name}
                  className="h-20 w-20 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{food.name}</h3>
                    <Badge
                      className={
                        food.type === "veg"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-red-100 text-red-700 hover:bg-red-100"
                      }
                    >
                      {food.type === "veg" ? "Veg" : "Non-Veg"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {food.category}
                  </p>
                  <p className="font-medium text-orange-600 mt-1">
                    ₹{food.price}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={food.isAvailable}
                        onCheckedChange={() => handleToggle(food._id)}
                      />
                      <span className="text-xs text-gray-500">
                        {food.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() =>
                          navigate(`/restaurant/edit-food/${food._id}`)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete "{food.name}"?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove the item from your
                              menu. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="rounded-xl bg-red-500 hover:bg-red-600"
                              onClick={() => handleDelete(food._id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;
