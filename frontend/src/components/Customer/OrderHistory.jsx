import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Loader2,
  Calendar,
  Store,
  ReceiptIndianRupee,
  PackageCheck,
  CircleDot,
  CheckCircle2,
  ChefHat,
  Bike,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ThumbsDown,
  Star,
} from "lucide-react";
import RatingModal from "./RatingModal";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

/* ── matches order_model.js enum exactly ── */
const STATUS_CONFIG = {
  placed: {
    label: "Placed",
    color: "bg-blue-100 text-blue-700",
    icon: <CircleDot className="h-3.5 w-3.5" />,
    step: 1,
  },
  confirmed: {
    label: "Accepted",
    color: "bg-indigo-100 text-indigo-700",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    step: 2,
  },
  preparing: {
    label: "Preparing",
    color: "bg-yellow-100 text-yellow-700",
    icon: <ChefHat className="h-3.5 w-3.5" />,
    step: 3,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "bg-orange-100 text-orange-700",
    icon: <Bike className="h-3.5 w-3.5" />,
    step: 4,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700",
    icon: <PackageCheck className="h-3.5 w-3.5" />,
    step: 5,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    icon: <XCircle className="h-3.5 w-3.5" />,
    step: 0,
  },
};

const STEPS = ["placed", "confirmed", "preparing", "out_for_delivery", "delivered"];

/* Customers can only cancel while the order hasn't left the kitchen */
const CANCELLABLE_STATUSES = ["placed", "confirmed"];

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
  withCredentials: true,
});

/* ── Status badge label — distinguishes "cancelled by me" from "rejected by restaurant" ── */
const statusLabel = (order) => {
  if (order.status === "cancelled") {
    return order.cancelledBy === "restaurant" ? "Rejected" : "Cancelled";
  }
  return STATUS_CONFIG[order.status]?.label ?? order.status;
};

/* ── Banner shown right under the header for orders that need the customer's attention ── */
const OrderStatusBanner = ({ order }) => {
  if (order.status === "confirmed") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-indigo-50 border border-indigo-100 px-3 py-2 text-sm text-indigo-700">
        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
        The restaurant accepted your order and will start preparing it soon.
      </div>
    );
  }

  if (order.status === "cancelled") {
    if (order.cancelledBy === "restaurant") {
      return (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
          <ThumbsDown className="h-4 w-4 flex-shrink-0" />
          The restaurant rejected this order. You have not been charged, and any
          payment already made will be refunded.
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-600">
        <XCircle className="h-4 w-4 flex-shrink-0" />
        You cancelled this order.
      </div>
    );
  }

  return null;
};

