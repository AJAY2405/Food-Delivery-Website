import React from "react";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";

const handleNavigate = (path) => {
  navigate(path);
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">

        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <UtensilsCrossed className="w-5 h-5 text-orange-500" />
          <span className="font-bold text-gray-800">
            Quick<span className="text-orange-600">Bite</span>
          </span>
        </button>

        {/* Links */}
        <div className="flex items-center gap-5 text-sm text-gray-600">
          <button
            onClick={() => navigate("/about")}
            className="hover:text-orange-500"
          >
            About
          </button>

          <button
            onClick={() => navigate("/contact")}
            className="hover:text-orange-500"
          >
            Contact
          </button>

          <button
            onClick={() => navigate("/policy")}
            className="hover:text-orange-500"
          >
            Privacy
          </button>
        </div>

        {/* Copyright */}
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} QuickBite. All Rights Reserved.
        </p>

      </div>
    </footer>
  );
};

export default Footer;