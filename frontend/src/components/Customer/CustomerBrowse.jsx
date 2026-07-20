// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";
// import { useLocation, useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Loader2,
//   Search,
//   Clock,
//   MapPin,
//   X,
//   ArrowUpDown,
//   IndianRupee,
//   LocateFixed,
//   Navigation,
//   UtensilsCrossed,
// } from "lucide-react";
// import FoodCard from "./FoodCard";

// import saladImg from "../../assets/images/salad.jpeg";
// import parathaImg from "../../assets/images/paratha.jpeg";
// import idliImg from "../../assets/images/idli.jpeg";
// import dosaImg from "../../assets/images/dosa.jpeg";
// import chineseImg from "../../assets/images/chinese.jpeg";
// import cakesImg from "../../assets/images/cakes.jpeg";
// import burgerImg from "../../assets/images/burger.jpeg";
// import choleBhatureImg from "../../assets/images/chole_bature.jpeg";
// import iceCreamImg from "../../assets/images/ice_creams.jpeg";
// import gulabJamunImg from "../../assets/images/gulab_jamun.jpeg";

// const CATEGORIES = [
//   { name: "Salad", image: saladImg },
//   { name: "Paratha", image: parathaImg },
//   { name: "Idli", image: idliImg },
//   { name: "Dosa", image: dosaImg },
//   { name: "Chinese", image: chineseImg },
//   { name: "Cakes", image: cakesImg },
//   { name: "Burger", image: burgerImg },
//   { name: "Chole Bhature", image: choleBhatureImg },
//   { name: "Ice Cream", image: iceCreamImg },
//   { name: "Gulab Jamun", image: gulabJamunImg },
// ];

// // Normalize for forgiving, case/whitespace-safe comparisons
// const norm = (val) => (val ?? "").toString().trim().toLowerCase();

// const matchesCategory = (food, category) => {
//   if (!category) return true;
//   return (
//     norm(food.category) === norm(category) ||
//     norm(food.name).includes(norm(category))
//   );
// };

// const haversineKm = (lat1, lon1, lat2, lon2) => {
//   const toRad = (deg) => (deg * Math.PI) / 180;
//   const R = 6371;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// };

// // ── Distance range filter options ──
// const DISTANCE_RANGES = [
//   { value: "all", label: "Any distance" },
//   { value: "lt1", label: "Less than 1 km" },
//   { value: "1to3", label: "1 - 3 km" },
//   { value: "3to5", label: "3 - 5 km" },
//   { value: "5to10", label: "5 - 10 km" },
//   { value: "gt10", label: "10+ km" },
// ];

// const matchesDistanceRange = (dist, range) => {
//   if (range === "all") return true;
//   if (dist == null) return false; 
//   switch (range) {
//     case "lt1":
//       return dist < 1;
//     case "1to3":
//       return dist >= 1 && dist < 3;
//     case "3to5":
//       return dist >= 3 && dist < 5;
//     case "5to10":
//       return dist >= 5 && dist <= 10;
//     case "gt10":
//       return dist > 10;
//     default:
//       return true;
//   }
// };

// const CustomerBrowse = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [groups, setGroups] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");

//   const [restaurantFilter, setRestaurantFilter] = useState(
//     location.state?.restaurantId || null
//   );
//   const [restaurantFilterName, setRestaurantFilterName] = useState(
//     location.state?.restaurantName || ""
//   );

//   // ── Sorting controls ──
//   const [restaurantSort, setRestaurantSort] = useState("name_asc"); // name_asc | name_desc | distance
//   const [priceSort, setPriceSort] = useState("default"); // default | low_high | high_low | rating_high
//   const [distances, setDistances] = useState({}); // { [restaurantId]: km }
//   const [locating, setLocating] = useState(false);

//   // ── Distance range filter ──
//   const [distanceRange, setDistanceRange] = useState("all");

//   // ── Category (image) filter ──
//   const [selectedCategory, setSelectedCategory] = useState(null);

