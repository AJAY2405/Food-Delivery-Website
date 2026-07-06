// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import { getData } from "@/context/userContext";

// const authHeaders = (isMultipart = false) => ({
//   headers: {
//     Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//     ...(isMultipart ? {} : { "Content-Type": "application/json" }),
//   },
//   withCredentials: true,
// });

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { Loader2, Store, UtensilsCrossed, LocateFixed } from "lucide-react";

// const RestaurantProfilePage = () => {
//   const { setUser } = getData();
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [locating, setLocating] = useState(false);
//   const [avatarFile, setAvatarFile] = useState(null);
//   const [preview, setPreview] = useState("");

//   const [form, setForm] = useState({
//     restaurantName: "",
//     restaurantDescription: "",
//     cuisine: "",
//     openingTime: "",
//     closingTime: "",
//     isOpen: true,
//     address: "",
//     phone: "",
//   });

//   // Always pull the latest saved values from the server, instead of
//   // trusting whatever happens to be cached in localStorage.
//   const fetchProfile = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(
//         `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/me`,
//         authHeaders()
//       );
//       if (res.data.success) {
//         const u = res.data.user;
//         setForm({
//           restaurantName: u.restaurantName || "",
//           restaurantDescription: u.restaurantDescription || "",
//           cuisine: u.cuisine || "",
//           openingTime: u.openingTime || "",
//           closingTime: u.closingTime || "",
//           isOpen: u.isOpen !== undefined ? u.isOpen : true,
//           address: u.address || "",
//           phone: u.phone || "",
//         });
//         setPreview(u.photoUrl || u.avatar || "");
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Failed to load profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setAvatarFile(file);
//       setPreview(URL.createObjectURL(file));
//     }
//   };

//   // --- Live / current location address ---
//   const handleUseCurrentLocation = () => {
//     if (!navigator.geolocation) {
//       return toast.error("Geolocation is not supported by your browser");
//     }

//     setLocating(true);
//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;
//         try {
//           const res = await axios.get(
//             "https://nominatim.openstreetmap.org/reverse",
//             { params: { lat: latitude, lon: longitude, format: "json" } }
//           );

//           const fullAddress = res.data?.display_name || "";
//           if (fullAddress) {
//             setForm((prev) => ({ ...prev, address: fullAddress }));
//             toast.success("Location detected and address filled in");
//           } else {
//             toast.error("Could not resolve your location to an address");
//           }
//         } catch (error) {
//           toast.error("Could not resolve your location to an address");
//         } finally {
//           setLocating(false);
//         }
//       },
//       (error) => {
//         setLocating(false);
//         if (error.code === error.PERMISSION_DENIED) {
//           toast.error("Location permission denied");
//         } else {
//           toast.error("Unable to fetch your current location");
//         }
//       },
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       setSaving(true);

//       const data = new FormData();
//       Object.entries(form).forEach(([key, value]) => {
//         data.append(key, value);
//       });
//       if (avatarFile) {
//         data.append("file", avatarFile);
//       }

//       const res = await axios.put(
//         `${import.meta.env.VITE_API_BASE_URL}/api/v1/restaurant/profile/update`,
//         data,
//         authHeaders(true)
//       );

//       if (res.data.success) {
//         toast.success(res.data.message);
//         if (res.data.user) {
//           setUser(res.data.user);
//           localStorage.setItem("user", JSON.stringify(res.data.user));
//         }
//       }
//     } catch (error) {
//       toast.error(
//         error?.response?.data?.message || "Failed to update profile"
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#FFF8F2] px-4 py-10">
//       <div className="mx-auto max-w-2xl">
//         <Card className="rounded-2xl shadow-sm">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2 text-2xl">
//               <Store className="h-6 w-6 text-orange-500" />
//               Restaurant Profile
//             </CardTitle>
//             <CardDescription>
//               Update your restaurant details, timings and availability
//             </CardDescription>
//           </CardHeader>

