import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getData } from "@/context/userContext";

const authHeaders = (isMultipart = false) => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    ...(isMultipart ? {} : { "Content-Type": "application/json" }),
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, UserCircle2, Lock } from "lucide-react";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user: contextUser, setUser } = getData();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/me`,
        authHeaders()
      );
      if (res.data.success) {
        const u = res.data.user;
        setEmail(u.email);
        setRole(u.role);
        setUsername(u.username);
        setPhone(u.phone);
        setPhotoUrl(u.photoUrl || u.avatar || "");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If the global context already has the user, seed the form instantly
    // (avoids a flash of empty inputs), then quietly refresh from the server.
    if (contextUser) {
      setEmail(contextUser.email);
      setRole(contextUser.role);
      setUsername(contextUser.username);
      setPhone(contextUser.phone);
      setPhotoUrl(contextUser.photoUrl || contextUser.avatar || "");
      setLoading(false);
    }
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleSave = async () => {
    if (!username.trim()) {
      return toast.error("Username is required");
    }
    if (!phone || !String(phone).trim()) {
      return toast.error("Phone number is required");
    }

    try {
      setSaving(true);

      // Email and role are intentionally never sent — they cannot be changed here
      const formData = new FormData();
      formData.append("username", username);
      formData.append("phone", phone);
      if (file) {
        formData.append("file", file);
      }

      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/profile/update`,
        formData,
        authHeaders(true)
      );

      if (res.data.success) {
        toast.success(res.data.message || "Profile updated successfully");

        // Push the fresh user into the global context + localStorage so the
        // navbar and every other page that reads from context update instantly.
        const updatedUser = res.data.user;
        if (updatedUser) {
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        navigate("/profile");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F2]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F2] px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-500 text-sm">
              Update your name, phone, and profile photo
            </p>
          </div>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Account Details</CardTitle>
            <CardDescription>
              Email and account role cannot be changed here
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex flex-col items-center gap-3">
              {previewUrl || photoUrl ? (
                <img
                  src={previewUrl || photoUrl}
                  alt="avatar preview"
                  className="h-24 w-24 rounded-full object-cover border border-orange-100"
                />
              ) : (
                <UserCircle2 className="h-24 w-24 text-orange-300" />
              )}
              <Label
                htmlFor="avatar-upload"
                className="cursor-pointer text-sm text-orange-600 hover:underline"
              >
                Change photo
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div>
              <Label>Username</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                className="mt-1 rounded-xl"
              />
            </div>

            <div>
              <Label>Phone Number</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="mt-1 rounded-xl"
              />
            </div>

            <div>
              <Label className="flex items-center gap-1 text-gray-500">
                <Lock className="h-3.5 w-3.5" /> Email
              </Label>
              <Input
                value={email}
                disabled
                className="mt-1 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">
                Email address can't be changed
              </p>
            </div>

            <div>
              <Label className="flex items-center gap-1 text-gray-500">
                <Lock className="h-3.5 w-3.5" /> Role
              </Label>
              <Input
                value={role}
                disabled
                className="mt-1 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed capitalize"
              />
              <p className="text-xs text-gray-400 mt-1">
                Account role can't be changed
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 rounded-xl w-full"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;