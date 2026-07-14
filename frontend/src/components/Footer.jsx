import React from "react";
import { Link } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-orange-500" />
          <span className="font-bold text-gray-800">
            Quick<span className="text-orange-600">Bite</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-5 text-sm text-gray-600">
          <Link to="/about" className="hover:text-orange-400">
            About
          </Link>
          <Link to="/contact" className="hover:text-orange-500">
            Contact
          </Link>
          <Link to="/policy" className="hover:text-orange-500">
            Privacy
          </Link>
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