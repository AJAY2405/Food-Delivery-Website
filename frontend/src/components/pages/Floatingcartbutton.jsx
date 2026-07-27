import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

const authHeaders = () => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
  withCredentials: true,
});

const STORAGE_KEY = "floatingCartButtonPos";
const DRAG_THRESHOLD = 6; 
const SIZE = 56; 
const MARGIN = 12; 
const FloatingCartButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [itemCount, setItemCount] = useState(0);
  const [pos, setPos] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved.x === "number" && typeof saved.y === "number") {
        return saved;
      }
    } catch (_) {
      /* ignore malformed storage */
    }
    return {
      x: window.innerWidth - SIZE - 24,
      y: window.innerHeight - SIZE - 24,
    };
  });

  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const originRef = useRef({ x: 0, y: 0 });
  const btnRef = useRef(null);

  const clampToViewport = useCallback((x, y) => {
    const maxX = window.innerWidth - SIZE - MARGIN;
    const maxY = window.innerHeight - SIZE - MARGIN;
    return {
      x: Math.min(Math.max(x, MARGIN), Math.max(maxX, MARGIN)),
      y: Math.min(Math.max(y, MARGIN), Math.max(maxY, MARGIN)),
    };
  }, []);

  /* ── Fetch cart item count ── */
  const fetchCount = useCallback(async () => {
    if (!localStorage.getItem("accessToken")) {
      setItemCount(0);
      return;
    }
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/cart`,
        authHeaders(),
      );
      if (res.data?.success) {
        setItemCount(res.data.cart?.totalItems || 0);
      }
    } catch (_) {
      /* silently ignore — button just shows last known count */
    }
  }, []);

  useEffect(() => {
    fetchCount();

    window.addEventListener("cart-updated", fetchCount);
    return () => window.removeEventListener("cart-updated", fetchCount);
  }, [fetchCount]);

  useEffect(() => {
    fetchCount();
  }, [location.pathname, fetchCount]);

  // Keep the button inside the viewport if the window is resized
  useEffect(() => {
    const onResize = () => setPos((p) => clampToViewport(p.x, p.y));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampToViewport]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  }, [pos]);

  /* ── Drag handling (pointer events cover mouse + touch) ── */
  const handlePointerDown = (e) => {
    draggingRef.current = true;
    movedRef.current = false;
    startRef.current = { x: e.clientX, y: e.clientY };
    originRef.current = { x: pos.x, y: pos.y };
    btnRef.current?.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      movedRef.current = true;
    }

    if (movedRef.current) {
      const next = clampToViewport(originRef.current.x + dx, originRef.current.y + dy);
      setPos(next);
    }
  };

  const handlePointerUp = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    btnRef.current?.releasePointerCapture?.(e.pointerId);

    if (!movedRef.current) {
      // It was a tap/click, not a drag — go to the cart
      navigate("/cart");
    }
  };

  
  const HIDDEN_ON = [
    "/login",
    "/signup",
    "/verify",
    "/forgot-password",
    "/change-password",
    "/policy",
    "/contact",
    "/about",
    "/cart",
  ];

  const isHiddenRoute = HIDDEN_ON.some((path) =>
    location.pathname.toLowerCase().startsWith(path),
  );
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  if (isHiddenRoute || !isLoggedIn || itemCount === 0) {
    return null;
  }

  return (
    <button
      ref={btnRef}
      type="button"
      aria-label={`View cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: SIZE,
        height: SIZE,
        touchAction: "none",
        zIndex: 60,
      }}
      className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 flex items-center justify-center active:scale-95 transition-transform cursor-grab active:cursor-grabbing select-none"
    >
      <ShoppingCart className="h-6 w-6 text-white" />
      <span
        className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-white text-orange-600 text-xs font-bold flex items-center justify-center border-2 border-orange-500"
      >
        {itemCount > 99 ? "99+" : itemCount}
      </span>
    </button>
  );
};

export default FloatingCartButton;