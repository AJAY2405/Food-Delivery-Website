import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Filter,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Bike,
  ChefHat,
  PackageCheck,
  CircleDot,
  MapPin,
  Phone,
  Check,
  X,
} from "lucide-react";

/* ── Auth headers ── */
const authHeaders = () => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
  withCredentials: true,
});

/* ── Status config ── */
const STATUS_CONFIG = {
  placed: {
    label: "Placed",
    color: "bg-blue-100 text-blue-700",
    icon: <CircleDot className="h-3.5 w-3.5" />,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-indigo-100 text-indigo-700",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  preparing: {
    label: "Preparing",
    color: "bg-yellow-100 text-yellow-700",
    icon: <ChefHat className="h-3.5 w-3.5" />,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "bg-orange-100 text-orange-700",
    icon: <Bike className="h-3.5 w-3.5" />,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700",
    icon: <PackageCheck className="h-3.5 w-3.5" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

/* ── Helpers ── */
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const dayLabel = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
};

const startOfWeek = () => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

/* ── Revenue stat card ── */
const StatCard = ({ label, value, sub, icon, accent }) => (
  <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">{label}</p>
      <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${accent}`}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400">{sub}</p>}
  </div>
);

/* ── Single order row ── */
const OrderCard = ({ order, onStatusChange, onAcceptReject, updating }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
  const date = new Date(order.createdAt);
  const isNewOrder = order.status === "placed";
  const isBusy = updating === order._id;
  /* Prefer the address saved on the order itself; fall back to the
     customer's profile address if the order was created without one. */
  const resolvedAddress = order.deliveryAddress || order.customer?.address;
  const customerPhone = order.customer?.phone;

  const handleAccept = (e) => {
    e.stopPropagation();
    onAcceptReject(order._id, "accept");
  };

  const handleReject = (e) => {
    e.stopPropagation();
    onAcceptReject(order._id, "reject");
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-orange-100 flex items-center justify-center">
            <ShoppingBag className="h-4 w-4 text-orange-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              #{order._id.slice(-8).toUpperCase()}
            </p>
            <p className="text-xs text-gray-400">
              {order.customer?.username || "Customer"}
              {customerPhone && ` · ${customerPhone}`} ·{" "}
              {date.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="h-3 w-3 text-orange-400 flex-shrink-0" />
              <span className="truncate">
                {resolvedAddress || "No address on file for this customer"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
          <span className="text-sm font-bold text-gray-900">{fmt(order.total)}</span>
          <span
            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}
          >
            {cfg.icon}
            {cfg.label}
          </span>

          {/* Quick Accept / Reject actions for newly placed orders */}
          {isNewOrder && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleAccept}
                disabled={isBusy}
                title="Accept order"
                className="h-7 w-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors disabled:opacity-50"
              >
                {isBusy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={handleReject}
                disabled={isBusy}
                title="Reject order"
                className="h-7 w-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          {/* Delivery address — falls back to the customer's profile address if the order has none */}
          <div className="flex items-start gap-2 rounded-xl bg-gray-50 border border-gray-100 p-3">
            <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400">Delivery address</p>
              <p className={`text-sm ${resolvedAddress ? "text-gray-700" : "text-gray-400 italic"}`}>
                {resolvedAddress || "No address on file — the order has none saved and the customer's profile has no address either."}
              </p>
            </div>
          </div>

          {/* Customer contact — phone number so the restaurant/delivery rider can reach them */}
          {customerPhone && (
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-100 p-3">
              <Phone className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Customer phone</p>
                <a
                  href={`tel:${customerPhone}`}
                  className="text-sm text-gray-700 hover:text-orange-600 font-medium"
                >
                  {customerPhone}
                </a>
              </div>
            </div>
          )}

          {/* Items list */}
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  <span className="font-medium">{item.quantity}×</span> {item.name}
                </span>
                <span className="text-gray-500">{fmt(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between text-xs text-gray-400">
              <span>Subtotal</span>
              <span>{fmt(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Delivery fee</span>
              <span>{fmt(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-gray-900">
              <span>Total</span>
              <span>{fmt(order.total)}</span>
            </div>
          </div>

          {/* Payment info */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span
              className={`px-2 py-0.5 rounded-full font-medium ${
                order.paymentStatus === "paid"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {order.paymentStatus === "paid" ? "Paid" : order.paymentStatus}
            </span>
            <span>·</span>
            <span className="capitalize">{order.paymentMethod}</span>
          </div>

          {/* Accept / Reject — full-width buttons for new orders */}
          {isNewOrder && (
            <div className="flex items-center gap-3 pt-1">
              <Button
                onClick={handleAccept}
                disabled={isBusy}
                className="flex-1 bg-green-500 hover:bg-green-600 rounded-xl h-9 text-sm"
              >
                {isBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Accept Order
              </Button>
              <Button
                onClick={handleReject}
                disabled={isBusy}
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-xl h-9 text-sm"
              >
                <X className="h-4 w-4 mr-1" />
                Reject Order
              </Button>
            </div>
          )}

          {/* Status update — for orders already accepted, move it further along */}
          {!isNewOrder && (
            <div className="flex items-center gap-3 pt-1">
              <p className="text-xs text-gray-500 font-medium">Update status:</p>
              <Select
                value={order.status}
                onValueChange={(val) => onStatusChange(order._id, val)}
                disabled={isBusy || order.status === "delivered" || order.status === "cancelled"}
              >
                <SelectTrigger className="h-8 text-xs rounded-xl border-gray-200 w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">
                      {STATUS_CONFIG[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isBusy && <Loader2 className="h-4 w-4 animate-spin text-orange-500" />}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════ MAIN PAGE ══ */
const RestaurantOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [revenueRange, setRevenueRange] = useState("all");
  const [updating, setUpdating] = useState(null); // order _id being updated

  /* ── Fetch all orders for this restaurant ── */
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/order/restaurant-orders`,
          authHeaders()
        );
        if (res.data.success) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  /* ── Update order status ── */
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/order/restaurant/${orderId}/status`,
        { status: newStatus },
        authHeaders()
      );
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        toast.success(`Order marked as "${STATUS_CONFIG[newStatus].label}"`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Status update failed");
    } finally {
      setUpdating(null);
    }
  };

  /* ── Accept or reject a newly placed order ── */
  const handleAcceptReject = async (orderId, action) => {
    setUpdating(orderId);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/order/restaurant/${orderId}/${action}`,
        {},
        authHeaders()
      );
      if (res.data.success) {
        const newStatus = action === "accept" ? "confirmed" : "cancelled";
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        toast.success(action === "accept" ? "Order accepted" : "Order rejected");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${action} order`);
    } finally {
      setUpdating(null);
    }
  };

  /* ── Filtered orders (status) ── */
  const filteredOrders = useMemo(
    () =>
      statusFilter === "all"
        ? orders
        : orders.filter((o) => o.status === statusFilter),
    [orders, statusFilter]
  );

  /* ── Group by day ── */
  const groupedByDay = useMemo(() => {
    const groups = {};
    filteredOrders.forEach((order) => {
      const key = new Date(order.createdAt).toDateString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(order);
    });
    // sort days descending
    return Object.entries(groups).sort(
      ([a], [b]) => new Date(b) - new Date(a)
    );
  }, [filteredOrders]);

  /* ── Revenue calculations ── */
  const revenue = useMemo(() => {
    const paidOrders = orders.filter(
      (o) => o.paymentStatus === "paid" && o.status !== "cancelled"
    );

    const sum = (arr) => arr.reduce((acc, o) => acc + (o.total || 0), 0);

    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayOrders = paidOrders.filter(
      (o) => new Date(o.createdAt) >= todayStart
    );
    const weekOrders = paidOrders.filter(
      (o) => new Date(o.createdAt) >= startOfWeek()
    );
    const monthOrders = paidOrders.filter(
      (o) => new Date(o.createdAt) >= startOfMonth()
    );

    return {
      today: { total: sum(todayOrders), count: todayOrders.length },
      week: { total: sum(weekOrders), count: weekOrders.length },
      month: { total: sum(monthOrders), count: monthOrders.length },
      all: { total: sum(paidOrders), count: paidOrders.length },
    };
  }, [orders]);

  /* ── Status count badges for filter tabs ── */
  const statusCounts = useMemo(() => {
    const counts = { all: orders.length };
    ALL_STATUSES.forEach((s) => {
      counts[s] = orders.filter((o) => o.status === s).length;
    });
    return counts;
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const revData = revenue[revenueRange];

  return (
    <div className="min-h-screen bg-[#FFF8F2] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* ── Page header ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:border-orange-300 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500">
              {orders.length} total order{orders.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* ── Revenue stats ── */}
        <div>
          {/* Range selector */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" /> Revenue
            </h2>
            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              {[
                { key: "today", label: "Today" },
                { key: "week", label: "Week" },
                { key: "month", label: "Month" },
                { key: "all", label: "All time" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setRevenueRange(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    revenueRange === key
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Revenue"
              value={fmt(revData.total)}
              sub={`${revData.count} paid orders`}
              icon={<IndianRupee className="h-4 w-4 text-orange-500" />}
              accent="bg-orange-100"
            />
            <StatCard
              label="Delivered"
              value={orders.filter((o) => o.status === "delivered").length}
              sub="completed orders"
              icon={<PackageCheck className="h-4 w-4 text-green-500" />}
              accent="bg-green-100"
            />
            <StatCard
              label="In Progress"
              value={orders.filter(
                (o) =>
                  ["placed", "confirmed", "preparing", "out_for_delivery"].includes(o.status)
              ).length}
              sub="active orders"
              icon={<Clock className="h-4 w-4 text-yellow-500" />}
              accent="bg-yellow-100"
            />
            <StatCard
              label="Cancelled"
              value={orders.filter((o) => o.status === "cancelled").length}
              sub="of all orders"
              icon={<XCircle className="h-4 w-4 text-red-400" />}
              accent="bg-red-50"
            />
          </div>
        </div>

        {/* ── Status filter tabs ── */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Filter className="h-4 w-4 text-gray-400" />
            <p className="text-sm font-medium text-gray-600">Filter by status</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[{ key: "all", label: "All" }, ...ALL_STATUSES.map((s) => ({ key: s, label: STATUS_CONFIG[s].label }))].map(
              ({ key, label }) => (
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
                    {statusCounts[key] ?? 0}
                  </span>
                </button>
              )
            )}
          </div>
        </div>

        {/* ── Day-wise order groups ── */}
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-14 text-center">
            <ShoppingBag className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">
              {statusFilter === "all"
                ? "Orders will appear here once customers start placing them."
                : `No orders with status "${STATUS_CONFIG[statusFilter]?.label}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedByDay.map(([dateKey, dayOrders]) => {
              const dayRevenue = dayOrders
                .filter((o) => o.paymentStatus === "paid" && o.status !== "cancelled")
                .reduce((acc, o) => acc + o.total, 0);

              return (
                <div key={dateKey}>
                  {/* Day header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-orange-500" />
                      <h3 className="text-sm font-semibold text-gray-700">
                        {dayLabel(dateKey)}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {dayOrders.length} order{dayOrders.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {dayRevenue > 0 && (
                      <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                        {fmt(dayRevenue)}
                      </span>
                    )}
                  </div>

                  {/* Orders */}
                  <div className="space-y-3">
                    {dayOrders.map((order) => (
                      <OrderCard
                        key={order._id}
                        order={order}
                        onStatusChange={handleStatusChange}
                        onAcceptReject={handleAcceptReject}
                        updating={updating}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantOrders;