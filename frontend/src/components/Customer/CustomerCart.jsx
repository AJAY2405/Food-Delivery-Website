import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getData } from "@/context/userContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Loader2,
  ArrowRight,
  Store,
  CreditCard,
  ShieldCheck,
  MapPin,
  LocateFixed,
  Pencil,
  Check,
} from "lucide-react";

const authHeaders = () => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
  withCredentials: true,
});

const EMPTY_CART = { items: [], restaurant: null, subtotal: 0, totalItems: 0 };

/* ── Load Razorpay script once ── */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/* ── Delivery address card shown above the bill summary ── */
const DeliveryAddressCard = ({ address, onSave, saved }) => {
  const [editing, setEditing] = useState(!address);
  const [draft, setDraft] = useState(address || "");
  const [locating, setLocating] = useState(false);

  const handleSave = () => {
    if (!draft.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }
    onSave(draft.trim());
    setEditing(false);
  };

  /* ── Use the browser's GPS location, reverse-geocoded into a readable address ── */
  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location access isn't supported in this browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = await res.json();
          if (data?.display_name) {
            setDraft(data.display_name);
            setEditing(true);
            toast.success("Location detected — review and save");
          } else {
            toast.error("Couldn't determine an address for your location");
          }
        } catch (err) {
          toast.error("Failed to look up an address for your location");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        toast.error(
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied"
            : "Couldn't get your current location",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-orange-500" />
          Delivery Address
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleUseLiveLocation}
            disabled={locating}
            className="text-xs text-orange-600 font-medium flex items-center gap-1 hover:text-orange-700 disabled:opacity-50"
          >
            {locating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <LocateFixed className="h-3 w-3" />
            )}
            Use current location
          </button>
          {!editing && address && (
            <button
              onClick={() => {
                setDraft(address);
                setEditing(true);
              }}
              className="text-xs text-orange-600 font-medium flex items-center gap-1 hover:text-orange-700"
            >
              <Pencil className="h-3 w-3" /> Change
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="House / flat no., street, area, city, PIN code"
            className="rounded-xl text-sm min-h-[80px]"
          />
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-orange-500 hover:bg-orange-600 rounded-xl"
          >
            <Check className="h-3.5 w-3.5 mr-1" /> Save Address
          </Button>
        </div>
      ) : (
        <p className="text-sm text-gray-700">{address}</p>
      )}

      {!address && !editing && (
        <p className="text-xs text-red-500 mt-1">
          Add a delivery address to place your order.
        </p>
      )}
    </div>
  );
};

