import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  EyeOff,
  Loader2,
  UtensilsCrossed,
  User,
  Mail,
  Phone,
  Lock,
  Bike,
  Hash,
} from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
    vehicleType: "bike",
    vehicleNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.username ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      return toast.error("All fields are required");
    }

    if (formData.phone.length !== 10) {
      return toast.error("Phone number must be 10 digits");
    }

    if (formData.role === "rider" && !formData.vehicleNumber) {
      return toast.error("Vehicle number is required for riders");
    }

    try {
      setIsLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/register`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/verify");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm border border-orange-100 shadow-sm rounded-2xl">
        <CardHeader className="space-y-3 pb-2">
          {/* ── Brand mark, matches Login / CustomerBrowse ── */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
            <UtensilsCrossed className="h-6 w-6 text-orange-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            Create Account
          </CardTitle>
          {/* <p className="text-center text-sm text-gray-500">
            Sign up to start ordering from your favorite restaurants
          </p> */}
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-2">
            {/* Full Name */}
            <div>
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-orange-400" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Ajay Sahani"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-9 rounded-xl h-10 border-gray-200 focus-visible:ring-orange-400"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-orange-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-9 rounded-xl h-10 border-gray-200 focus-visible:ring-orange-400"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number
              </Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-orange-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="98xxxxx210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-9 rounded-xl h-10 border-gray-200 focus-visible:ring-orange-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-orange-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-9 pr-10 rounded-xl h-10 border-gray-200 focus-visible:ring-orange-400"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8 rounded-lg cursor-pointer hover:bg-orange-100"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* Register As */}
            <div>
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                Register As
              </Label>
              <Select value={formData.role} onValueChange={handleSelectChange("role")}>
                <SelectTrigger className="mt-1 h-10 w-full text-sm rounded-xl border-gray-200 bg-white cursor-pointer">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer" className="cursor-pointer">
                    Customer
                  </SelectItem>
                  <SelectItem value="restaurant" className="cursor-pointer">
                    Restaurant
                  </SelectItem>
                  <SelectItem value="rider" className="cursor-pointer">
                    Delivery Rider
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rider-only fields */}
            {formData.role === "rider" && (
              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-orange-50 border border-orange-100 p-3">
                <div>
                  <Label htmlFor="vehicleType" className="text-xs font-medium text-gray-700">
                    Vehicle Type
                  </Label>
                  <Select
                    value={formData.vehicleType}
                    onValueChange={handleSelectChange("vehicleType")}
                  >
                    <SelectTrigger className="mt-1 h-9 w-full text-sm rounded-xl border-gray-200 bg-white cursor-pointer">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <Bike className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                        <SelectValue placeholder="Vehicle" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bike" className="cursor-pointer">
                        Motorbike
                      </SelectItem>
                      <SelectItem value="scooter" className="cursor-pointer">
                        Scooter
                      </SelectItem>
                      <SelectItem value="bicycle" className="cursor-pointer">
                        Bicycle
                      </SelectItem>
                      <SelectItem value="car" className="cursor-pointer">
                        Car
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vehicleNumber" className="text-xs font-medium text-gray-700">
                    Vehicle Number
                  </Label>
                  <div className="relative mt-1">
                    <Hash className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-orange-400" />
                    <Input
                      id="vehicleNumber"
                      name="vehicleNumber"
                      placeholder="DL 01 AB 1234"
                      value={formData.vehicleNumber}
                      onChange={handleChange}
                      className="pl-8 h-9 text-sm rounded-xl border-gray-200 bg-white focus-visible:ring-orange-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {/* Signup Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-10 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            {/* Login */}
            <p className="text-center text-sm text-gray-500">
              Already have an account?
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="ml-2 font-medium text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                Login
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Signup;