/* ── Progress bar shown for non-cancelled orders ── */
const StatusStepper = ({ status }) => {
  const currentStep = STATUS_CONFIG[status]?.step ?? 0;
  if (status === "cancelled") return null;

  return (
    <div className="mt-4 mb-1">
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const done = currentStep > i + 1;
          const active = currentStep === i + 1;
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all ${
                    done
                      ? "bg-orange-500 border-orange-500 text-white"
                      : active
                      ? "bg-white border-orange-500 text-orange-500"
                      : "bg-white border-gray-200 text-gray-300"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span
                  className={`mt-1 text-[10px] font-medium whitespace-nowrap hidden sm:block ${
                    done || active ? "text-orange-600" : "text-gray-300"
                  }`}
                >
                  {STATUS_CONFIG[s].label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 mb-4 sm:mb-5 rounded-full transition-all ${
                    currentStep > i + 1 ? "bg-orange-400" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/* ── Single order card ── */
const OrderCard = ({ order, onCancel, cancelling }) => {
  const [expanded, setExpanded] = useState(false);
  const [ratings, setRatings] = useState({});
  const [ratingsLoaded, setRatingsLoaded] = useState(false);
  const [ratingTarget, setRatingTarget] = useState(null);

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.placed;
  const canCancel = CANCELLABLE_STATUSES.includes(order.status);
  const total = order.total ?? order.totalAmount ?? 0;
  const isRejected = order.status === "cancelled" && order.cancelledBy === "restaurant";

  useEffect(() => {
    if (expanded && order.status === "delivered" && !ratingsLoaded) {
      axios
        .get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/rating/order/${order._id}`, authHeaders())
        .then((res) => {
          if (res.data.success) setRatings(res.data.ratings || {});
        })
        .catch(() => {})
        .finally(() => setRatingsLoaded(true));
    }
  }, [expanded, order.status, order._id, ratingsLoaded]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* ── Card header ── */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          {/* Left: restaurant + date */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Store className="h-5 w-5 text-orange-500" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {order.restaurant?.restaurantName || order.restaurant?.username || "Restaurant"}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                <Calendar className="h-3 w-3" />
                {new Date(order.createdAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          {/* Right: status + total + chevron */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}
            >
              {cfg.icon}
              {statusLabel(order)}
              {isRejected && <span className="sr-only"> by restaurant</span>}
            </span>
            <span className="text-sm font-bold text-gray-900">{fmt(total)}</span>
          </div>
        </div>

        {/* order ID + item count peek */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-400">
            #{order._id.slice(-8).toUpperCase()} ·{" "}
            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
          </p>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          {/* Accepted / rejected / cancelled banner */}
          <OrderStatusBanner order={order} />

          {/* Progress stepper */}
          <StatusStepper status={order.status} />

          {/* Items */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Items
            </p>
            {order.items.map((item, i) => {
              const foodId = item.food?._id || item.food;
              const myRating = ratings[foodId];
              return (
                <div
                  key={item._id ?? i}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700">
                    <span className="font-medium">{item.quantity}×</span>{" "}
                    {item.name || item.food?.name}
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">
                      {fmt((item.price ?? item.priceAtAdd ?? 0) * item.quantity)}
                    </span>

                    {order.status === "delivered" && (
                      <button
                        onClick={() =>
                          setRatingTarget({ _id: foodId, name: item.name || item.food?.name })
                        }
                        className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700"
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            myRating ? "fill-orange-500" : ""
                          }`}
                        />
                        {myRating ? myRating.rating.toFixed(1) : "Rate"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Bill summary */}
            <div className="border-t border-dashed border-gray-200 pt-2 space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Subtotal</span>
                <span>{fmt(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Delivery fee</span>
                <span>{fmt(order.deliveryFee ?? 30)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-1">
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <span
              className={`px-2 py-0.5 rounded-full font-medium ${
                order.paymentStatus === "paid"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {order.paymentStatus === "paid" ? "Paid" : (order.paymentStatus ?? "Pending")}
            </span>
            <span>·</span>
            <span className="capitalize">{order.paymentMethod ?? "razorpay"}</span>
            {order.deliveryAddress && (
              <>
                <span>·</span>
                <span className="truncate max-w-[200px]">{order.deliveryAddress}</span>
              </>
            )}
          </div>

          {/* Cancel button */}
          {canCancel && (
            <div className="pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(order._id)}
                disabled={cancelling === order._id}
                className="rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 h-9"
              >
                {cancelling === order._id ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 mr-1.5" />
                )}
                Cancel Order
              </Button>
              <p className="text-xs text-gray-400 mt-1.5">
                You can cancel while the restaurant hasn't started preparing yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Rating modal ── */}
      <RatingModal
        open={!!ratingTarget}
        onClose={() => setRatingTarget(null)}
        food={ratingTarget}
        orderId={order._id}
        existingRating={ratingTarget ? ratings[ratingTarget._id] : null}
        onSubmitted={(foodId, data) =>
          setRatings((prev) => ({ ...prev, [foodId]: data }))
        }
      />
    </div>
  );
};

/* ══════════════════════════════════════════════ MAIN PAGE ══ */
const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/order/my-orders`,
          authHeaders()
        );
        if (res.data.success) {
          setOrders(res.data.orders || []);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(orderId);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/order/cancel/${orderId}`,
        { status: "cancelled" },
        authHeaders()
      );
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId
              ? { ...o, status: "cancelled", cancelledBy: "customer" }
              : o
          )
        );
        toast.success("Order cancelled successfully");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(null);
    }
  };

  /* Filter tabs */
  const TABS = [
    { key: "all", label: "All" },
    { key: "placed", label: "Placed" },
    { key: "confirmed", label: "Accepted" },
    { key: "preparing", label: "Preparing" },
    { key: "out_for_delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled / Rejected" },
  ];

  const filtered =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const counts = { all: orders.length };
  Object.keys(STATUS_CONFIG).forEach((s) => {
    counts[s] = orders.filter((o) => o.status === s).length;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FFF8F2]">
        <Loader2 className="h-9 w-9 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F2] py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:border-orange-300 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500">
              {orders.length} order{orders.length !== 1 ? "s" : ""} placed
            </p>
          </div>
        </div>

        {/* Status filter tabs */}
        {orders.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {TABS.map(({ key, label }) =>
              counts[key] === 0 && key !== "all" ? null : (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    statusFilter === key
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                  }`}
                >
                  {label}
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      statusFilter === key
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {counts[key] ?? 0}
                  </span>
                </button>
              )
            )}
          </div>
        )}

        {/* Orders list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-14 text-center">
            <PackageCheck className="mx-auto h-12 w-12 text-orange-300 mb-3" />
            <h2 className="text-lg font-semibold text-gray-800">
              {statusFilter === "all" ? "No orders yet" : `No ${STATUS_CONFIG[statusFilter]?.label ?? ""} orders`}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {statusFilter === "all"
                ? "Your order history will appear here."
                : "Try a different filter above."}
            </p>
            {statusFilter === "all" && (
              <Button
                onClick={() => navigate("/")}
                className="mt-5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
              >
                Browse Restaurants
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onCancel={handleCancel}
                cancelling={cancelling}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;