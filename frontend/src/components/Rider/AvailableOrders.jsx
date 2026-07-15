import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2, MapPin, Store, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/context/socketContext";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
});

const timeAgo = (date) => {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  return `${mins} mins ago`;
};

const AvailableOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState(null);
  const { socket } = useSocket();
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/rider/orders/available`,
        authHeaders()
      );
      if (res.data.success) setOrders(res.data.orders);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Fallback poll every 20s in case a socket event is missed.
    const interval = setInterval(fetchOrders, 20000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useEffect(() => {
    if (!socket) return;

    const onReady = () => fetchOrders();
    const onClaimed = ({ orderId }) => {
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    };

    socket.on("order:ready", onReady);
    socket.on("order:claimed", onClaimed);

    return () => {
      socket.off("order:ready", onReady);
      socket.off("order:claimed", onClaimed);
    };
  }, [socket, fetchOrders]);

  const handlePick = async (orderId) => {
    setPicking(orderId);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/rider/orders/${orderId}/pick`,
        {},
        authHeaders()
      );
      if (res.data.success) {
        toast.success("Order picked up — head to the restaurant");
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
        navigate(`/rider/order/${orderId}`);
      }
    } catch (error) {
      // 409 = someone else already claimed it
      toast.error(error?.response?.data?.message || "Could not pick up this order");
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } finally {
      setPicking(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Available Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-14 text-center">
          <Package className="mx-auto h-12 w-12 text-emerald-300 mb-3" />
          <h2 className="text-lg font-semibold text-gray-800">No orders waiting right now</h2>
          <p className="text-sm text-gray-400 mt-1">New orders will show up here the moment a restaurant packs them.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <Store className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {order.restaurant?.restaurantName || order.restaurant?.username}
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-[180px]">{order.restaurant?.address}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-400 flex items-center gap-1 shrink-0">
                  <Clock className="h-3 w-3" />
                  {timeAgo(order.updatedAt)}
                </span>
              </div>

              <div className="flex items-start gap-2 text-xs text-gray-500">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-500" />
                <span className="truncate">{order.deliveryAddress || "Delivery address on order"}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-dashed border-gray-100">
                <span className="text-xs text-gray-400">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </span>
                <span className="text-sm font-bold text-gray-900">₹{order.total}</span>
              </div>

              <Button
                onClick={() => handlePick(order._id)}
                disabled={picking === order._id}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
              >
                {picking === order._id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Pick Up Order
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableOrders;
