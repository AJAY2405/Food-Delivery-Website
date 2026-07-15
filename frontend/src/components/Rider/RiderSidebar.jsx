import React from "react";
import { NavLink } from "react-router-dom";
import { Package, Bike, History, User, X } from "lucide-react";

const links = [
  { to: "/rider/available-orders", label: "Available Orders", icon: Package },
  { to: "/rider/picked-orders", label: "My Deliveries", icon: Bike },
  { to: "/rider/history", label: "Delivery History", icon: History },
  { to: "/rider/profile", label: "Profile", icon: User },
];

const RiderSidebar = ({ open, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 lg:top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-100 shrink-0 transform transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 lg:hidden">
          <span className="text-sm font-semibold text-gray-500">Menu</span>
          <button onClick={onClose}>
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default RiderSidebar;
