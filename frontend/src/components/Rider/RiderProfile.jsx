import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Star, Package, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
});

const RiderProfile = () => {
  const [user, setUser] = useState(null);
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: "", vehicleType: "bike", vehicleNumber: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/rider/profile`,
          authHeaders()
        );
        if (res.data.success) {
          setUser(res.data.user);
          setRider(res.data.rider);
          setForm({
            username: res.data.user.username || "",
            vehicleType: res.data.rider.vehicleType || "bike",
            vehicleNumber: res.data.rider.vehicleNumber || "",
          });
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/rider/profile`,
        form,
        authHeaders()
      );
      if (res.data.success) {
        toast.success("Profile updated");
        setUser(res.data.user);
        setRider(res.data.rider);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.photoUrl} />
          <AvatarFallback className="bg-emerald-100 text-emerald-600 font-bold text-xl">
            {user?.username?.[0]?.toUpperCase() || "R"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-gray-900">{user?.username}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <p className="text-sm text-gray-400">{user?.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <Package className="mx-auto h-5 w-5 text-emerald-500 mb-1" />
          <p className="text-xl font-bold text-gray-900">{rider?.totalDeliveries ?? 0}</p>
          <p className="text-xs text-gray-400">Deliveries</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <Star className="mx-auto h-5 w-5 text-amber-400 mb-1" />
          <p className="text-xl font-bold text-gray-900">{rider?.rating?.toFixed?.(1) ?? "5.0"}</p>
          <p className="text-xs text-gray-400">Rating</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Bike className="h-4 w-4 text-emerald-500" /> Vehicle & Details
        </div>

        <div>
          <Label htmlFor="username">Full Name</Label>
          <Input id="username" name="username" value={form.username} onChange={handleChange} className="mt-1" />
        </div>

        <div>
          <Label htmlFor="vehicleType">Vehicle Type</Label>
          <select
            id="vehicleType"
            name="vehicleType"
            value={form.vehicleType}
            onChange={handleChange}
            className="mt-1 w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="bike">Motorbike</option>
            <option value="scooter">Scooter</option>
            <option value="bicycle">Bicycle</option>
            <option value="car">Car</option>
          </select>
        </div>

        <div>
          <Label htmlFor="vehicleNumber">Vehicle Number</Label>
          <Input id="vehicleNumber" name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} className="mt-1" />
        </div>

        <Button type="submit" disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default RiderProfile;
