import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import FoodCard from "./FoodCard";

import saladImg from "../../assets/images/salad.jpeg";
import parathaImg from "../../assets/images/paratha.jpeg";
import idliImg from "../../assets/images/idli.jpeg";
import dosaImg from "../../assets/images/dosa.jpeg";
import chineseImg from "../../assets/images/chinese.jpeg";
import cakesImg from "../../assets/images/cakes.jpeg";
import burgerImg from "../../assets/images/burger.jpeg";
import choleBhatureImg from "../../assets/images/chole_bature.jpeg";
import iceCreamImg from "../../assets/images/ice_creams.jpeg";
import gulabJamunImg from "../../assets/images/gulab_jamun.jpeg";

const CATEGORIES = [
  { name: "Salad", image: saladImg },
  { name: "Paratha", image: parathaImg },
  { name: "Idli", image: idliImg },
  { name: "Dosa", image: dosaImg },
  { name: "Chinese", image: chineseImg },
  { name: "Cakes", image: cakesImg },
  { name: "Burger", image: burgerImg },
  { name: "Chole Bhature", image: choleBhatureImg },
  { name: "Ice Cream", image: iceCreamImg },
  { name: "Gulab Jamun", image: gulabJamunImg },
];

const PRICE_RANGES = [
  { label: "₹0 - ₹100", min: 0, max: 100 },
  { label: "₹100 - ₹200", min: 100, max: 200 },
  { label: "₹200 - ₹300", min: 200, max: 300 },
  { label: "₹300 - ₹500", min: 300, max: 500 },
  { label: "₹500 & up", min: 500, max: Infinity },
];

// Normalize helper: lowercase + trim, safe for undefined/null
const norm = (val) => (val ?? "").toString().trim().toLowerCase();

const AllFoods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default"); // default | rating | price_low | price_high

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
      toast.error(error?.response?.data?.message || "Failed to load foods");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (food) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/cart/add`,
        { foodId: food._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      if (res.data.success) toast.success(res.data.message);
    } catch (error) {
      if (error.response?.status === 409) {
        const replace = window.confirm(error.response.data.message);
        if (!replace) return;
        try {
          const token = localStorage.getItem("token");
          const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/v1/cart/add`,
            { foodId: food._id, quantity: 1, replaceCart: true },
            { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
          );
          if (res.data.success) toast.success("Cart replaced successfully.");
        } catch (err) {
          toast.error(err?.response?.data?.message || "Failed to replace cart.");
        }
      } else {
        toast.error(error?.response?.data?.message || "Failed to add item to cart.");
      }
    }
  };

  const filteredFoods = useMemo(() => {
    const search = norm(searchTerm);

    return foods.filter((food) => {
      // Category: match against category field OR the dish name itself,
      // since category taxonomies vary a lot between backends.
      const categoryMatch =
        !selectedCategory ||
        norm(food.category) === norm(selectedCategory) ||
        norm(food.name).includes(norm(selectedCategory));

      const price = Number(food.price) || 0;
      const priceMatch =
        !selectedPriceRange ||
        (price >= selectedPriceRange.min && price <= selectedPriceRange.max);

      const searchMatch =
        !search ||
        norm(food.name).includes(search) ||
        norm(food.description).includes(search);

      return categoryMatch && priceMatch && searchMatch;
    });
  }, [foods, selectedCategory, selectedPriceRange, searchTerm]);

  // ── Apply sorting on top of the filtered list ──
  const sortedFoods = useMemo(() => {
    const list = [...filteredFoods];
    if (sortBy === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "price_low") {
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === "price_high") {
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }
    return list;
  }, [filteredFoods, sortBy]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedPriceRange(null);
    setSearchTerm("");
    setSortBy("default");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <section className="py-2">
      <div className="max-w-7xl mx-auto px-4">
        {/* <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Explore All Foods</h2>
            <p className="text-gray-500 mt-2">
              Delicious meals from every restaurant.
            </p>
          </div>

          {(selectedCategory || selectedPriceRange || searchTerm || sortBy !== "default") && (
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              Clear filters
            </button>
          )}
        </div> */}

        {/* Search by name / description */}
        

        {/* Category filter (image based) */}
        <div className="flex gap-5 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(isActive ? null : cat.name)}
                className="flex flex-col items-center gap-2 shrink-0"
              >
                <div
                  className={`h-16 w-16 rounded-full overflow-hidden border-2 transition ${
                    isActive
                      ? "border-orange-500 ring-2 ring-orange-200"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive ? "text-orange-500" : "text-gray-600"
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Price range filter */}
        {/* <div className="flex flex-wrap items-center gap-2 mb-6">
          {PRICE_RANGES.map((range) => {
            const isActive = selectedPriceRange?.label === range.label;
            return (
              <button
                key={range.label}
                onClick={() =>
                  setSelectedPriceRange(isActive ? null : range)
                }
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                  isActive
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div> */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search food by name or description..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Sort by */}
        <div className="flex items-center gap-2 mb-10">
          <label className="text-sm font-medium text-gray-600">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="default">Default</option>
            <option value="rating">Rating: High to Low</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
          
        </div>

        {sortedFoods.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No foods match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedFoods.map((food) => (
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