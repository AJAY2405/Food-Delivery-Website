import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, History, Store, Calendar, CheckCircle2 } from "lucide-react";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
});

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n ?? 0);

const DeliveryHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/rider/orders/history`,
          authHeaders()
        );
        if (res.data.success) setOrders(res.data.orders);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Delivery History</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-14 text-center">
          <History className="mx-auto h-12 w-12 text-emerald-300 mb-3" />
          <h2 className="text-lg font-semibold text-gray-800">No deliveries yet</h2>
          <p className="text-sm text-gray-400 mt-1">Completed deliveries will show up here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Store className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {order.restaurant?.restaurantName || order.restaurant?.username}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {new Date(order.deliveredAt || order.updatedAt).toLocaleString("en-IN", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="h-3 w-3" /> Delivered
                </span>
                <span className="text-sm font-bold text-gray-900">{fmt(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryHistory;
