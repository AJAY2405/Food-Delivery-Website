import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getData } from "@/context/userContext";
import { Eye, EyeOff, Loader2, Mail, Lock, UtensilsCrossed } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = getData();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return toast.error("Email and Password are required");
    }

    try {
      setIsLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/login`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
        toast.success(res.data.message);

        // Riders land on their own dashboard, everyone else goes home.
        if (res.data.user.role === "rider") {
          navigate("/rider");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm border border-orange-100 shadow-sm rounded-2xl">
        <CardHeader className="space-y-3 pb-2">
          {/* ── Brand mark, echoes the restaurant icon used on CustomerBrowse ── */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
            <UtensilsCrossed className="h-6 w-6 text-orange-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            Welcome Back
          </CardTitle>
          <p className="text-center text-sm text-gray-500">
            Log in to keep ordering from your favorite restaurants
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-2">
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
                  placeholder="Enter password"
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

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm font-medium text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </CardContent>

          <div className="px-6 pb-6 space-y-4">
            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-10 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging In...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="ml-2 font-medium text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;