import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import RiderNavbar from "./RiderNavbar";
import RiderSidebar from "./RiderSidebar";
import { useSocket } from "@/context/socketContext";
import { Loader2 } from "lucide-react";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
});

const RiderDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/rider/profile`,
          authHeaders()
        );
        if (res.data.success) {
          setIsAvailable(!!res.data.rider?.isAvailable);
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit("rider:online");
  }, [socket]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F5FBF9]">
        <Loader2 className="h-9 w-9 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5FBF9]">
      <RiderNavbar
        isAvailable={isAvailable}
        onToggleAvailable={setIsAvailable}
        onMenuClick={() => setSidebarOpen(true)}
      />
      <div className="flex">
        <RiderSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6">
          {!isAvailable && (
            <div className="max-w-5xl mx-auto mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
              You're offline — flip the switch in the top bar to start receiving orders.
            </div>
          )}
          <div className="max-w-5xl mx-auto">
            <Outlet context={{ isAvailable }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default RiderDashboard;
