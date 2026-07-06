import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Rider from "../../assets/rider.png";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
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
    <div className="min-h-screen bg-[#FFD8BC] relative overflow-hidden">
      {/* Background Blur */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl"></div>

      <div className="absolute top-20 right-20 w-72 h-72 bg-yellow-200/30 rounded-full blur-3xl"></div>

      <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-orange-200/30 rounded-full blur-3xl"></div>

      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-6xl rounded-[35px] border border-white/40 bg-white/30 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,.12)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* ================= RIGHT SIDE (top on mobile) ================= */}

            <div className="order-1 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFEAD9] to-[#FFF8F2] px-4 py-6 sm:px-6 sm:py-8 lg:order-2 lg:px-8 lg:py-10">
              <div className="absolute top-10 left-10 w-44 h-44 rounded-full bg-orange-200/40 blur-3xl"></div>

              <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full bg-yellow-200/40 blur-3xl"></div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <img
                  src={Rider}
                  alt="Delivery Rider"
                  className="w-48 sm:w-60 md:w-72 lg:w-[430px] xl:w-[500px] drop-shadow-2xl"
                />
              </div>
            </div>

            {/* ================= LEFT SIDE ================= */}

            <div className="order-2 flex items-center justify-center p-4 sm:p-6 lg:order-1 lg:p-8">
              <Card className="w-full max-w-sm border-0 rounded-3xl shadow-xl">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl lg:text-2xl font-bold">
                    Create Account
                  </CardTitle>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    {" "}
                    {/* Full Name */}
                    <div>
                      <Label
                        htmlFor="username"
                        className="text-sm font-medium text-gray-700"
                      >
                        Full Name
                      </Label>

                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Ajay Sahani"
                        value={formData.username}
                        onChange={handleChange}
                        className="mt-1 h-6 rounded-l border-gray-200 bg-gray-50 text-sm focus-visible:ring-2 focus-visible:ring-orange-400"
                      />
                    </div>
                    {/* Email */}
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
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
                        className="mt-1 h-6 rounded-xl border-gray-200 bg-gray-50 text-sm focus-visible:ring-2 focus-visible:ring-orange-400"
                      />
                    </div>
                    {/* Phone */}
                    <div>
                      <Label
                        htmlFor="phone"
                        className="text-sm font-medium text-gray-700"
                      >
                        Phone Number
                      </Label>

                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="98xxxxx210"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 h-6 rounded-xl border-gray-200 bg-gray-50 text-sm focus-visible:ring-2 focus-visible:ring-orange-400"
                      />
                    </div>
                    {/*Password*/}
                    <div>
                      <Label
                        htmlFor="password"
                        className="text-sm font-medium text-gray-700"
                      >
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
                          className="h-6 rounded-xl border-gray-200 bg-gray-50 text-sm pr-10 focus-visible:ring-2 focus-visible:ring-orange-400"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-4 w-4"
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
                      <Label
                        htmlFor="role"
                        className="text-sm font-medium text-gray-700"
                      >
                        Register As
                      </Label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-300"
                      >
                        <option
                          className="bg-orange-100 text-gray-700"
                          value="customer"
                        >
                           Customer
                        </option>

                        <option
                          className="bg-orange-100 text-gray-700"
                          value="restaurant"
                        >
                          Restaurant
                        </option>
                      </select>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-4">
                    {/* Signup Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-orange-700 text-sm font-semibold text-white shadow-lg"
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

                    <p className="text-center text-xs text-gray-500">
                      Already have an account?
                      <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="ml-2 font-semibold text-orange-500 hover:text-orange-600"
                      >
                        Login
                      </button>
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
