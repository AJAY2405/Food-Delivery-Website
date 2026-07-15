import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Phone, Loader2, Navigation, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/context/socketContext";
import DeliveryMap from "@/components/Rider/DeliveryMap";
import { geocodeAddress } from "@/utils/geocode";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
});

/* Haversine distance in km — good enough for an ETA estimate, no API needed. */
const distanceKm = (a, b) => {
  if (!a || !b) return null;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

const TrackRider = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riderPos, setRiderPos] = useState(null);
  const [customerPos, setCustomerPos] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/order/my-orders`,
          authHeaders()
        );
        if (res.data.success) {
          const found = res.data.orders.find((o) => o._id === orderId);
          setOrder(found || null);
          if (found?.deliveryAddress) {
            const pos = await geocodeAddress(found.deliveryAddress);
            setCustomerPos(pos);
          }
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("order:join", orderId);

    const onLocation = (data) => {
      if (data.orderId === orderId) setRiderPos({ lat: data.lat, lng: data.lng });
    };
    const onStatus = (data) => {
      if (data.orderId === orderId) {
        setOrder((prev) => (prev ? { ...prev, status: data.status } : prev));
        if (data.status === "delivered") toast.success("Your order has been delivered!");
      }
    };

    socket.on("rider:location", onLocation);
    socket.on("order:status", onStatus);

    return () => {
      socket.emit("order:leave", orderId);
      socket.off("rider:location", onLocation);
      socket.off("order:status", onStatus);
    };
  }, [socket, orderId]);

  const eta = useMemo(() => {
    const km = distanceKm(riderPos, customerPos);
    if (km == null) return null;
    const mins = Math.max(1, Math.round((km / 20) * 60)); // ~20km/h city average
    return { km: km.toFixed(1), mins };
  }, [riderPos, customerPos]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FFF8F2]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-center text-gray-500 py-20">Order not found.</p>;
  }

  const restaurantPos =
    order.restaurant?.latitude && order.restaurant?.longitude
      ? { lat: order.restaurant.latitude, lng: order.restaurant.longitude }
      : null;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100">
      {/* ── Full-bleed map ── */}
      <DeliveryMap
        rider={riderPos}
        restaurant={restaurantPos}
        customer={customerPos}
        height="100%"
      />

      {/* ── Floating top bar: back + rider info + call ── */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-start gap-2">
        <button
          onClick={() => navigate(-1)}
          className="h-11 w-11 shrink-0 rounded-full bg-white shadow-lg flex items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4 text-gray-700" />
        </button>

        <div className="flex-1 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {order.rider?.username || "Rider"}
            </p>
            <p className="text-xs text-gray-400 capitalize truncate">
              {order.rider ? `${order.rider.vehicleType || "Bike"} · ${order.rider.vehicleNumber || ""}` : "Waiting for a rider to be assigned"}
            </p>
          </div>
          {order.rider?.phone && (
            <a href={`tel:${order.rider.phone}`} className="shrink-0">
              <Button size="sm" variant="outline" className="rounded-full border-orange-200 text-orange-600 hover:bg-orange-50">
                <Phone className="h-3.5 w-3.5 mr-1.5" /> Call Rider
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* ── Floating bottom card: status / ETA / open in maps ── */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000]">
        <div className="bg-white rounded-2xl shadow-lg px-4 py-3.5 flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full capitalize mb-1">
              {order.status.replace(/_/g, " ")}
            </span>
            {eta ? (
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-500" />
                {eta.mins} min away · {eta.km} km
              </p>
            ) : (
              <p className="text-sm text-gray-400">Waiting for rider's location…</p>
            )}
          </div>

          {riderPos && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${riderPos.lat},${riderPos.lng}`}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-orange-600"
            >
              <Navigation className="h-3.5 w-3.5" /> Open in Maps
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackRider;
