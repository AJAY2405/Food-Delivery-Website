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
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm border border-orange-200 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold text-center text-orange-900">
            Create Account
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Full Name */}
            <div>
              <Label htmlFor="username" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Ajay Sahani"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 focus-visible:ring-orange-400"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 focus-visible:ring-orange-400"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="98xxxxx210"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 focus-visible:ring-orange-400"
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pr-10 focus-visible:ring-orange-400"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Register As */}
            <div>
              <Label htmlFor="role" className="text-sm font-medium">
                Register As
              </Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 w-full h-9 rounded-md border border-orange-200 bg-white px-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              >
                <option value="customer">Customer</option>
                <option value="restaurant">Restaurant</option>
              </select>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {/* Signup Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
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
                className="ml-2 font-medium text-orange-600 hover:text-orange-700"
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