//   // ── Clear the navigation state so a back-navigation doesn't re-apply it ──
//   useEffect(() => {
//     if (location.state?.restaurantId) {
//       window.history.replaceState({}, document.title);
//     }
//   }, []);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const res = await axios.get(
//           `${import.meta.env.VITE_API_BASE_URL}/api/v1/restaurant/food/all-grouped`,
//         );
//         if (res.data.success) {
//           setGroups(res.data.data || []);
//         }
//       } catch (error) {
//         toast.error(
//           error?.response?.data?.message || "Failed to load restaurants",
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const clearRestaurantFilter = () => {
//     setRestaurantFilter(null);
//     setRestaurantFilterName("");
//   };

//   /* ── Get the customer's live location, then geocode each restaurant's
//      saved address (or use lat/lng if the backend already provides them)
//      to compute straight-line distance ── */
//   const handleSortByDistance = () => {
//     if (!navigator.geolocation) {
//       toast.error("Location access isn't supported in this browser");
//       return;
//     }

//     setLocating(true);
//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;
//         const newDistances = {};

//         for (const { restaurant } of groups) {
//           const id = restaurant._id;
//           if (distances[id] != null) continue; // already computed, reuse

//           if (restaurant.latitude && restaurant.longitude) {
//             newDistances[id] = haversineKm(
//               latitude,
//               longitude,
//               restaurant.latitude,
//               restaurant.longitude
//             );
//             continue;
//           }

//           if (restaurant.address) {
//             try {
//               const res = await fetch(
//                 `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
//                   restaurant.address
//                 )}`
//               );
//               const data = await res.json();
//               if (data?.[0]) {
//                 newDistances[id] = haversineKm(
//                   latitude,
//                   longitude,
//                   parseFloat(data[0].lat),
//                   parseFloat(data[0].lon)
//                 );
//               }
//             } catch (err) {
//               // skip — this restaurant just won't get a distance
//             }
//             // Respect Nominatim's 1 request/sec usage policy
//             await new Promise((r) => setTimeout(r, 1000));
//           }
//         }

//         setDistances((prev) => ({ ...prev, ...newDistances }));
//         setLocating(false);
//       },
//       (error) => {
//         setLocating(false);
//         toast.error(
//           error.code === error.PERMISSION_DENIED
//             ? "Location permission denied"
//             : "Couldn't get your current location"
//         );
//       },
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   // ── When the person picks "Nearest to me" as the sort, kick off geolocation ──
//   const handleRestaurantSortChange = (val) => {
//     if (val === "distance") {
//       handleSortByDistance();
//     }
//     setRestaurantSort(val);
//   };

//   // ── When the person picks a distance range filter, make sure distances exist ──
//   const handleDistanceRangeChange = (val) => {
//     setDistanceRange(val);
//     if (val !== "all" && Object.keys(distances).length === 0 && !locating) {
//       handleSortByDistance();
//     }
//   };

//   const handleCategoryClick = (name) => {
//     setSelectedCategory((prev) => (prev === name ? null : name));
//   };

//   const filteredGroups = useMemo(() => {
//     return groups
//       .filter((group) =>
//         restaurantFilter ? group.restaurant._id === restaurantFilter : true
//       )
//       .filter((group) =>
//         matchesDistanceRange(distances[group.restaurant._id], distanceRange)
//       )
//       .map((group) => ({
//         ...group,
//         foods: group.foods
//           .filter((food) =>
//             food.name.toLowerCase().includes(search.toLowerCase()),
//           )
//           .filter((food) => matchesCategory(food, selectedCategory)),
//       }))
//       .filter((group) => {
//         // When locked to one restaurant, keep it visible even with 0 matching
//         // foods so the customer can see it's empty rather than have it vanish.
//         if (restaurantFilter) return true;

//         // If a category filter is active, only restaurants with a matching
//         // dish should show — there's no "restaurant name matches category" case.
//         if (selectedCategory) return group.foods.length > 0;

//         const matchesRestaurant = (
//           group.restaurant.restaurantName ||
//           group.restaurant.username ||
//           ""
//         )
//           .toLowerCase()
//           .includes(search.toLowerCase());
//         return matchesRestaurant || group.foods.length > 0;
//       });
//   }, [groups, search, restaurantFilter, distanceRange, distances, selectedCategory]);

//   // ── Sort food items within each restaurant section by price or rating ──
//   const priceSortedGroups = useMemo(() => {
//     if (priceSort === "default") return filteredGroups;
//     return filteredGroups.map((group) => ({
//       ...group,
//       foods: [...group.foods].sort((a, b) => {
//         if (priceSort === "low_high") return a.price - b.price;
//         if (priceSort === "high_low") return b.price - a.price;
//         if (priceSort === "rating_high") return (b.rating || 0) - (a.rating || 0);
//         return 0;
//       }),
//     }));
//   }, [filteredGroups, priceSort]);

//   // ── Sort the restaurant sections themselves ──
//   const sortedGroups = useMemo(() => {
//     const list = [...priceSortedGroups];
//     if (restaurantSort === "name_asc") {
//       list.sort((a, b) =>
//         (a.restaurant.restaurantName || a.restaurant.username || "").localeCompare(
//           b.restaurant.restaurantName || b.restaurant.username || ""
//         )
//       );
//     } else if (restaurantSort === "name_desc") {
//       list.sort((a, b) =>
//         (b.restaurant.restaurantName || b.restaurant.username || "").localeCompare(
//           a.restaurant.restaurantName || a.restaurant.username || ""
//         )
//       );
//     } else if (restaurantSort === "distance") {
//       list.sort((a, b) => {
//         const da = distances[a.restaurant._id];
//         const db = distances[b.restaurant._id];
//         if (da == null && db == null) return 0;
//         if (da == null) return 1;
//         if (db == null) return -1;
//         return da - db;
//       });
//     }
//     return list;
//   }, [priceSortedGroups, restaurantSort, distances]);

//   const handleAddToCart = async (food) => {
//     try {
//       const token = localStorage.getItem("accessToken");

//       const res = await axios.post(
//         `${import.meta.env.VITE_API_BASE_URL}/api/v1/cart/add`,
//         {
//           foodId: food._id,
//           quantity: 1,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           withCredentials: true,
//         },
//       );

//       if (res.data.success) {
//         toast.success(res.data.message);
//       }
//     } catch (error) {
//       if (error.response?.status === 409) {
//         const replace = window.confirm(error.response.data.message);

//         if (!replace) return;

//         try {
//           const token = localStorage.getItem("token");

//           const res = await axios.post(
//             `${import.meta.env.VITE_API_BASE_URL}/api/v1/cart/add`,
//             {
//               foodId: food._id,
//               quantity: 1,
//               replaceCart: true,
//             },
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//               },
//               withCredentials: true,
//             },
//           );

//           if (res.data.success) {
//             toast.success("Cart updated successfully.");
//           }
//         } catch (err) {
//           toast.error(err.response?.data?.message || "Failed to update cart.");
//         }
//       } else {
//         toast.error(
//           error.response?.data?.message || "Failed to add item to cart.",
//         );
//       }
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#FFF8F2] px-4 py-5">
//       <div className="mx-auto max-w-5xl">
//         <h1 className="text-3xl font-bold text-gray-900 mb-1">
//           {restaurantFilter
//             ? `${restaurantFilterName || "Restaurant"} menu`
//             : "Order from your favorite restaurants"}
//         </h1>
//         <p className="text-gray-500 mb-6">
//           {restaurantFilter
//             ? "Showing items from this restaurant only"
//             : "Browse menus and filter or sort them the way you like"}
//         </p>

//         {/* ── Category filter (image based) ── */}
//         <div className="flex gap-5 overflow-x-auto pb-3 mb-5 scrollbar-hide">
//           {CATEGORIES.map((cat) => {
//             const isActive = selectedCategory === cat.name;
//             return (
//               <button
//                 key={cat.name}
//                 onClick={() => handleCategoryClick(cat.name)}
//                 className="flex flex-col items-center gap-2 shrink-0"
//               >
//                 <div
//                   className={`h-16 w-16 rounded-full overflow-hidden border-2 transition ${
//                     isActive
//                       ? "border-orange-500 ring-2 ring-orange-200"
//                       : "border-gray-200"
//                   }`}
//                 >
//                   <img
//                     src={cat.image}
//                     alt={cat.name}
//                     className="h-full w-full object-cover"
//                   />
//                 </div>
//                 <span
//                   className={`text-xs font-medium ${
//                     isActive ? "text-orange-500" : "text-gray-600"
//                   }`}
//                 >
//                   {cat.name}
//                 </span>
//               </button>
//             );
//           })}
//         </div>

//         {/* ── Search ── */}
//         <div className="flex flex-wrap items-center gap-3 mb-4">
//           <div className="relative max-w-md flex-1 min-w-[220px]">
//             <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//             <Input
//               placeholder="Search restaurant or dish..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="pl-9 rounded-xl h-10"
//             />
//           </div>

//           {restaurantFilter && (
//             <button
//               onClick={clearRestaurantFilter}
//               className="flex items-center gap-1.5 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors px-3 py-2 rounded-xl"
//             >
//               {restaurantFilterName || "Filtered"}
//               <X className="h-3.5 w-3.5" />
//             </button>
//           )}

//           {distanceRange !== "all" && (
//             <button
//               onClick={() => setDistanceRange("all")}
//               className="flex items-center gap-1.5 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors px-3 py-2 rounded-xl"
//             >
//               {DISTANCE_RANGES.find((r) => r.value === distanceRange)?.label}
//               <X className="h-3.5 w-3.5" />
//             </button>
//           )}

//           {selectedCategory && (
//             <button
//               onClick={() => setSelectedCategory(null)}
//               className="flex items-center gap-1.5 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors px-3 py-2 rounded-xl"
//             >
//               {selectedCategory}
//               <X className="h-3.5 w-3.5" />
//             </button>
//           )}
//         </div>

//         {/* ── Sort & filter controls ── */}
//         {/* Kept to a single row on every screen size: it scrolls
//             horizontally on narrow (phone) viewports and fits without
//             wrapping on wide (laptop/desktop) ones. */}
//         <div className="flex flex-nowrap items-center gap-3 bg-orange-50    mb-8 overflow-x-auto scrollbar-hide">
//           <div className="flex items-center gap-2 w-[170px] sm:w-[190px] shrink-0">
//             <UtensilsCrossed className="h-4 w-4 text-orange-500 flex-shrink-0" />
//             <Select
//               value={restaurantFilter || "all"}
//               onValueChange={(val) => {
//                 if (val === "all") {
//                   clearRestaurantFilter();
//                   return;
//                 }
//                 const match = groups.find((g) => g.restaurant._id === val);
//                 setRestaurantFilter(val);
//                 setRestaurantFilterName(
//                   match?.restaurant.restaurantName || match?.restaurant.username || ""
//                 );
//               }}
//             >
//               <SelectTrigger className="h-9 text-sm rounded-xl border-gray-200">
//                 <SelectValue placeholder="All restaurants" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Restaurants</SelectItem>
//                 {groups.map(({ restaurant }) => (
//                   <SelectItem key={restaurant._id} value={restaurant._id}>
//                     {restaurant.restaurantName || restaurant.username}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex items-center gap-2 w-[170px] sm:w-[190px] shrink-0">
//             <ArrowUpDown className="h-4 w-4 text-orange-500 flex-shrink-0" />
//             <Select value={restaurantSort} onValueChange={handleRestaurantSortChange}>
//               <SelectTrigger className="h-9 text-sm rounded-xl border-gray-200">
//                 <SelectValue placeholder="Sort restaurants" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="name_asc">Restaurant name (A-Z)</SelectItem>
//                 <SelectItem value="name_desc">Restaurant name (Z-A)</SelectItem>
//                 <SelectItem value="distance">Nearest to me</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex items-center gap-2 w-[170px] sm:w-[190px] shrink-0">
//             <IndianRupee className="h-4 w-4 text-orange-500 flex-shrink-0" />
//             <Select value={priceSort} onValueChange={setPriceSort}>
//               <SelectTrigger className="h-9 text-sm rounded-xl border-gray-200">
//                 <SelectValue placeholder="Sort items" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="default">Default item order</SelectItem>
//                 <SelectItem value="low_high">Price: Low to High</SelectItem>
//                 <SelectItem value="high_low">Price: High to Low</SelectItem>
//                 <SelectItem value="rating_high">Rating: High to Low</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* ── Distance range filter ── */}
//           <div className="flex items-center gap-2 w-[170px] sm:w-[190px] shrink-0">
//             <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
//             <Select value={distanceRange} onValueChange={handleDistanceRangeChange}>
//               <SelectTrigger className="h-9 text-sm rounded-xl border-gray-200">
//                 <SelectValue placeholder="Distance" />
//               </SelectTrigger>
//               <SelectContent>
//                 {DISTANCE_RANGES.map((r) => (
//                   <SelectItem key={r.value} value={r.value}>
//                     {r.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {locating && (
//             <span className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0 whitespace-nowrap">
//               <Loader2 className="h-3.5 w-3.5 animate-spin" />
//               Locating you & calculating distances…
//             </span>
//           )}

//           {(restaurantSort === "distance" || distanceRange !== "all") && !locating && (
//             <button
//               onClick={handleSortByDistance}
//               className="flex items-center gap-1 text-xs text-orange-600 font-medium hover:text-orange-700 shrink-0 whitespace-nowrap sm:ml-auto"
//             >
//               <LocateFixed className="h-3.5 w-3.5" />
//               Refresh location
//             </button>
//           )}
//         </div>
//         {sortedGroups.length === 0 ? (
//           <p className="text-center text-gray-500 py-16">
//             {selectedCategory
//               ? `No dishes found for "${selectedCategory}".`
//               : distanceRange !== "all"
//               ? "No restaurants found in this distance range."
//               : "No restaurants or dishes match your search."}
//           </p>
//         ) : (
//           <div className="space-y-10">
//             {sortedGroups.map(({ restaurant, foods }) => {
//               const dist = distances[restaurant._id];
//               return (
//                 <section key={restaurant._id}>
//                   <div className="flex items-center gap-3 mb-4">
//                     <img
//                       src={
//                         restaurant.photoUrl ||
//                         restaurant.avatar ||
//                         "https://placehold.co/56x56?text=R"
//                       }
//                       alt={restaurant.restaurantName || restaurant.username}
//                       className="h-14 w-14 rounded-xl object-cover border"
//                     />
//                     <div>
//                       <div className="flex items-center gap-2">
//                         <h2 className="text-xl font-semibold">
//                           {restaurant.restaurantName || restaurant.username}
//                         </h2>
//                         <Badge
//                           className={
//                             restaurant.isOpen
//                               ? "bg-green-100 text-green-700 hover:bg-green-100"
//                               : "bg-gray-200 text-gray-600 hover:bg-gray-200"
//                           }
//                         >
//                           {restaurant.isOpen ? "Open" : "Closed"}
//                         </Badge>
//                       </div>
//                       <div className="flex items-center gap-4 text-sm text-gray-500 mt-0.5 flex-wrap">
//                         {restaurant.cuisine && <span>{restaurant.cuisine}</span>}
//                         {restaurant.openingTime && restaurant.closingTime && (
//                           <span className="flex items-center gap-1">
//                             <Clock className="h-3 w-3" />
//                             {restaurant.openingTime} - {restaurant.closingTime}
//                           </span>
//                         )}
//                         {dist != null && (
//                           <span className="flex items-center gap-1 text-orange-600 font-medium">
//                             <Navigation className="h-3 w-3" />
//                             {dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`} away
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {foods.length === 0 ? (
//                     <p className="text-sm text-gray-400 pl-1">
//                       No items listed yet.
//                     </p>
//                   ) : (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {foods.map((food) => (
//                         <FoodCard
//                           key={food._id}
//                           food={{
//                             ...food,
//                             restaurant,
//                           }}
//                           onAddToCart={handleAddToCart}
//                         />
//                       ))}
//                     </div>
//                   )}
//                 </section>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CustomerBrowse;




import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Search,
  Clock,
  MapPin,
  X,
  ArrowUpDown,
  IndianRupee,
  LocateFixed,
  Navigation,
  UtensilsCrossed,
  Leaf,
} from "lucide-react";
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

// Normalize for forgiving, case/whitespace-safe comparisons
const norm = (val) => (val ?? "").toString().trim().toLowerCase();

const matchesCategory = (food, category) => {
  if (!category) return true;
  return (
    norm(food.category) === norm(category) ||
    norm(food.name).includes(norm(category))
  );
};

// Normalize a food item's veg/non-veg status into 'veg' | 'non-veg' | null.
// Supports a boolean `isVeg`/`veg` field, or a string field like
// `foodType`/`type`/`category` containing "veg"/"vegetarian"/"non-veg" etc.
// Adjust this if your schema uses a different field name.
const getFoodType = (food) => {
  if (typeof food.isVeg === "boolean") return food.isVeg ? "veg" : "non-veg";
  if (typeof food.veg === "boolean") return food.veg ? "veg" : "non-veg";
  const raw = norm(food.foodType || food.type || food.category);
  if (["veg", "vegetarian"].includes(raw)) return "veg";
  if (["non-veg", "nonveg", "non vegetarian", "non-vegetarian"].includes(raw))
    return "non-veg";
  return null;
};

const matchesVegFilter = (food, vegFilter) => {
  if (vegFilter === "all") return true;
  return getFoodType(food) === vegFilter;
};

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ── Distance range filter options ──
const DISTANCE_RANGES = [
  { value: "all", label: "Any distance" },
  { value: "lt1", label: "Less than 1 km" },
  { value: "1to3", label: "1 - 3 km" },
  { value: "3to5", label: "3 - 5 km" },
  { value: "5to10", label: "5 - 10 km" },
  { value: "gt10", label: "10+ km" },
];

const matchesDistanceRange = (dist, range) => {
  if (range === "all") return true;
  if (dist == null) return false; 
  switch (range) {
    case "lt1":
      return dist < 1;
    case "1to3":
      return dist >= 1 && dist < 3;
    case "3to5":
      return dist >= 3 && dist < 5;
    case "5to10":
      return dist >= 5 && dist <= 10;
    case "gt10":
      return dist > 10;
    default:
      return true;
  }
};

const CustomerBrowse = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [restaurantFilter, setRestaurantFilter] = useState(
    location.state?.restaurantId || null
  );
  const [restaurantFilterName, setRestaurantFilterName] = useState(
    location.state?.restaurantName || ""
  );

  // ── Sorting controls ──
  const [restaurantSort, setRestaurantSort] = useState("name_asc"); // name_asc | name_desc | distance
  const [priceSort, setPriceSort] = useState("default"); // default | low_high | high_low | rating_high
  const [distances, setDistances] = useState({}); // { [restaurantId]: km }
  const [locating, setLocating] = useState(false);

  // ── Distance range filter ──
  const [distanceRange, setDistanceRange] = useState("all");

  // ── Category (image) filter ──
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ── Veg / Non-veg filter ──
  const [vegFilter, setVegFilter] = useState("all"); // all | veg | non-veg

  // ── Clear the navigation state so a back-navigation doesn't re-apply it ──
  useEffect(() => {
    if (location.state?.restaurantId) {
      window.history.replaceState({}, document.title);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/restaurant/food/all-grouped`,
        );
        if (res.data.success) {
          setGroups(res.data.data || []);
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to load restaurants",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const clearRestaurantFilter = () => {
    setRestaurantFilter(null);
    setRestaurantFilterName("");
  };

  /* ── Get the customer's live location, then geocode each restaurant's
     saved address (or use lat/lng if the backend already provides them)
     to compute straight-line distance ── */
  const handleSortByDistance = () => {
    if (!navigator.geolocation) {
      toast.error("Location access isn't supported in this browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newDistances = {};

        for (const { restaurant } of groups) {
          const id = restaurant._id;
          if (distances[id] != null) continue; // already computed, reuse

          if (restaurant.latitude && restaurant.longitude) {
            newDistances[id] = haversineKm(
              latitude,
              longitude,
              restaurant.latitude,
              restaurant.longitude
            );
            continue;
          }

          if (restaurant.address) {
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
                  restaurant.address
                )}`
              );
              const data = await res.json();
              if (data?.[0]) {
                newDistances[id] = haversineKm(
                  latitude,
                  longitude,
                  parseFloat(data[0].lat),
                  parseFloat(data[0].lon)
                );
              }
            } catch (err) {
              // skip — this restaurant just won't get a distance
            }
            // Respect Nominatim's 1 request/sec usage policy
            await new Promise((r) => setTimeout(r, 1000));
          }
        }

        setDistances((prev) => ({ ...prev, ...newDistances }));
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        toast.error(
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied"
            : "Couldn't get your current location"
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── When the person picks "Nearest to me" as the sort, kick off geolocation ──
  const handleRestaurantSortChange = (val) => {
    if (val === "distance") {
      handleSortByDistance();
    }
    setRestaurantSort(val);
  };

  // ── When the person picks a distance range filter, make sure distances exist ──
  const handleDistanceRangeChange = (val) => {
    setDistanceRange(val);
    if (val !== "all" && Object.keys(distances).length === 0 && !locating) {
      handleSortByDistance();
    }
  };

  const handleCategoryClick = (name) => {
    setSelectedCategory((prev) => (prev === name ? null : name));
  };

  const filteredGroups = useMemo(() => {
    return groups
      .filter((group) =>
        restaurantFilter ? group.restaurant._id === restaurantFilter : true
      )
      .filter((group) =>
        matchesDistanceRange(distances[group.restaurant._id], distanceRange)
      )
      .map((group) => ({
        ...group,
        foods: group.foods
          .filter((food) =>
            food.name.toLowerCase().includes(search.toLowerCase()),
          )
          .filter((food) => matchesCategory(food, selectedCategory))
          .filter((food) => matchesVegFilter(food, vegFilter)),
      }))
      .filter((group) => {
        // When locked to one restaurant, keep it visible even with 0 matching
        // foods so the customer can see it's empty rather than have it vanish.
        if (restaurantFilter) return true;

        // If a category or veg/non-veg filter is active, only restaurants
        // with a matching dish should show — there's no "restaurant name
        // matches filter" case for these.
        if (selectedCategory || vegFilter !== "all") return group.foods.length > 0;

        const matchesRestaurant = (
          group.restaurant.restaurantName ||
          group.restaurant.username ||
          ""
        )
          .toLowerCase()
          .includes(search.toLowerCase());
        return matchesRestaurant || group.foods.length > 0;
      });
  }, [
    groups,
    search,
    restaurantFilter,
    distanceRange,
    distances,
    selectedCategory,
    vegFilter,
  ]);

  // ── Sort food items within each restaurant section by price or rating ──
  const priceSortedGroups = useMemo(() => {
    if (priceSort === "default") return filteredGroups;
    return filteredGroups.map((group) => ({
      ...group,
      foods: [...group.foods].sort((a, b) => {
        if (priceSort === "low_high") return a.price - b.price;
        if (priceSort === "high_low") return b.price - a.price;
        if (priceSort === "rating_high") return (b.rating || 0) - (a.rating || 0);
        return 0;
      }),
    }));
  }, [filteredGroups, priceSort]);

  // ── Sort the restaurant sections themselves ──
  const sortedGroups = useMemo(() => {
    const list = [...priceSortedGroups];
    if (restaurantSort === "name_asc") {
      list.sort((a, b) =>
        (a.restaurant.restaurantName || a.restaurant.username || "").localeCompare(
          b.restaurant.restaurantName || b.restaurant.username || ""
        )
      );
    } else if (restaurantSort === "name_desc") {
      list.sort((a, b) =>
        (b.restaurant.restaurantName || b.restaurant.username || "").localeCompare(
          a.restaurant.restaurantName || a.restaurant.username || ""
        )
      );
    } else if (restaurantSort === "distance") {
      list.sort((a, b) => {
        const da = distances[a.restaurant._id];
        const db = distances[b.restaurant._id];
        if (da == null && db == null) return 0;
        if (da == null) return 1;
        if (db == null) return -1;
        return da - db;
      });
    }
    return list;
  }, [priceSortedGroups, restaurantSort, distances]);

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
        },
      );

      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        const replace = window.confirm(error.response.data.message);

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
            },
          );

          if (res.data.success) {
            toast.success("Cart updated successfully.");
          }
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to update cart.");
        }
      } else {
        toast.error(
          error.response?.data?.message || "Failed to add item to cart.",
        );
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

  return (
    <div className="min-h-screen bg-[#FFF8F2] px-4 py-5">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {restaurantFilter
            ? `${restaurantFilterName || "Restaurant"} menu`
            : "Order from your favorite restaurants"}
        </h1>
        <p className="text-gray-500 mb-6">
          {restaurantFilter
            ? "Showing items from this restaurant only"
            : "Browse menus and filter or sort them the way you like"}
        </p>

        {/* ── Category filter (image based) ── */}
        <div className="flex gap-5 overflow-x-auto pb-3 mb-5 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
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

        {/* ── Search ── */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative max-w-md flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search restaurant or dish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl h-10"
            />
          </div>

          {restaurantFilter && (
            <button
              onClick={clearRestaurantFilter}
              className="flex items-center gap-1.5 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors px-3 py-2 rounded-xl"
            >
              {restaurantFilterName || "Filtered"}
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {distanceRange !== "all" && (
            <button
              onClick={() => setDistanceRange("all")}
              className="flex items-center gap-1.5 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors px-3 py-2 rounded-xl"
            >
              {DISTANCE_RANGES.find((r) => r.value === distanceRange)?.label}
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1.5 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors px-3 py-2 rounded-xl"
            >
              {selectedCategory}
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {vegFilter !== "all" && (
            <button
              onClick={() => setVegFilter("all")}
              className="flex items-center gap-1.5 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors px-3 py-2 rounded-xl"
            >
              {vegFilter === "veg" ? "Veg only" : "Non-veg only"}
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* ── Sort & filter controls ── */}
        {/* Kept to a single row on every screen size: it scrolls
            horizontally on narrow (phone) viewports and fits without
            wrapping on wide (laptop/desktop) ones. */}
        <div className="flex flex-nowrap items-center gap-3 bg-orange-50    mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 w-[170px] sm:w-[190px] shrink-0">
            <UtensilsCrossed className="h-4 w-4 text-orange-500 flex-shrink-0" />
            <Select
              value={restaurantFilter || "all"}
              onValueChange={(val) => {
                if (val === "all") {
                  clearRestaurantFilter();
                  return;
                }
                const match = groups.find((g) => g.restaurant._id === val);
                setRestaurantFilter(val);
                setRestaurantFilterName(
                  match?.restaurant.restaurantName || match?.restaurant.username || ""
                );
              }}
            >
              <SelectTrigger className="h-9 text-sm rounded-xl border-gray-200">
                <SelectValue placeholder="All restaurants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Restaurants</SelectItem>
                {groups.map(({ restaurant }) => (
                  <SelectItem key={restaurant._id} value={restaurant._id}>
                    {restaurant.restaurantName || restaurant.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 w-[170px] sm:w-[190px] shrink-0">
            <ArrowUpDown className="h-4 w-4 text-orange-500 flex-shrink-0" />
            <Select value={restaurantSort} onValueChange={handleRestaurantSortChange}>
              <SelectTrigger className="h-9 text-sm rounded-xl border-gray-200">
                <SelectValue placeholder="Sort restaurants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">Restaurant name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Restaurant name (Z-A)</SelectItem>
                <SelectItem value="distance">Nearest to me</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 w-[170px] sm:w-[190px] shrink-0">
            <IndianRupee className="h-4 w-4 text-orange-500 flex-shrink-0" />
            <Select value={priceSort} onValueChange={setPriceSort}>
              <SelectTrigger className="h-9 text-sm rounded-xl border-gray-200">
                <SelectValue placeholder="Sort items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default item order</SelectItem>
                <SelectItem value="low_high">Price: Low to High</SelectItem>
                <SelectItem value="high_low">Price: High to Low</SelectItem>
                <SelectItem value="rating_high">Rating: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ── Distance range filter ── */}
          <div className="flex items-center gap-2 w-[170px] sm:w-[190px] shrink-0">
            <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
            <Select value={distanceRange} onValueChange={handleDistanceRangeChange}>
              <SelectTrigger className="h-9 text-sm rounded-xl border-gray-200">
                <SelectValue placeholder="Distance" />
              </SelectTrigger>
              <SelectContent>
                {DISTANCE_RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── Veg / Non-veg filter ── */}
          <div className="flex items-center gap-2 w-[170px] sm:w-[190px] shrink-0">
            <Leaf className="h-4 w-4 text-orange-500 flex-shrink-0" />
            <Select value={vegFilter} onValueChange={setVegFilter}>
              <SelectTrigger className="h-9 text-sm rounded-xl border-gray-200">
                <SelectValue placeholder="Veg / Non-veg" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All items</SelectItem>
                <SelectItem value="veg">Veg only</SelectItem>
                <SelectItem value="non-veg">Non-veg only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {locating && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0 whitespace-nowrap">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Locating you & calculating distances…
            </span>
          )}

          {(restaurantSort === "distance" || distanceRange !== "all") && !locating && (
            <button
              onClick={handleSortByDistance}
              className="flex items-center gap-1 text-xs text-orange-600 font-medium hover:text-orange-700 shrink-0 whitespace-nowrap sm:ml-auto"
            >
              <LocateFixed className="h-3.5 w-3.5" />
              Refresh location
            </button>
          )}
        </div>
        {sortedGroups.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            {vegFilter !== "all"
              ? `No ${vegFilter === "veg" ? "veg" : "non-veg"} dishes found.`
              : selectedCategory
              ? `No dishes found for "${selectedCategory}".`
              : distanceRange !== "all"
              ? "No restaurants found in this distance range."
              : "No restaurants or dishes match your search."}
          </p>
        ) : (
          <div className="space-y-10">
            {sortedGroups.map(({ restaurant, foods }) => {
              const dist = distances[restaurant._id];
              return (
                <section key={restaurant._id}>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={
                        restaurant.photoUrl ||
                        restaurant.avatar ||
                        "https://placehold.co/56x56?text=R"
                      }
                      alt={restaurant.restaurantName || restaurant.username}
                      className="h-14 w-14 rounded-xl object-cover border"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold">
                          {restaurant.restaurantName || restaurant.username}
                        </h2>
                        <Badge
                          className={
                            restaurant.isOpen
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-gray-200 text-gray-600 hover:bg-gray-200"
                          }
                        >
                          {restaurant.isOpen ? "Open" : "Closed"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-0.5 flex-wrap">
                        {restaurant.cuisine && <span>{restaurant.cuisine}</span>}
                        {restaurant.openingTime && restaurant.closingTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {restaurant.openingTime} - {restaurant.closingTime}
                          </span>
                        )}
                        {dist != null && (
                          <span className="flex items-center gap-1 text-orange-600 font-medium">
                            <Navigation className="h-3 w-3" />
                            {dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`} away
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {foods.length === 0 ? (
                    <p className="text-sm text-gray-400 pl-1">
                      No items listed yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {foods.map((food) => (
                        <FoodCard
                          key={food._id}
                          food={{
                            ...food,
                            restaurant,
                          }}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerBrowse;