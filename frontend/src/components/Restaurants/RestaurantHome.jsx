import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  UtensilsCrossed,
  Store,
  Leaf,
  Drumstick,
  EyeOff,
  ArrowRight,
  Loader2,
  Clock,
  ShoppingBag,
} from "lucide-react";

const authHeaders = () => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
  withCredentials: true,
});

const RestaurantHome = () => {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingOrders, setPendingOrders] = useState(0);

  const savedUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/restaurant/food/my-items`,
          authHeaders()
        );
        if (res.data.success) {
          setFoods(res.data.foods || []);
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    /* ── Fetch pending order count for the badge ── */
    const fetchPendingOrders = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/order/restaurant-orders`,
          authHeaders()
        );
        if (res.data.success) {
          const active = (res.data.orders || []).filter((o) =>
            ["placed", "confirmed", "preparing"].includes(o.status)
          ).length;
          setPendingOrders(active);
        }
      } catch {
        /* silent – badge is non-critical */
        console.log("")
      }
    };

    fetchFoods();
    fetchPendingOrders();
  }, []);

  const totalItems = foods.length;
  const availableItems = foods.filter((f) => f.isAvailable).length;
  const unavailableItems = totalItems - availableItems;
  const vegItems = foods.filter((f) => f.type === "veg").length;
  const nonVegItems = totalItems - vegItems;
  const recentItems = [...foods]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FFF8F2] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={
                savedUser?.photoUrl ||
                savedUser?.avatar ||
                "https://placehold.co/64x64?text=R"
              }
              alt="Restaurant logo"
              className="h-16 w-16 rounded-2xl object-cover border border-white shadow-sm"
            />
            <div>
              <p className="text-sm text-gray-500">Welcome back,</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {savedUser?.restaurantName || savedUser?.username || "Restaurant"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className={
                    savedUser?.isOpen
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-200"
                  }
                >
                  {savedUser?.isOpen ? "Open" : "Closed"}
                </Badge>
                {savedUser?.openingTime && savedUser?.closingTime && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {savedUser.openingTime} - {savedUser.closingTime}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate("/restaurant/add-food")}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-orange-600 text-white rounded-xl h-10"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Food Item
          </Button>
        </div>

        {/* Stats grid */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Total Items</p>
                <UtensilsCrossed className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold mt-2">{totalItems}</p>
            </div>

            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Available</p>
                <EyeOff className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold mt-2 text-green-600">
                {availableItems}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {unavailableItems} unavailable
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Veg Items</p>
                <Leaf className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold mt-2">{vegItems}</p>
            </div>

            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Non-Veg Items</p>
                <Drumstick className="h-4 w-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold mt-2">{nonVegItems}</p>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Orders — highlighted if there are pending items */}
          <button
            onClick={() => navigate("/restaurant/orders")}
            className={`text-left rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group border ${
              pendingOrders > 0
                ? "bg-orange-50 border-orange-300 hover:border-orange-400"
                : "bg-white border-gray-200 hover:border-orange-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="relative h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-orange-500" />
                {pendingOrders > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingOrders > 9 ? "9+" : pendingOrders}
                  </span>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="font-semibold mt-3">Orders</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {pendingOrders > 0
                ? `${pendingOrders} need attention`
                : "Track & manage orders"}
            </p>
          </button>

          <button
            onClick={() => navigate("/restaurant/menu")}
            className="text-left rounded-2xl bg-white border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <UtensilsCrossed className="h-5 w-5 text-orange-500" />
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="font-semibold mt-3">Manage Menu</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Edit, delete or toggle availability
            </p>
          </button>

          <button
            onClick={() => navigate("/restaurant/add-food")}
            className="text-left rounded-2xl bg-white border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Plus className="h-5 w-5 text-orange-500" />
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="font-semibold mt-3">Add New Item</p>
            <p className="text-sm text-gray-500 mt-0.5">
              List a new dish on your menu
            </p>
          </button>

          <button
            onClick={() => navigate("/restaurant/account")}
            className="text-left rounded-2xl bg-white border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Store className="h-5 w-5 text-orange-500" />
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="font-semibold mt-3">Restaurant Profile</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Update timing, address & status
            </p>
          </button>
        </div>

        {/* Recently added items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recently Added
            </h2>
            {totalItems > 0 && (
              <button
                onClick={() => navigate("/restaurant/menu")}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {!loading && recentItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">
              <UtensilsCrossed className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">
                You haven't added any food items yet.
              </p>
              <Button
                onClick={() => navigate("/restaurant/add-food")}
                variant="outline"
                className="mt-4 rounded-xl"
              >
                <Plus className="h-4 w-4 mr-1" /> Add your first item
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentItems.map((food) => (
                <div
                  key={food._id}
                  className={`rounded-2xl border border-gray-200 bg-white p-3 flex gap-3 ${
                    !food.isAvailable ? "opacity-50" : ""
                  }`}
                >
                  <img
                    src={food.image || "https://placehold.co/56x56?text=Food"}
                    alt={food.name}
                    className="h-14 w-14 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full flex-shrink-0 ${
                          food.type === "veg" ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <p className="text-sm font-medium truncate">{food.name}</p>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {food.category}
                    </p>
                    <p className="text-sm font-semibold text-orange-600 mt-1">
                      ₹{food.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantHome;
