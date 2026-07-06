import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const authMultipartHeaders = () => ({
  headers: {
    "Content-Type": "multipart/form-data",
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, UtensilsCrossed } from "lucide-react";

const AddFood = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Main Course",
    type: "veg",
    isAvailable: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price) {
      return toast.error("Name and price are required");
    }

    try {
      setSaving(true);
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (imageFile) data.append("file", imageFile);

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/restaurant/food/add`,
        data,
        authMultipartHeaders()
      );

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/restaurant/menu");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UtensilsCrossed className="h-6 w-6 text-orange-500" />
              Add Food Item
            </CardTitle>
            <CardDescription>Add a new item to your menu</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={preview || "https://placehold.co/80x80?text=Food"}
                  alt="Food preview"
                  className="h-20 w-20 rounded-xl object-cover border"
                />
                <div>
                  <Label
                    htmlFor="foodImage"
                    className="cursor-pointer text-sm font-medium text-orange-500"
                  >
                    Upload Image
                  </Label>
                  <Input
                    id="foodImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div>
                <Label>Item Name</Label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Paneer Butter Masala"
                  className="mt-1 rounded-xl h-10"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Short description of the dish"
                  className="mt-1 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0"
                    className="mt-1 rounded-xl h-10"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Starter / Main Course / Dessert"
                    className="mt-1 rounded-xl h-10"
                  />
                </div>
              </div>

              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="mt-1 rounded-xl h-10">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veg">🟢 Veg</SelectItem>
                    <SelectItem value="non-veg">🔴 Non-Veg</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <p className="font-medium">Available</p>
                  <p className="text-sm text-gray-500">
                    Turn off if currently out of stock
                  </p>
                </div>
                <Switch
                  checked={form.isAvailable}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, isAvailable: checked }))
                  }
                />
              </div>
            </CardContent>

            <div className="px-6 pb-6">
              <Button
                type="submit"
                disabled={saving}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-orange-600 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Item"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddFood;
