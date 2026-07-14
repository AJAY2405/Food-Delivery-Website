import React, { useEffect, useState, useMemo } from "react";
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
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  UtensilsCrossed,
  Star,
  ChevronDown,
  ChevronUp,
  MessageSquareText,
  User,
} from "lucide-react";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/* ── Expandable reviews list for a single food item ── */
const FoodReviews = ({ foodId, numRatings }) => {
  const [expanded, setExpanded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const next = !expanded;
    setExpanded(next);

    if (next && !loaded) {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/rating/food/${foodId}`,
          authHeaders()
        );
        if (res.data.success) {
          setReviews(res.data.ratings || []);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load reviews");
      } finally {
        setLoading(false);
        setLoaded(true);
      }
    }
  };

  if (numRatings === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={handleToggle}
        className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700"
      >
        <MessageSquareText className="h-3.5 w-3.5" />
        {expanded ? "Hide reviews" : "View reviews"}
        {expanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-xs text-gray-400">No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <div
                key={r._id}
                className="bg-gray-50 rounded-xl border border-gray-100 px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700">
                      {r.customer?.username || "Anonymous"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                    <span className="text-xs font-semibold text-gray-700">
                      {r.rating}
                    </span>
                  </div>
                </div>
                {r.review && (
                  <p className="text-xs text-gray-600 mt-1">{r.review}</p>
                )}
                <p className="text-[10px] text-gray-400 mt-1">
                  {fmtDate(r.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

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

  // ── Overall restaurant rating: average of all rated food items ──
  const { overallRating, ratedItemCount, totalRatingsCount } = useMemo(() => {
    const ratedFoods = foods.filter((f) => (f.numRatings || 0) > 0);
    if (ratedFoods.length === 0) {
      return { overallRating: 0, ratedItemCount: 0, totalRatingsCount: 0 };
    }
    const sum = ratedFoods.reduce((acc, f) => acc + (f.rating || 0), 0);
    const totalRatings = ratedFoods.reduce((acc, f) => acc + (f.numRatings || 0), 0);
    return {
      overallRating: sum / ratedFoods.length,
      ratedItemCount: ratedFoods.length,
      totalRatingsCount: totalRatings,
    };
  }, [foods]);

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
        <div className="flex items-center justify-between mb-3">
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

        {/* ── Overall restaurant rating summary ── */}
        {!loading && foods.length > 0 && (
          <div className="flex items-center gap-2 mb-6 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-fit shadow-sm">
            <Star
              className={`h-5 w-5 ${
                overallRating > 0
                  ? "fill-orange-500 text-orange-500"
                  : "text-gray-300"
              }`}
            />
            <span className="text-lg font-bold text-gray-900">
              {overallRating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-400">
              overall · {totalRatingsCount} rating{totalRatingsCount !== 1 ? "s" : ""} across {ratedItemCount} item{ratedItemCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}

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
            {foods.map((food) => {
              const rating = food.rating || 0;
              const numRatings = food.numRatings || 0;
              return (
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

                    {/* Rating — always shown, 0 if none yet */}
                    <div className="flex items-center gap-1 mt-1">
                      <Star
                        className={`h-3.5 w-3.5 ${
                          rating > 0
                            ? "fill-orange-500 text-orange-500"
                            : "text-gray-300"
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          rating > 0 ? "text-gray-700" : "text-gray-400"
                        }`}
                      >
                        {rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({numRatings})
                      </span>
                    </div>

                    {/* Reviews — expandable */}
                    <FoodReviews foodId={food._id} numRatings={numRatings} />

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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;