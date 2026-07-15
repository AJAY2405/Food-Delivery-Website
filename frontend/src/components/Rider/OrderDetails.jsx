import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  ArrowLeft,
  Phone,
  MapPin,
  Store,
  User,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
});

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n ?? 0);

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/rider/orders/${orderId}`,
          authHeaders()
        );
        if (res.data.success) setOrder(res.data.order);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Could not load order");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  const handlePick = async () => {
    setBusy(true);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/rider/orders/${orderId}/pick`,
        {},
        authHeaders()
      );
      if (res.data.success) {
        toast.success("Order picked up");
        setOrder(res.data.order);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not pick up this order");
    } finally {
      setBusy(false);
    }
  };

  const handleDeliver = async () => {
    if (!window.confirm("Confirm this order has been handed to the customer?")) return;
    setBusy(true);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/rider/orders/${orderId}/deliver`,
        {},
        authHeaders()
      );
      if (res.data.success) {
        toast.success("Delivery completed 🎉");
        navigate("/rider/picked-orders");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not mark as delivered");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-center text-gray-500 py-20">Order not found.</p>;
  }

  const mapsUrl = (lat, lng, label) =>
    lat && lng
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label || "")}`;

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <span className="text-sm font-bold text-gray-900">{fmt(order.total)}</span>
        </div>

        {/* Restaurant pickup point */}
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 space-y-2">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5" /> Pickup from
          </p>
          <p className="font-medium text-gray-900">
            {order.restaurant?.restaurantName || order.restaurant?.username}
          </p>
          <p className="text-sm text-gray-500">{order.restaurant?.address}</p>
          <div className="flex gap-2 pt-1">
            <a
              href={mapsUrl(order.restaurant?.latitude, order.restaurant?.longitude, order.restaurant?.address)}
              target="_blank" rel="noreferrer" className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full rounded-lg">
                <Navigation className="h-3.5 w-3.5 mr-1.5" /> Directions
              </Button>
            </a>
            {order.restaurant?.phone && (
              <a href={`tel:${order.restaurant.phone}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full rounded-lg">
                  <Phone className="h-3.5 w-3.5 mr-1.5" /> Call
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Customer drop-off point — only fully visible once the rider owns the order */}
        <div className="rounded-xl bg-orange-50 border border-orange-100 p-4 space-y-2">
          <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> Deliver to
          </p>
          <p className="font-medium text-gray-900">{order.customer?.username}</p>
          <div className="flex items-start gap-1.5 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            {order.deliveryAddress}
          </div>
          {order.status === "out_for_delivery" && (
            <div className="flex gap-2 pt-1">
              <a href={mapsUrl(null, null, order.deliveryAddress)} target="_blank" rel="noreferrer" className="flex-1">
                <Button variant="outline" size="sm" className="w-full rounded-lg">
                  <Navigation className="h-3.5 w-3.5 mr-1.5" /> Directions
                </Button>
              </a>
              <a href={`tel:${order.customer?.phone}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full rounded-lg">
                  <Phone className="h-3.5 w-3.5 mr-1.5" /> Call {order.customer?.phone}
                </Button>
              </a>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</p>
          {order.items.map((item, i) => (
            <div key={item._id ?? i} className="flex justify-between text-sm text-gray-700">
              <span>{item.quantity}× {item.name}</span>
              <span>{fmt(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        {order.status === "ready_for_pickup" && !order.rider && (
          <Button onClick={handlePick} disabled={busy} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
            {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Pick Up Order
          </Button>
        )}

        {order.status === "out_for_delivery" && (
          <div className="grid grid-cols-2 gap-2">
            <Link to={`/rider/track/${order._id}`}>
              <Button variant="outline" className="w-full rounded-xl">
                <Navigation className="h-4 w-4 mr-1.5" /> Live Map
              </Button>
            </Link>
            <Button onClick={handleDeliver} disabled={busy} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <CheckCircle2 className="h-4 w-4 mr-1.5" />}
              Delivered
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
