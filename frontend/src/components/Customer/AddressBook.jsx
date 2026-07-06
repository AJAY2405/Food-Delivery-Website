import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const authHeaders = () => ({
  headers: {
    "Content-Type": "application/json",
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  MapPin,
  Phone,
  Plus,
  Pencil,
  Trash2,
  Star,
  ArrowLeft,
  LocateFixed,
} from "lucide-react";

const emptyAddress = {
  label: "Home",
  fullAddress: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  isDefault: false,
};

const AddressBook = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [altPhone, setAltPhone] = useState("");
  const [altPhoneInput, setAltPhoneInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingPhone, setSavingPhone] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyAddress);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/address`,
        authHeaders()
      );
      if (res.data.success) {
        setAddresses(res.data.addresses || []);
        setAltPhone(res.data.altPhone || "");
        setAltPhoneInput(res.data.altPhone || "");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load addresses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddDialog = () => {
    setEditingId(null);
    setForm(emptyAddress);
    setDialogOpen(true);
  };

  const openEditDialog = (address) => {
    setEditingId(address._id);
    setForm({
      label: address.label || "Home",
      fullAddress: address.fullAddress || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      phone: address.phone || "",
      isDefault: address.isDefault || false,
    });
    setDialogOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- Live / current location address ---
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser");
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await axios.get(
            "https://nominatim.openstreetmap.org/reverse",
            {
              params: {
                lat: latitude,
                lon: longitude,
                format: "json",
              },
            }
          );

          const addr = res.data?.address || {};
          const fullAddress = res.data?.display_name || "";
          const city =
            addr.city || addr.town || addr.village || addr.suburb || "";
          const state = addr.state || "";
          const pincode = addr.postcode || "";

          setForm((prev) => ({
            ...prev,
            fullAddress: fullAddress || prev.fullAddress,
            city: city || prev.city,
            state: state || prev.state,
            pincode: pincode || prev.pincode,
          }));

          toast.success("Location detected and address filled in");
        } catch (error) {
          toast.error("Could not resolve your location to an address");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location permission denied");
        } else {
          toast.error("Unable to fetch your current location");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveAddress = async () => {
    if (!form.fullAddress) {
      return toast.error("Full address is required");
    }
    try {
      setSaving(true);
      let res;
      if (editingId) {
        res = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/address/${editingId}`,
          form,
          authHeaders()
        );
      } else {
        res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/address`,
          form,
          authHeaders()
        );
      }
      if (res.data.success) {
        toast.success(res.data.message);
        setAddresses(res.data.addresses);
        setDialogOpen(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/address/${id}`,
        authHeaders()
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setAddresses(res.data.addresses);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete address"
      );
    }
  };

  const handleSetDefault = async (address) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/address/${address._id}`,
        { isDefault: true },
        authHeaders()
      );
      if (res.data.success) {
        toast.success("Default address updated");
        setAddresses(res.data.addresses);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update");
    }
  };

  const handleSaveAltPhone = async () => {
    if (!altPhoneInput) {
      return toast.error("Enter a phone number first");
    }
    try {
      setSavingPhone(true);
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/address/alt-phone/update`,
        { altPhone: altPhoneInput },
        authHeaders()
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setAltPhone(res.data.altPhone);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update phone");
    } finally {
      setSavingPhone(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
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
            <h1 className="text-2xl font-bold text-gray-900">Addresses</h1>
            <p className="text-gray-500 text-sm">
              Manage your delivery addresses and contact number
            </p>
          </div>
        </div>

        {/* Alternate phone number */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-orange-500" />
              Alternate Phone Number
            </CardTitle>
            <CardDescription>
              Add a second number we can reach you on during delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Input
              value={altPhoneInput}
              onChange={(e) => setAltPhoneInput(e.target.value)}
              placeholder="Enter alternate phone number"
              className="rounded-xl h-10"
            />
            <Button
              onClick={handleSaveAltPhone}
              disabled={savingPhone}
              className="bg-orange-500 hover:bg-orange-600 rounded-xl"
            >
              {savingPhone ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : altPhone ? (
                "Update"
              ) : (
                "Save"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Address book */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-orange-500" />
                Saved Addresses
              </CardTitle>
              <CardDescription>
                Add or manage delivery addresses
              </CardDescription>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={openAddDialog}
                  className="bg-orange-500 hover:bg-orange-600 rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Address
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Edit Address" : "Add New Address"}
                  </DialogTitle>
                </DialogHeader>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  className="w-full rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  {locating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <LocateFixed className="h-4 w-4 mr-2" />
                  )}
                  Use my current location
                </Button>

                <div className="space-y-3">
                  <div>
                    <Label>Label</Label>
                    <Input
                      name="label"
                      value={form.label}
                      onChange={handleFormChange}
                      placeholder="Home / Work / Other"
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label>Full Address</Label>
                    <Input
                      name="fullAddress"
                      value={form.fullAddress}
                      onChange={handleFormChange}
                      placeholder="House no, street, locality"
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>City</Label>
                      <Input
                        name="city"
                        value={form.city}
                        onChange={handleFormChange}
                        className="mt-1 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input
                        name="state"
                        value={form.state}
                        onChange={handleFormChange}
                        className="mt-1 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Pincode</Label>
                      <Input
                        name="pincode"
                        value={form.pincode}
                        onChange={handleFormChange}
                        className="mt-1 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label>Phone (for this address)</Label>
                      <Input
                        name="phone"
                        value={form.phone}
                        onChange={handleFormChange}
                        className="mt-1 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    onClick={handleSaveAddress}
                    disabled={saving}
                    className="bg-orange-500 hover:bg-orange-600 rounded-xl w-full"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingId ? (
                      "Update Address"
                    ) : (
                      "Save Address"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>

          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            ) : addresses.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                No saved addresses yet. Add one to get started.
              </p>
            ) : (
              addresses.map((address) => (
                <div
                  key={address._id}
                  className="flex items-start justify-between rounded-xl border border-gray-200 p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{address.label}</span>
                      {address.isDefault && (
                        <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {address.fullAddress}
                      {address.city ? `, ${address.city}` : ""}
                      {address.state ? `, ${address.state}` : ""}
                      {address.pincode ? ` - ${address.pincode}` : ""}
                    </p>
                    {address.phone && (
                      <p className="text-sm text-gray-500">
                        Phone: {address.phone}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(address)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteAddress(address._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {!address.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg h-7 text-xs"
                        onClick={() => handleSetDefault(address)}
                      >
                        <Star className="h-3 w-3 mr-1" /> Set Default
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddressBook;
