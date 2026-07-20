import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Radio, Phone, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/context/socketContext";
import DeliveryMap from "./DeliveryMap";
import { geocodeAddress } from "@/utils/geocode";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
});

/* Great-circle distance between two lat/lng points, in meters. */
const distanceMeters = (a, b) => {
  if (!a || !b) return null;
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const formatDistance = (meters) => {
  if (meters == null) return null;
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`;
};

/* Reticle framing — the recurring signature element for this screen.
   Four corner brackets around a panel, echoing a targeting / tracking HUD. */
const Brackets = ({ className = "", color = "border-amber-400/70" }) => (
  <>
    <span className={`pointer-events-none absolute -top-px -left-px h-3 w-3 border-t-2 border-l-2 rounded-tl-md ${color} ${className}`} />
    <span className={`pointer-events-none absolute -top-px -right-px h-3 w-3 border-t-2 border-r-2 rounded-tr-md ${color} ${className}`} />
    <span className={`pointer-events-none absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 rounded-bl-md ${color} ${className}`} />
    <span className={`pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 rounded-br-md ${color} ${className}`} />
  </>
);

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
        toast.success("Delivery completed");
        navigate("/rider/picked-orders");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not mark as delivered");
    } finally {
      setBusy(false);
    }
  };

  const remainingDistance = useMemo(
    () => formatDistance(distanceMeters(position, customerPos)),
    [position, customerPos]
  );

  const restaurantPos = useMemo(
    () =>
      order?.restaurant?.latitude && order?.restaurant?.longitude
        ? { lat: order.restaurant.latitude, lng: order.restaurant.longitude }
        : null,
    [order]
  );

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden rounded-2xl bg-[#0B1210]">
      {/* Local keyframes for the beacon sweep — scoped to this screen only. */}
      <style>{`
        @keyframes beacon-sweep {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .beacon-ring {
          animation: beacon-sweep 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite;
        }
        .console-grid {
          background-image:
            linear-gradient(rgba(251,191,36,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251,191,36,0.05) 1px, transparent 1px);
          background-size: 28px 28px;
        }
      `}</style>

      <DeliveryMap rider={position} restaurant={restaurantPos} customer={customerPos} height="100%" />

      {/* ── Floating top console ── */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-start gap-2">
        <button
          onClick={() => navigate(-1)}
          className="relative h-11 w-11 shrink-0 rounded-md bg-[#0B1210]/90 backdrop-blur-md border border-amber-400/20 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft className="h-4 w-4 text-amber-100" />
        </button>

        <div className="relative flex-1 rounded-md bg-[#0B1210]/90 backdrop-blur-md border border-amber-400/20 shadow-lg px-4 py-3 flex items-center justify-between">
          <Brackets />
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {position && (
                <span className="beacon-ring absolute inline-flex h-full w-full rounded-full bg-amber-400" />
              )}
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  position ? "bg-amber-400" : "bg-zinc-500"
                }`}
              />
            </span>
            <div className="min-w-0">
              <p className="font-bold uppercase tracking-widest text-[11px] text-amber-100 truncate">
                {position ? "Live — Broadcasting" : "Acquiring Signal"}
              </p>
              {position ? (
                <p className="font-mono text-[10px] text-zinc-400 truncate">
                  {remainingDistance ? `${remainingDistance} to drop-off` : `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`}
                </p>
              ) : order?.customer?.username ? (
                <p className="font-mono text-[10px] text-zinc-400 truncate">
                  → {order.customer.username}
                </p>
              ) : null}
            </div>
          </div>
          {order?.customer?.phone && (
            <a href={`tel:${order.customer.phone}`} className="shrink-0 ml-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-md border-amber-400/30 bg-transparent text-amber-300 hover:bg-amber-400/10 hover:text-amber-200"
              >
                <Phone className="h-3.5 w-3.5" />
              </Button>
            </a>
          )}
        </div>
      </div>

      {error && (
        <div className="absolute top-20 left-3 right-3 z-[1000] rounded-md bg-red-950/90 backdrop-blur-md border border-red-500/30 text-red-200 text-xs font-mono tracking-wide px-4 py-2.5">
          SIGNAL ERROR — {error}
        </div>
      )}

      {!position && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0B1210]/70 console-grid z-[999]">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <span className="beacon-ring absolute inline-flex h-full w-full rounded-full bg-amber-400/40" />
            <Radio className="h-6 w-6 text-amber-300" />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-200/80">
            Acquiring GPS signal
          </p>
        </div>
      )}

      {/* ── Floating bottom console ── */}
      {order?.status === "out_for_delivery" && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000]">
          {remainingDistance && (
            <div className="relative mb-2 rounded-md bg-[#0B1210]/90 backdrop-blur-md border border-amber-400/20 shadow-lg px-4 py-2.5 flex items-center justify-center gap-2">
              <Brackets />
              <MapPin className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              <p className="font-mono text-xs tracking-wide text-amber-100">
                <span className="font-bold">{remainingDistance}</span>
                <span className="text-zinc-400 uppercase tracking-widest text-[10px] ml-2">
                  remaining to drop-off
                </span>
              </p>
            </div>
          )}
          <div className="relative">
            <Brackets />
            <Button
              onClick={handleDeliver}
              disabled={busy}
              className="w-full bg-amber-400 hover:bg-amber-300 text-[#0B1210] font-bold uppercase tracking-widest text-sm rounded-md h-14 shadow-lg disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Mark as Delivered
            </Button>
          </div>
          {!remainingDistance && customerPos && (
            <p className="mt-2 flex items-center justify-center gap-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              <MapPin className="h-3 w-3" /> Drop-off pin confirmed
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveTracking;