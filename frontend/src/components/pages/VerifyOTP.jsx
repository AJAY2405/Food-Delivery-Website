import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Loader2, RotateCcw } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";


const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef([]);
  const { email } = useParams();
  const navigate = useNavigate();

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/verify-otp/${email}`,
        { otp: finalOtp },
        { headers: { "Content-Type": "application/json" } }
      );
      setSuccessMessage(res.data.message);
      setIsVerified(true);
      setTimeout(() => {
        navigate(`/change-password/${email}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const clearOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setSuccessMessage("");
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-orange-100 via-white to-orange-50 overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-orange-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>

      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-orange-700">Verify Your Email</h1>
            <p className="text-gray-600">
              We've sent a 6-digit verification code to <span className="font-medium">{email}</span>
            </p>
          </div>

          {/* OTP Card */}
          <Card className="w-full shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="text-center space-y-1">
              <CardTitle className="text-2xl text-orange-600">Enter Verification Code</CardTitle>
              <CardDescription>
                {isVerified
                  ? "Code verified successfully! Redirecting..."
                  : "Enter the 6-digit code sent to your email"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {successMessage && (
                <p className="text-orange-600 text-sm text-center mb-4">{successMessage}</p>
              )}

              {isVerified ? (
                <div className="flex flex-col items-center text-center space-y-4 py-6">
                  <div className="bg-orange-100 rounded-full p-3">
                    <CheckCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-medium text-lg">Verification Successful</h3>
                  <p className="text-gray-600">You will be redirected to reset your password shortly.</p>
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                    <span className="text-sm text-gray-500">Redirecting...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between mb-6">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        type="text"
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        maxLength={1}
                        ref={(el) => (inputRefs.current[index] = el)}
                        className="w-12 h-12 text-center text-xl font-bold"
                      />
                    ))}
                  </div>
                  <div className="space-y-3">
                    <Button
                      onClick={handleVerify}
                      disabled={isLoading || otp.some((digit) => digit === "")}
                      className="bg-orange-600 hover:bg-orange-500 transition-all duration-200 w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify Code"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearOtp}
                      className="w-full hover:bg-orange-50 transition-all duration-200"
                      disabled={isLoading || isVerified}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter className="flex justify-center text-sm text-gray-600">
              <p>
                Wrong email?{" "}
                <Link to="/forgot-password" className="text-orange-600 hover:underline font-medium">
                  Go back
                </Link>
              </p>
            </CardFooter>
          </Card>

          <div className="text-center text-xs text-gray-500">
            <p>
              For testing purposes, use code: <span className="font-mono font-medium">123456</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
