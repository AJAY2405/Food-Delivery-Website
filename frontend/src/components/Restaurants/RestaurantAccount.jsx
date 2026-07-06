import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  Loader2,
  Store,
  Clock,
  Phone,
  MapPin,
  ChefHat,
  Mail,
  User,
  CheckCircle,
  XCircle,
  Edit,
  CalendarDays,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const RestaurantAccount = () => {
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setRestaurant(res.data.user);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to load restaurant profile"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FFF8F2]">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FFF8F2] px-4">
        <div className="text-center max-w-sm">
          <div className="mx-auto h-16 w-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 mb-4">
            <Store className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Profile Not Found
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Please complete your restaurant account setup to begin accepting food orders.
          </p>
          <Button
            className="mt-6 bg-orange-500 hover:bg-orange-600 rounded-xl w-full shadow-sm"
            onClick={() => navigate("/restaurant/profile")}
          >
            Complete Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F2] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Top Header Label */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Merchant Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage and view your storefront configuration details</p>
          </div>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm hidden sm:flex items-center gap-2"
            onClick={() => navigate("/profile")}
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {/* Unified Profile Layout Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Column 1: Core Summary Card */}
          <Card className="rounded-2xl border-gray-100 overflow-hidden shadow-sm lg:col-span-1 bg-white">
            <div className="relative bg-gradient-to-br from-orange-500 to-amber-500 h-28 flex items-center justify-center">
              <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md p-1.5 rounded-lg text-white">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            
            <CardContent className="relative pt-0 px-6 pb-6 text-center">
              <div className="flex justify-center">
                <img
                  src={
                    restaurant?.photoUrl ||
                    restaurant?.avatar ||
                    "https://placehold.co/180x180?text=Restaurant"
                  }
                  alt="Restaurant logo"
                  className="h-24 w-24 rounded-2xl object-cover border-4 border-white shadow-md -mt-12 bg-white"
                />
              </div>

              <h2 className="mt-4 text-xl font-bold text-gray-900 truncate">
                {restaurant?.restaurantName || "Unnamed Store"}
              </h2>
              
              {restaurant?.cuisine && (
                <Badge variant="secondary" className="mt-1 bg-orange-50 text-orange-700 hover:bg-orange-50 font-medium">
                  {restaurant.cuisine}
                </Badge>
              )}

              <p className="text-gray-500 mt-3 text-xs leading-relaxed line-clamp-3 bg-gray-50 p-3 rounded-xl text-left border border-gray-100">
                {restaurant?.restaurantDescription || "No custom storefront description provided yet."}
              </p>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Operation Status</span>
                {restaurant?.isOpen ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200 shadow-none hover:bg-green-100 rounded-lg gap-1 px-2.5 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Open Now
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 border-red-200 shadow-none hover:bg-red-100 rounded-lg gap-1 px-2.5 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Closed
                  </Badge>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full mt-4 border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs h-10 sm:hidden"
                onClick={() => navigate("/profile")}
              >
                <Edit className="mr-2 h-3.5 w-3.5" /> Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Column 2: Detailed Store Information Settings Grid */}
          <Card className="rounded-2xl border-gray-100 shadow-sm lg:col-span-2 bg-white">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Storefront Profile Information</CardTitle>
              <CardDescription>Core verification fields linked to your public food marketplace presence</CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem 
                icon={<Store className="h-4 w-4" />} 
                label="Registered Corporate Brand" 
                value={restaurant?.restaurantName} 
              />
              <InfoItem 
                icon={<User className="h-4 w-4" />} 
                label="Account Owner Username" 
                value={restaurant?.username} 
              />
              <InfoItem 
                icon={<Mail className="h-4 w-4" />} 
                label="Primary Business Email" 
                value={restaurant?.email} 
              />
              <InfoItem 
                icon={<Phone className="h-4 w-4" />} 
                label="Support Contact Number" 
                value={restaurant?.phone} 
              />
              <InfoItem 
                icon={<ChefHat className="h-4 w-4" />} 
                label="Primary Specialized Cuisine" 
                value={restaurant?.cuisine} 
              />
              <InfoItem 
                icon={<Clock className="h-4 w-4" />} 
                label="Active Operating Schedule Hours" 
                value={
                  restaurant?.openingTime && restaurant?.closingTime
                    ? `${restaurant.openingTime} to ${restaurant.closingTime}`
                    : null
                } 
              />
              <div className="sm:col-span-2">
                <InfoItem 
                  icon={<MapPin className="h-4 w-4" />} 
                  label="Physical Location Address Delivery Dropoff" 
                  value={restaurant?.address} 
                />
              </div>

              {/* Time stamps log row updates */}
              <div className="sm:col-span-2 mt-2 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Onboarded: {restaurant?.createdAt ? new Date(restaurant.createdAt).toLocaleDateString() : "-"}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Last Sync: {restaurant?.updatedAt ? new Date(restaurant.updatedAt).toLocaleDateString() : "-"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
};

// Extracted Subcomponent for cleaner inline item grid spacing
const InfoItem = ({ icon, label, value }) => {
  return (
    <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 flex gap-3 items-start">
      <div className="mt-0.5 p-1.5 rounded-lg bg-orange-100 text-orange-600 flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="block text-sm font-medium text-gray-800 mt-0.5 break-words">
          {value || <span className="text-gray-300 italic font-normal">Not Configured</span>}
        </span>
      </div>
    </div>
  );
};

export default RestaurantAccount;