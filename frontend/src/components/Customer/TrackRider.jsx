import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Phone, Loader2, Navigation, Clock, Radio } from "lucide-react";
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

/* Reticle framing — the recurring signature element for this screen. */
const Brackets = ({ className = "", color = "border-amber-400/70" }) => (
  <>
    <span className={`pointer-events-none absolute -top-px -left-px h-3 w-3 border-t-2 border-l-2 rounded-tl-md ${color} ${className}`} />
    <span className={`pointer-events-none absolute -top-px -right-px h-3 w-3 border-t-2 border-r-2 rounded-tr-md ${color} ${className}`} />
    <span className={`pointer-events-none absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 rounded-bl-md ${color} ${className}`} />
    <span className={`pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 rounded-br-md ${color} ${className}`} />
  </>
);

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
      <div className="flex justify-center items-center min-h-screen bg-[#0B1210]">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <span className="beacon-ring absolute inline-flex h-full w-full rounded-full bg-amber-400/40" />
          <Loader2 className="h-6 w-6 animate-spin text-amber-300" />
        </div>
        <style>{`
          @keyframes beacon-sweep { 0% { transform: scale(0.6); opacity: 0.9; } 100% { transform: scale(2.2); opacity: 0; } }
          .beacon-ring { animation: beacon-sweep 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite; }
        `}</style>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B1210]">
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Order not found
        </p>
      </div>
    );
  }

  const restaurantPos =
    order.restaurant?.latitude && order.restaurant?.longitude
      ? { lat: order.restaurant.latitude, lng: order.restaurant.longitude }
      : null;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0B1210]">
      <style>{`
        @keyframes beacon-sweep {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .beacon-ring {
          animation: beacon-sweep 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite;
        }
      `}</style>

      {/* ── Full-bleed map ── */}
      <DeliveryMap
        rider={riderPos}
        restaurant={restaurantPos}
        customer={customerPos}
        height="100%"
      />

      {/* ── Floating top console: back + rider info + call ── */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-start gap-2">
        <button
          onClick={() => navigate(-1)}
          className="h-11 w-11 shrink-0 rounded-md bg-[#0B1210]/90 backdrop-blur-md border border-amber-400/20 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft className="h-4 w-4 text-amber-100" />
        </button>

        <div className="relative flex-1 rounded-md bg-[#0B1210]/90 backdrop-blur-md border border-amber-400/20 shadow-lg px-4 py-3 flex items-center justify-between">
          <Brackets />
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {riderPos && (
                <span className="beacon-ring absolute inline-flex h-full w-full rounded-full bg-amber-400" />
              )}
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  riderPos ? "bg-amber-400" : "bg-zinc-500"
                }`}
              />
            </span>
            <div className="min-w-0">
              <p className="font-bold uppercase tracking-widest text-[11px] text-amber-100 truncate">
                {order.rider?.username || "Rider"}
              </p>
              <p className="font-mono text-[10px] text-zinc-400 capitalize truncate">
                {order.rider
                  ? `${order.rider.vehicleType || "Bike"} · ${order.rider.vehicleNumber || ""}`
                  : "Waiting for a rider to be assigned"}
              </p>
            </div>
          </div>
          {order.rider?.phone && (
            <a href={`tel:${order.rider.phone}`} className="shrink-0 ml-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-md border-amber-400/30 bg-transparent text-amber-300 hover:bg-amber-400/10 hover:text-amber-200"
              >
                <Phone className="h-3.5 w-3.5 mr-1.5" /> Call
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* ── Floating bottom console: status / ETA / open in maps ── */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000]">
        <div className="relative bg-[#0B1210]/90 backdrop-blur-md border border-amber-400/20 rounded-md shadow-lg px-4 py-3.5 flex items-center justify-between">
          <Brackets />
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded capitalize mb-1.5">
              <Radio className="h-3 w-3" />
              {order.status.replace(/_/g, " ")}
            </span>
            {eta ? (
              <p className="font-mono text-sm font-bold text-amber-50 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-300" />
                {eta.mins} min
                <span className="text-zinc-500 font-normal">· {eta.km} km away</span>
              </p>
            ) : (
              <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
                Waiting for signal…
              </p>
            )}
          </div>

          {riderPos && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${riderPos.lat},${riderPos.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-300 hover:text-amber-200 shrink-0 ml-3"
            >
              <Navigation className="h-3.5 w-3.5" /> Open Maps
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackRider;