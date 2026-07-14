import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Star, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
  withCredentials: true,
});

const RatingModal = ({ open, onClose, food, orderId, existingRating, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setRating(existingRating?.rating || 0);
      setReview(existingRating?.review || "");
      setHover(0);
    }
  }, [open, existingRating]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!rating) {
      toast.error("Please select a star rating");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/rating/submit`,
        { foodId: food._id, orderId, rating, review },
        authHeaders()
      );
      if (res.data.success) {
        toast.success(existingRating ? "Rating updated" : "Thanks for rating!");
        onSubmitted?.(food._id, { rating, review });
        onClose();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold text-gray-900">
          {existingRating ? "Update your rating" : "Rate this dish"}
        </h2>
        <p className="text-sm text-gray-500 mt-1 mb-4 truncate">{food?.name}</p>

        <div className="flex justify-center gap-1.5 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="p-0.5"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  (hover || rating) >= star
                    ? "fill-orange-500 text-orange-500"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>

        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience (optional)"
          rows={3}
          className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        />

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full mt-4 bg-orange-500 hover:bg-orange-600 rounded-xl"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {existingRating ? "Update Rating" : "Submit Rating"}
        </Button>
      </div>
    </div>
  );
};

export default RatingModal;