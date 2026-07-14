import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, UtensilsCrossed } from "lucide-react";
import AllFoods from "./AllFoods";
import CustomerBrowse from "./CustomerBrowse";

const CustomerHomepage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [search] = useState(location.state?.search || "");
  const [heroLoaded, setHeroLoaded] = useState(false);

  const savedUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (location.state?.search) {
      window.history.replaceState({}, document.title);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  const goToBrowse = () => {
    navigate("/customer/browse");
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-14px) scale(1.04); }
        }
        .hero-fade {
          opacity: 0;
        }
        .hero-fade.is-in {
          animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .blob-float {
          animation: floatSlow 9s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-fade { opacity: 1 !important; animation: none !important; }
          .blob-float { animation: none !important; }
        }
      `}</style>

      {/* Hero */}
      <div className="relative overflow-hidden bg-[#FFD8BC]">
        <div className="blob-float absolute -top-32 -left-32 w-80 h-80 bg-orange-300/30 rounded-full blur-3xl" />
        <div
          className="blob-float absolute top-10 right-10 w-64 h-64 bg-yellow-200/30 rounded-full blur-3xl"
          style={{ animationDelay: "2.5s" }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:py-24 text-center sm:text-left">
          <p
            className={`hero-fade ${heroLoaded ? "is-in" : ""} text-sm font-medium text-orange-700`}
            style={{ animationDelay: "0.05s" }}
          >
            {savedUser?.username ? `Hey ${savedUser.username}, hungry?` : "Hungry?"}
          </p>

          <h1
            className={`hero-fade ${heroLoaded ? "is-in" : ""} text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-3 max-w-xl mx-auto sm:mx-0`}
            style={{ animationDelay: "0.15s" }}
          >
            Order food from the best restaurants near you
          </h1>

          <p
            className={`hero-fade ${heroLoaded ? "is-in" : ""} text-gray-700 mt-3 max-w-md mx-auto sm:mx-0`}
            style={{ animationDelay: "0.28s" }}
          >
            Browse menus, compare dishes and get your favorites delivered.
          </p>

          <div
            className={`hero-fade ${heroLoaded ? "is-in" : ""} mt-8`}
            style={{ animationDelay: "0.4s" }}
          >
            <button
              onClick={goToBrowse}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold px-6 h-12 shadow-sm hover:shadow-lg hover:from-orange-600 hover:to-orange-600 transition-all duration-200 hover:scale-[1.03] active:scale-95"
            >
              <UtensilsCrossed className="h-4 w-4" />
              Browse Food
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5 group-hover:rotate-[-90deg]" />
            </button>
          </div>
        </div>
      </div>

      {/* Food section */}
      <div className="mx-auto max-w-5xl px-4 py-5 scroll-mt-6">
        {!search.trim() && <CustomerBrowse />}
      </div>
    </div>
  );
};

export default CustomerHomepage;