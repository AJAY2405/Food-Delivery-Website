import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = import.meta.env.VITE_API_BASE_URL;

export default function DeleteFood({ item, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await axios.delete(
        `${API}/api/profile/restaurant/menu/${item._id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );
      if (res.data.success) {
        toast.success("Item removed from menu");
        onDeleted(item._id);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-[28px] border border-white/40 bg-white/90 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,.18)] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-red-500" />
            <h2 className="text-lg font-bold text-gray-800">Remove Item</h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/60 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          {/* Item preview */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 bg-orange-50">
              <img
                src={item.image || `https://via.placeholder.com/56?text=🍽️`}
                alt={item.name}
                className="h-full w-full object-cover"
                onError={(e) => { e.target.src = "https://via.placeholder.com/56?text=🍽️"; }}
              />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-800 truncate">{item.name}</p>
              <p className="text-sm text-orange-500 font-semibold">₹{item.price}</p>
              <p className="text-xs text-gray-500 truncate">{item.description}</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 text-center">
            This will permanently remove <span className="font-semibold text-gray-800">"{item.name}"</span> from your menu. This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl"
          >
            Keep Item
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white gap-2"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Removing...</>
            ) : (
              <><Trash2 className="h-4 w-4" /> Remove</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
