import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Satellite, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/context/socketContext";
import DeliveryMap from "./DeliveryMap";
import { geocodeAddress } from "@/utils/geocode";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
});


const LiveTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [order, setOrder] = useState(null);
  const [customerPos, setCustomerPos] = useState(null);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const watchIdRef = useRef(null);
  const lastPersistRef = useRef(0);

  /* Load the order so we can plot the restaurant + customer pins. */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/rider/orders/${orderId}`,
          authHeaders()
        );
        if (res.data.success) {
          setOrder(res.data.order);
          if (res.data.order.deliveryAddress) {
            const pos = await geocodeAddress(res.data.order.deliveryAddress);
            setCustomerPos(pos);
          }
        }
      } catch {
        toast.error("Could not load order details for the map");
      }
    };
    load();
  }, [orderId]);

  /* Stream device GPS. */
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation isn't available on this device");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition({ lat, lng });

        socket?.emit("rider:location", { orderId, lat, lng });

        const now = Date.now();
        if (now - lastPersistRef.current > 10000) {
          lastPersistRef.current = now;
          axios
            .patch(
              `${import.meta.env.VITE_API_BASE_URL}/api/v1/rider/location`,
              { lat, lng, orderId },
              authHeaders()
            )
            .catch(() => {});
        }
      },
      (err) => setError(err.message || "Could not access location"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [orderId, socket]);

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
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not mark as delivered");
    } finally {
      setBusy(false);
    }
  };

  const restaurantPos = useMemo(
    () =>
      order?.restaurant?.latitude && order?.restaurant?.longitude
        ? { lat: order.restaurant.latitude, lng: order.restaurant.longitude }
        : null,
    [order]
  );

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden rounded-2xl">
      <DeliveryMap rider={position} restaurant={restaurantPos} customer={customerPos} height="100%" />

      {/* ── Floating top bar ── */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-start gap-2">
        <button
          onClick={() => navigate(-1)}
          className="h-11 w-11 shrink-0 rounded-full bg-white shadow-lg flex items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4 text-gray-700" />
        </button>

        <div className="flex-1 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Satellite className="h-4 w-4 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {position ? "Broadcasting your location" : "Getting your GPS position…"}
              </p>
              {order?.customer?.username && (
                <p className="text-xs text-gray-400 truncate">Delivering to {order.customer.username}</p>
              )}
            </div>
          </div>
          {order?.customer?.phone && (
            <a href={`tel:${order.customer.phone}`} className="shrink-0">
              <Button size="sm" variant="outline" className="rounded-full border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                <Phone className="h-3.5 w-3.5" />
              </Button>
            </a>
          )}
        </div>
      </div>

      {error && (
        <div className="absolute top-20 left-3 right-3 z-[1000] bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2">
          {error}
        </div>
      )}

      {!position && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-[999]">
          <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
        </div>
      )}

      {/* ── Floating bottom action ── */}
      {order?.status === "out_for_delivery" && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000]">
          <Button
            onClick={handleDeliver}
            disabled={busy}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl h-12 shadow-lg"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Mark as Delivered
          </Button>
        </div>
      )}
    </div>
  );
};

export default LiveTracking;
