import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  ShoppingCart,
  Store,
  Clock,
  Star,
  ArrowLeft,
  Loader2,
  MessageSquare,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FoodCard from "./FoodCard";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const fetchFoodById = async (id) => {
  try {
    const res = await axios.get(`${API_BASE}/api/v1/restaurant/food/${id}`, {
      withCredentials: true,
    });
    if (!res.data.success) throw new Error(res.data.message || "Failed to load food");
    return res.data.food;
  } catch (err) {
    console.error("fetchFoodById failed:", err);
    throw err;
  }
};

const fetchSimilarFoods = async (id) => {
  try {
    const res = await axios.get(`${API_BASE}/api/v1/restaurant/food/${id}/similar`, {
      withCredentials: true,
    });
    if (!res.data.success) throw new Error(res.data.message || "Failed to load similar food");
    return res.data.foods;
  } catch (err) {
    console.error("fetchSimilarFoods failed:", err);
    throw err;
  }
};

// Matches ratingRoute.js — assumed mounted at /api/v1/rating (same
// pattern as your other routes). If this 404s, that's the one thing
// to check/fix here.
// NOTE: getFoodRatings is behind isAuthenticated on the backend, so
// this needs the same Bearer token as your cart calls — logged-out
// visitors will get a 401, which is handled below as "no reviews yet"
// rather than a scary error.
const fetchFoodReviews = async (id) => {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await axios.get(`${API_BASE}/api/v1/rating/food/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      withCredentials: true,
    });
    if (!res.data.success) throw new Error(res.data.message || "Failed to load reviews");
    return res.data.ratings || [];
  } catch (err) {
    console.error("fetchFoodReviews failed:", err);
    throw err;
  }
};

const FoodDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [food, setFood] = useState(null);
  const [similarFood, setSimilarFood] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [foodData, similar] = await Promise.all([
          fetchFoodById(id),
          fetchSimilarFoods(id),
        ]);
        if (!isMounted) return;
        setFood(foodData);
        setSimilarFood(similar || []);
      } catch (err) {
        if (isMounted) {
          const message = err?.response?.data?.message || err.message || "Something went wrong";
          setError(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const loadReviews = async () => {
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const data = await fetchFoodReviews(id);
        if (!isMounted) return;
        setReviews(data);
      } catch (err) {
        // Reviews failing shouldn't block the rest of the page. A 401
        // just means the visitor isn't logged in — show it as "no
        // reviews" rather than an error message; anything else gets
        // a quiet inline note.
        if (isMounted) {
          if (err?.response?.status === 401) {
            setReviews([]);
          } else {
            setReviewsError(err?.response?.data?.message || err.message || "Couldn't load reviews");
          }
        }
      } finally {
        if (isMounted) setReviewsLoading(false);
      }
    };

    load();
    loadReviews();
    setShowAllReviews(false);
    window.scrollTo(0, 0);

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Same logic as CustomerBrowse.jsx's handleAddToCart, kept identical
  // so cart behavior (including the 409 "replace cart?" flow) matches
  // everywhere in the app.
  const handleAddToCart = async (foodItem) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.post(
        `${API_BASE}/api/v1/cart/add`,
        { foodId: foodItem._id, quantity: 1 },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        const replace = window.confirm(error.response.data.message);
        if (!replace) {
          toast.info("Cart replacement cancelled.");
          return;
        }
        try {
          const token = localStorage.getItem("accessToken");
          const res = await axios.post(
            `${API_BASE}/api/v1/cart/add`,
            { foodId: foodItem._id, quantity: 1, replaceCart: true },
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          );
          if (res.data.success) {
            toast.success("Cart updated successfully.");
          }
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to update cart.");
        }
      } else {
        toast.error(error.response?.data?.message || "Failed to add item to cart.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 text-gray-500">
        <p>{error || "Food not found"}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    );
  }

  const rating = food.rating || 0;
  const numRatings = food.numRatings || 0;

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      {/* ── Banner ── */}
      <div className="relative h-64 md:h-96 w-full">
        <img
          src={food.image || "https://placehold.co/1200x500?text=Food"}
          alt={food.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-sm font-medium text-white bg-black/30 hover:bg-black/50 transition-colors px-3 py-1.5 rounded-full backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <span
          className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white ${
            food.type?.toLowerCase() === "veg" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {food.type?.toLowerCase() === "veg" ? "🟢 Veg" : "🔴 Non-Veg"}
        </span>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Store className="h-4 w-4 text-orange-300" />
            <span className="text-sm font-semibold text-orange-300">
              {food.restaurant?.restaurantName || food.restaurant?.username || "Restaurant"}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                food.restaurant?.isOpen
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {food.restaurant?.isOpen ? "Open" : "Closed"}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white">{food.name}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* ── Food details ── */}
        <div className="bg-white rounded-2xl overflow-hidden border shadow-md p-6">
          <div className="flex items-center justify-between">
            {food.category && <p className="text-sm text-gray-500">{food.category}</p>}
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                food.isAvailable
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {food.isAvailable ? "Available" : "Unavailable"}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-2">
            <Star
              className={`h-4 w-4 ${
                rating > 0 ? "fill-orange-500 text-orange-500" : "text-gray-300"
              }`}
            />
            <span
              className={`text-sm font-semibold ${
                rating > 0 ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-400">
              ({numRatings} rating{numRatings !== 1 ? "s" : ""})
            </span>
          </div>

          {food.description && (
            <p className="text-sm text-gray-600 mt-4">{food.description}</p>
          )}

          {food.restaurant?.cuisine && (
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {food.restaurant.cuisine}
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <p className="text-3xl font-bold text-orange-600">₹{food.price}</p>

            <Button
              disabled={!food.isAvailable || !food.restaurant?.isOpen}
              onClick={() => handleAddToCart(food)}
              className="bg-orange-500 hover:bg-orange-600 rounded-xl"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-800">
              Reviews {reviews.length > 0 && `(${reviews.length})`}
            </h2>
          </div>

          {reviewsLoading ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading reviews...
            </div>
          ) : reviewsError ? (
            <p className="text-sm text-gray-400 py-2">{reviewsError}</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">No reviews yet for this dish.</p>
          ) : (
            <div className="space-y-4">
              {(showAllReviews ? reviews : reviews.slice(0, 1)).map((review) => (
                <div
                  key={review._id}
                  className="bg-white rounded-xl border shadow-sm p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-orange-500" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {review.customer?.username || "Anonymous"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        {review.rating}
                      </span>
                    </div>
                  </div>
                  {review.review && (
                    <p className="text-sm text-gray-600 mt-2">{review.review}</p>
                  )}
                  {review.createdAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}

              {reviews.length > 1 && (
                <button
                  onClick={() => setShowAllReviews((prev) => !prev)}
                  className="text-sm font-medium text-orange-600 hover:text-orange-700"
                >
                  {showAllReviews
                    ? "Show less"
                    : `Show all ${reviews.length} reviews`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Similar dishes ── */}
        {similarFood.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Similar dishes you might like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarFood.map((item) => (
                <FoodCard key={item._id} food={item} onAddToCart={handleAddToCart} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDetailPage;