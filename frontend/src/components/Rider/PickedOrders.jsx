import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Loader2, Phone, MapPin, Navigation, CheckCircle2, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
});

const PickedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [delivering, setDelivering] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/rider/orders/active`,
        authHeaders()
      );
      if (res.data.success) setOrders(res.data.orders);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load your deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDeliver = async (orderId) => {
    if (!window.confirm("Confirm this order has been handed to the customer?")) return;
    setDelivering(orderId);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/rider/orders/${orderId}/deliver`,
        {},
        authHeaders()
      );
      if (res.data.success) {
        toast.success("Delivery completed 🎉");
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not mark as delivered");
    } finally {
      setDelivering(null);
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
      <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-14 text-center">
          <Bike className="mx-auto h-12 w-12 text-emerald-300 mb-3" />
          <h2 className="text-lg font-semibold text-gray-800">No active deliveries</h2>
          <p className="text-sm text-gray-400 mt-1">Pick up an order from the Available Orders tab to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                    Out for delivery
                  </p>
                  <p className="font-semibold text-gray-900">
                    {order.restaurant?.restaurantName || order.restaurant?.username}
                  </p>
                  <p className="text-xs text-gray-400">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <span className="text-sm font-bold text-gray-900">₹{order.total}</span>
              </div>

              <div className="rounded-xl bg-gray-50 p-3 space-y-1.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Deliver to</p>
                <p className="text-sm font-medium text-gray-800">{order.customer?.username}</p>
                <div className="flex items-start gap-1.5 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{order.deliveryAddress}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <a href={`tel:${order.customer?.phone}`} className="flex-1">
                  <Button variant="outline" className="w-full rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                    <Phone className="h-4 w-4 mr-1.5" />
                    Call Customer
                  </Button>
                </a>
                <Link to={`/rider/order/${order._id}`} className="flex-1">
                  <Button variant="outline" className="w-full rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50">
                    <Navigation className="h-4 w-4 mr-1.5" />
                    Details & Map
                  </Button>
                </Link>
              </div>

              <Button
                onClick={() => handleDeliver(order._id)}
                disabled={delivering === order._id}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
              >
                {delivering === order._id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Mark as Delivered
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PickedOrders;