const CustomerCart = () => {
  const navigate = useNavigate();
  const { user } = getData();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/cart`,
        authHeaders(),
      );
      if (res.data.success) setCart(res.data.cart || EMPTY_CART);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /* Prefill from the customer's saved profile address, if they have one */
  useEffect(() => {
    if (user?.address && !deliveryAddress) {
      setDeliveryAddress(user.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      setUpdatingId(itemId);
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/cart/item/${itemId}`,
        { quantity: newQty },
        authHeaders(),
      );
      if (res.data.success) setCart(res.data.cart);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update item");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setUpdatingId(itemId);
      const res = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/cart/item/${itemId}`,
        authHeaders(),
      );
      if (res.data.success) {
        toast.success("Item removed");
        setCart(res.data.cart);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove item");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/cart/clear`,
        authHeaders(),
      );
      if (res.data.success) {
        toast.success("Cart cleared");
        setCart(res.data.cart);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to clear cart");
    }
  };

  /* ── Razorpay checkout ── */
  const handleProceedToCheckout = async () => {
    if (!deliveryAddress.trim()) {
      toast.error("Please add a delivery address before checking out");
      return;
    }

    setPaymentLoading(true);

    /* 1. Load Razorpay SDK */
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Payment service unavailable. Please try again.");
      setPaymentLoading(false);
      return;
    }

    try {
      /* 2. Create Razorpay order on backend — send the address along so
         it can be attached to the order at creation time */
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/payment/create-order`,
        { amount: total, deliveryAddress },
        authHeaders(),
      );

      if (!res.data.success) throw new Error(res.data.message);

      // ✅ FIX: destructure directly from res.data (no nested .data wrapper)
      const {
        orderId,
        amount: orderAmount,
        currency,
        keyId,
        userName,
        userEmail,
        userPhone,
      } = res.data;

      // ✅ Guard: catch missing key before Razorpay modal opens
      if (!keyId) {
        toast.error("Payment configuration error. Please contact support.");
        setPaymentLoading(false);
        return;
      }

      /* 3. Open Razorpay modal */
      const options = {
        key: keyId, // ✅ comes from backend, not .env
        amount: orderAmount, // already in paise from backend
        currency,
        name: "QuickBite",
        description: `Order from ${cart.restaurant?.restaurantName || "Restaurant"}`,
        order_id: orderId,

        handler: async (response) => {
          /* 4. Verify payment signature on backend — send the address again
             in case the order document is actually created at this step */
          try {
            const verifyRes = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/api/v1/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                deliveryAddress,
              },
              authHeaders(),
            );

            if (verifyRes.data.success) {
              toast.success("Payment successful! 🎉");
              navigate(`/order_history`);
            } else {
              toast.error("Payment verification failed. Contact support.");
            }
          } catch (err) {
            toast.error(err?.response?.data?.message || "Verification failed");
          } finally {
            setPaymentLoading(false);
          }
        },

        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },

        theme: { color: "#f97316" },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            toast("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        toast.error(
          `Payment failed: ${response.error.description || "Unknown error"}`,
        );
        setPaymentLoading(false);
      });

      rzp.open();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Could not initiate payment",
      );
      setPaymentLoading(false);
    }
  };

  const deliveryFee = cart.subtotal > 0 ? 30 : 0;
  const total = cart.subtotal + deliveryFee;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F2] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-7 w-7 text-orange-500" />
            Your Cart
          </h1>

          {cart.items.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 rounded-xl"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Clear Cart
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all items from your cart. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="rounded-xl bg-red-500 hover:bg-red-600"
                    onClick={handleClearCart}
                  >
                    Clear Cart
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* ── Empty state ── */}
        {cart.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center bg-white">
            <ShoppingCart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Your cart is empty</p>
            <p className="text-sm text-gray-400 mt-1">
              Browse restaurants and add some delicious food
            </p>
            <Button
              onClick={() => navigate("/customer/browse")}
              className="mt-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-orange-600 text-white rounded-xl"
            >
              Browse Restaurants
            </Button>
          </div>
        ) : (
          <>
            {/* ── Restaurant header ── */}
            {cart.restaurant && (
              <div className="flex items-center gap-3 mb-4 bg-white rounded-2xl border border-gray-200 p-4">
                <img
                  src={
                    cart.restaurant.photoUrl ||
                    cart.restaurant.avatar ||
                    "https://placehold.co/48x48?text=R"
                  }
                  alt={cart.restaurant.restaurantName}
                  className="h-12 w-12 rounded-xl object-cover border"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-orange-500" />
                    <p className="font-semibold">
                      {cart.restaurant.restaurantName ||
                        cart.restaurant.username}
                    </p>
                  </div>
                </div>
                <Badge
                  className={
                    cart.restaurant.isOpen
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-200"
                  }
                >
                  {cart.restaurant.isOpen ? "Open" : "Closed"}
                </Badge>
              </div>
            )}

            {/* ── Cart items ── */}
            <div className="space-y-3 mb-6">
              {cart.items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 p-4"
                >
                  <img
                    src={
                      item.food?.image || "https://placehold.co/64x64?text=Food"
                    }
                    alt={item.food?.name}
                    className="h-16 w-16 rounded-xl object-cover flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                          item.food?.type === "veg"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <p className="font-medium truncate">
                        {item.food?.name || "Item unavailable"}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      ₹{item.priceAtAdd} each
                    </p>
                    {item.food?.isAvailable === false && (
                      <p className="text-xs text-red-500 mt-0.5">
                        No longer available
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-xl">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        disabled={updatingId === item._id}
                        onClick={() =>
                          handleQuantityChange(item._id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">
                        {updatingId === item._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        disabled={updatingId === item._id}
                        onClick={() =>
                          handleQuantityChange(item._id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <p className="w-16 text-right font-semibold text-orange-600 text-sm">
                      ₹{item.lineTotal}
                    </p>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-400 hover:text-red-500"
                      onClick={() => handleRemoveItem(item._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Delivery address ── */}
            <DeliveryAddressCard
              address={deliveryAddress}
              onSave={setDeliveryAddress}
            />

            {/* ── Bill summary ── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span>₹{cart.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              <Button
                className="w-full h-11 mt-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-orange-600 text-white font-semibold"
                onClick={handleProceedToCheckout}
                disabled={
                  paymentLoading ||
                  !cart.restaurant?.isOpen ||
                  !deliveryAddress.trim()
                }
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Preparing payment…
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay ₹{total} with Razorpay
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              {!cart.restaurant?.isOpen && (
                <p className="text-xs text-center text-red-500 mt-1">
                  This restaurant is currently closed. Orders cannot be placed.
                </p>
              )}
              {cart.restaurant?.isOpen && !deliveryAddress.trim() && (
                <p className="text-xs text-center text-red-500 mt-1">
                  Add a delivery address above to continue.
                </p>
              )}

              <div className="flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                <p className="text-xs text-gray-400">
                  Secured by Razorpay · UPI · Cards · Net Banking
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerCart;
