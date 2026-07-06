import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Rider from "../../assets/rider.png";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getData } from "@/context/userContext";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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

        if (res.data.user.role === "restaurant") {
          navigate("/");
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
    <div className="min-h-screen bg-[#FFD8BC] relative overflow-hidden">

      {/* Background Blur */}

      <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl"></div>

      <div className="absolute top-20 right-20 w-72 h-72 bg-yellow-200/30 rounded-full blur-3xl"></div>

      <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-orange-200/30 rounded-full blur-3xl"></div>

      <div className="flex items-center justify-center min-h-screen px-4 py-8">

        <div className="w-full max-w-6xl rounded-[35px] border border-white/40 bg-white/30 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,.12)] overflow-hidden">

          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* LEFT SIDE */}

            <div className="order-2 lg:order-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">

              <Card className="w-full max-w-sm border-0 rounded-3xl shadow-xl">

                <CardHeader className="space-y-1">

                  {/* <p className="text-orange-500 font-semibold">
                    QuickBite
                  </p> */}

                  <CardTitle className="text-3xl font-bold">
                    Welcome Back
                  </CardTitle>

                </CardHeader>

                <form onSubmit={handleSubmit}>

                  <CardContent className="space-y-4">

                    {/* Email */}

                    <div>

                      <Label
                        htmlFor="email"
                        className="text-sm font-medium"
                      >
                        Email Address
                      </Label>

                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Ajay@gmail.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 h-10 rounded-xl"
                      />

                    </div>

                    {/* Password */}

                    <div>

                      <Label
                        htmlFor="password"
                        className="text-sm font-medium"
                      >
                        Password
                      </Label>

                      <div className="relative mt-1">

                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter Password"
                          value={formData.password}
                          onChange={handleChange}
                          className="h-10 rounded-xl pr-10"
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-8 w-8"
                          onClick={() =>
                            setShowPassword(!showPassword)
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>

                      </div>

                    </div>

                                        {/* Forgot Password */}

                    <div className="flex justify-end">

                      <button
                        type="button"
                        onClick={() => navigate("/forgot-password")}
                        className="text-sm font-medium text-orange-500 hover:text-orange-600"
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
                      className="w-full h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-orange-600 text-white"
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
                        className="ml-2 font-semibold text-orange-500 hover:text-orange-600"
                      >
                        Sign Up
                      </button>

                    </p>

                  </div>

                </form>

              </Card>

            </div>

            {/* ================= RIGHT SIDE ================= */}

            <div className="order-1 lg:order-2 flex items-center justify-center overflow-hidden relative bg-gradient-to-br from-[#FFEAD9] to-[#FFF8F2]">

              {/* Decorative Blur */}

              <div className="absolute top-12 left-12 h-44 w-44 rounded-full bg-orange-200/40 blur-3xl"></div>

              <div className="absolute bottom-12 right-12 h-56 w-56 rounded-full bg-yellow-200/40 blur-3xl"></div>

              <div className="relative z-10 flex flex-col items-center text-center px-8">

                <img
                  src={Rider}
                  alt="Delivery Rider"
                  className="w-56 sm:w-72 lg:w-[450px] xl:w-[520px] drop-shadow-2xl animate-float"
                />
              </div>

            </div>
                      </div>

        </div>

      </div>

    </div>
  );
};

export default Login;