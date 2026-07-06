import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getData } from "@/context/userContext";

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
  withCredentials: true,
});

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Pencil,
  Mail,
  Phone,
  ShieldCheck,
  MapPin,
  UserCircle2,
} from "lucide-react";

const ProfileView = () => {
  const navigate = useNavigate();
  const { user, setUser } = getData();
  // Only show a blocking spinner if we don't already have a user in context
  const [loading, setLoading] = useState(!user);

  const refreshUser = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/me`,
        authHeaders()
      );
      if (res.data.success) {
        // Write into the shared context so every page (navbar included)
        // stays in sync — this page never keeps its own separate copy.
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F2]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F2]">
        <p className="text-gray-500">Unable to load profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F2] px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-500 mt-1">
              View your account details
            </p>
          </div>
          <Button
            onClick={() => navigate("/profile/edit")}
            className="bg-orange-500 hover:bg-orange-600 rounded-xl"
          >
            <Pencil className="h-4 w-4 mr-1" /> Edit Profile
          </Button>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row items-center gap-4">
            {user.photoUrl || user.avatar ? (
              <img
                src={user.photoUrl || user.avatar}
                alt={user.username}
                className="h-20 w-20 rounded-full object-cover border border-orange-100"
              />
            ) : (
              <UserCircle2 className="h-20 w-20 text-orange-300" />
            )}
            <div>
              <CardTitle className="text-xl">{user.username}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 capitalize">
                  {user.role}
                </Badge>
                {user.isVerified && (
                  <span className="inline-flex items-center text-xs text-green-600 gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
              <Mail className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm text-gray-700">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
              <Phone className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="text-sm text-gray-700">{user.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-orange-500" />
              Addresses & Contact
            </CardTitle>
            <CardDescription>
              Manage your saved delivery addresses and alternate phone number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => navigate("/profile/addresses")}
            >
              Manage Addresses
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileView;