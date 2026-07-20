// components/Rider/DeliveryMap.jsx
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


const pill = (bg, glyph) =>
  L.divIcon({
    className: "",
    html: `<div style="
      background:${bg};width:34px;height:34px;border-radius:9999px;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 3px 10px rgba(0,0,0,.28);border:2.5px solid #fff;
      font-size:16px;line-height:1;">${glyph}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

const riderIcon = pill("#10b981", "🏍️");
const restaurantIcon = pill("#f97316", "🍴");
const customerIcon = pill("#3b82f6", "👤");

const FitBounds = ({ points }) => {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || points.length < 2) return;
    map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 16 });
    fitted.current = true;
  }, [points, map]);
  return null;
};

/** Smoothly re-centers on the rider as new location pings arrive. */
const FollowRider = ({ pos }) => {
  const map = useMap();
  const started = useRef(false);
  useEffect(() => {
    if (!pos) return;
    if (!started.current) {
      map.setView([pos.lat, pos.lng], 15);
      started.current = true;
    } else {
      map.panTo([pos.lat, pos.lng], { animate: true, duration: 0.8 });
    }
  }, [pos?.lat, pos?.lng, map]);
  return null;
};

const useRoute = (from, to) => {
  const [route, setRoute] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (!from || !to) {
      setRoute(null);
      return;
    }
    let cancelled = false;

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const coords = data?.routes?.[0]?.geometry?.coordinates;
        if (coords) {
          setRoute(coords.map(([lng, lat]) => [lat, lng]));
          setIsFallback(false);
        } else {
          setRoute([[from.lat, from.lng], [to.lat, to.lng]]);
          setIsFallback(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRoute([[from.lat, from.lng], [to.lat, to.lng]]);
          setIsFallback(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [from?.lat, from?.lng, to?.lat, to?.lng]);

  return { route, isFallback };
};

const DeliveryMap = ({ rider, restaurant, customer, height = "20rem", className = "" }) => {
  const routeStart = rider || restaurant;
  const { route, isFallback } = useRoute(routeStart, customer);

  const points = [rider, restaurant, customer].filter(Boolean).map((p) => [p.lat, p.lng]);
  const center = points[0] || [28.6139, 77.209]; // sensible default, overwritten once points exist

  if (points.length === 0) {
    return (
      <div style={{ height }} className={`w-full flex items-center justify-center bg-gray-50 text-sm text-gray-400 ${className}`}>
        Waiting for location…
      </div>
    );
  }

  return (
    <div style={{ height }} className={`w-full relative overflow-hidden ${className}`}>
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom
        zoomControl={true}
        attributionControl={false}
        className="w-full h-full"
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

        {route && (
          <Polyline
            positions={route}
            pathOptions={{
              color: "#f97316",
              weight: 4,
              opacity: 0.85,
              dashArray: isFallback ? "6 8" : null,
            }}
          />
        )}

        {restaurant && <Marker position={[restaurant.lat, restaurant.lng]} icon={restaurantIcon} />}
        {customer && <Marker position={[customer.lat, customer.lng]} icon={customerIcon} />}
        {rider && <Marker position={[rider.lat, rider.lng]} icon={riderIcon} />}

        {rider ? <FollowRider pos={rider} /> : <FitBounds points={points} />}
      </MapContainer>

      <span className="absolute bottom-1 left-1.5 text-[10px] text-gray-400 bg-white/70 px-1.5 py-0.5 rounded pointer-events-none">
        © OpenStreetMap contributors, © CARTO
      </span>
    </div>
  );
};

export default DeliveryMap;