//           <form onSubmit={handleSubmit}>
//             <CardContent className="space-y-4">
//               <div className="flex items-center gap-4">
//                 <img
//                   src={preview || "https://placehold.co/80x80?text=Logo"}
//                   alt="Restaurant logo"
//                   className="h-20 w-20 rounded-xl object-cover border"
//                 />
//                 <div>
//                   <Label
//                     htmlFor="avatar"
//                     className="cursor-pointer text-sm font-medium text-orange-500"
//                   >
//                     Change Logo
//                   </Label>
//                   <Input
//                     id="avatar"
//                     type="file"
//                     accept="image/*"
//                     className="hidden"
//                     onChange={handleFileChange}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <Label>Restaurant Name</Label>
//                 <Input
//                   name="restaurantName"
//                   value={form.restaurantName}
//                   onChange={handleChange}
//                   placeholder="e.g. Tasty Bites"
//                   className="mt-1 rounded-xl h-10"
//                 />
//               </div>

//               <div>
//                 <Label>Description</Label>
//                 <Textarea
//                   name="restaurantDescription"
//                   value={form.restaurantDescription}
//                   onChange={handleChange}
//                   placeholder="Tell customers about your restaurant"
//                   className="mt-1 rounded-xl"
//                 />
//               </div>

//               <div>
//                 <Label>Cuisine</Label>
//                 <Input
//                   name="cuisine"
//                   value={form.cuisine}
//                   onChange={handleChange}
//                   placeholder="e.g. North Indian, Chinese"
//                   className="mt-1 rounded-xl h-10"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <Label>Opening Time</Label>
//                   <Input
//                     type="time"
//                     name="openingTime"
//                     value={form.openingTime}
//                     onChange={handleChange}
//                     className="mt-1 rounded-xl h-10"
//                   />
//                 </div>
//                 <div>
//                   <Label>Closing Time</Label>
//                   <Input
//                     type="time"
//                     name="closingTime"
//                     value={form.closingTime}
//                     onChange={handleChange}
//                     className="mt-1 rounded-xl h-10"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <div className="flex items-center justify-between">
//                   <Label>Address</Label>
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="sm"
//                     onClick={handleUseCurrentLocation}
//                     disabled={locating}
//                     className="h-7 px-2 text-xs text-orange-600 hover:bg-orange-50"
//                   >
//                     {locating ? (
//                       <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
//                     ) : (
//                       <LocateFixed className="h-3.5 w-3.5 mr-1" />
//                     )}
//                     Use current location
//                   </Button>
//                 </div>
//                 <Input
//                   name="address"
//                   value={form.address}
//                   onChange={handleChange}
//                   placeholder="Restaurant address"
//                   className="mt-1 rounded-xl h-10"
//                 />
//               </div>

//               <div>
//                 <Label>Phone</Label>
//                 <Input
//                   name="phone"
//                   value={form.phone}
//                   onChange={handleChange}
//                   className="mt-1 rounded-xl h-10"
//                 />
//               </div>

//               <div className="flex items-center justify-between rounded-xl border p-4">
//                 <div className="flex items-center gap-2">
//                   <UtensilsCrossed className="h-5 w-5 text-orange-500" />
//                   <div>
//                     <p className="font-medium">Currently Accepting Orders</p>
//                     <p className="text-sm text-gray-500">
//                       Toggle off if you're closed temporarily
//                     </p>
//                   </div>
//                 </div>
//                 <Switch
//                   checked={form.isOpen}
//                   onCheckedChange={(checked) =>
//                     setForm((prev) => ({ ...prev, isOpen: checked }))
//                   }
//                 />
//               </div>
//             </CardContent>

//             <div className="px-6 pb-6">
//               <Button
//                 type="submit"
//                 disabled={saving}
//                 className="w-full h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-orange-600 text-white"
//               >
//                 {saving ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Saving...
//                   </>
//                 ) : (
//                   "Save Changes"
//                 )}
//               </Button>
//             </div>
//           </form>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default RestaurantProfilePage;




import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Store, UtensilsCrossed, LocateFixed, CheckCircle2 } from "lucide-react";

const RestaurantProfilePage = () => {
  const { setUser } = getData();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [form, setForm] = useState({
    restaurantName: "",
    restaurantDescription: "",
    cuisine: "",
    openingTime: "",
    closingTime: "",
    isOpen: true,
    address: "",
    phone: "",
    // Real GPS coordinates — kept separate from the human-readable
    // `address` string so distance calculations never have to
    // re-derive them by forward-geocoding text (unreliable, and the
    // reason "nearest to me" / distance filtering used to fail).
    latitude: null,
    longitude: null,
  });

  // Always pull the latest saved values from the server, instead of
  // trusting whatever happens to be cached in localStorage.
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/me`,
        authHeaders()
      );
      if (res.data.success) {
        const u = res.data.user;
        setForm({
          restaurantName: u.restaurantName || "",
          restaurantDescription: u.restaurantDescription || "",
          cuisine: u.cuisine || "",
          openingTime: u.openingTime || "",
          closingTime: u.closingTime || "",
          isOpen: u.isOpen !== undefined ? u.isOpen : true,
          address: u.address || "",
          phone: u.phone || "",
          latitude: u.latitude ?? null,
          longitude: u.longitude ?? null,
        });
        setPreview(u.photoUrl || u.avatar || "");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // If the address text is hand-edited after a location was
      // captured, the saved lat/lng no longer matches it — clear them
      // so we don't ship stale coordinates for a different address.
      ...(name === "address" ? { latitude: null, longitude: null } : {}),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
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
            { params: { lat: latitude, lon: longitude, format: "json" } }
          );

          const fullAddress = res.data?.display_name || "";
          if (fullAddress) {
            // Save both: the readable address for display, AND the raw
            // coordinates that produced it — these are what distance
            // math actually needs.
            setForm((prev) => ({
              ...prev,
              address: fullAddress,
              latitude,
              longitude,
            }));
            toast.success("Location detected and address filled in");
          } else {
            toast.error("Could not resolve your location to an address");
          }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        // Skip null lat/lng rather than sending the literal string "null"
        if (value === null || value === undefined) return;
        data.append(key, value);
      });
      if (avatarFile) {
        data.append("file", avatarFile);
      }

      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/restaurant/profile/update`,
        data,
        authHeaders(true)
      );

      if (res.data.success) {
        toast.success(res.data.message);
        if (res.data.user) {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F2] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Store className="h-6 w-6 text-orange-500" />
              Restaurant Profile
            </CardTitle>
            <CardDescription>
              Update your restaurant details, timings and availability
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={preview || "https://placehold.co/80x80?text=Logo"}
                  alt="Restaurant logo"
                  className="h-20 w-20 rounded-xl object-cover border"
                />
                <div>
                  <Label
                    htmlFor="avatar"
                    className="cursor-pointer text-sm font-medium text-orange-500"
                  >
                    Change Logo
                  </Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div>
                <Label>Restaurant Name</Label>
                <Input
                  name="restaurantName"
                  value={form.restaurantName}
                  onChange={handleChange}
                  placeholder="e.g. Tasty Bites"
                  className="mt-1 rounded-xl h-10"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  name="restaurantDescription"
                  value={form.restaurantDescription}
                  onChange={handleChange}
                  placeholder="Tell customers about your restaurant"
                  className="mt-1 rounded-xl"
                />
              </div>

              <div>
                <Label>Cuisine</Label>
                <Input
                  name="cuisine"
                  value={form.cuisine}
                  onChange={handleChange}
                  placeholder="e.g. North Indian, Chinese"
                  className="mt-1 rounded-xl h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Opening Time</Label>
                  <Input
                    type="time"
                    name="openingTime"
                    value={form.openingTime}
                    onChange={handleChange}
                    className="mt-1 rounded-xl h-10"
                  />
                </div>
                <div>
                  <Label>Closing Time</Label>
                  <Input
                    type="time"
                    name="closingTime"
                    value={form.closingTime}
                    onChange={handleChange}
                    className="mt-1 rounded-xl h-10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label>Address</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleUseCurrentLocation}
                    disabled={locating}
                    className="h-7 px-2 text-xs text-orange-600 hover:bg-orange-50"
                  >
                    {locating ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    ) : (
                      <LocateFixed className="h-3.5 w-3.5 mr-1" />
                    )}
                    Use current location
                  </Button>
                </div>
                <Input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Restaurant address"
                  className="mt-1 rounded-xl h-10"
                />
                {form.latitude != null && form.longitude != null ? (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Precise location saved — customers can sort/filter by
                    distance to you
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 mt-1">
                    No precise location saved yet — use "Use current
                    location" so customers can find you by distance
                  </p>
                )}
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="mt-1 rounded-xl h-10"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Currently Accepting Orders</p>
                    <p className="text-sm text-gray-500">
                      Toggle off if you're closed temporarily
                    </p>
                  </div>
                </div>
                <Switch
                  checked={form.isOpen}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, isOpen: checked }))
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
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantProfilePage;