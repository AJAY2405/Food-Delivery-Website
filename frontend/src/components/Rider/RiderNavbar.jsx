import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Bike, LogOut, Menu, User as UserIcon } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getData } from "@/context/userContext";

const ToggleSwitch = ({ checked, disabled, onCheckedChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
      checked ? "bg-emerald-500" : "bg-gray-300"
    }`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
        checked ? "translate-x-4.5" : "translate-x-1"
      }`}
    />
  </button>
);

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
});

const RiderNavbar = ({ isAvailable, onToggleAvailable, onMenuClick }) => {
  const { user, setUser } = getData();
  const navigate = useNavigate();
  const [toggling, setToggling] = useState(false);

  const handleToggle = async (checked) => {
    setToggling(true);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/rider/availability`,
        { isAvailable: checked },
        authHeaders()
      );
      if (res.data.success) {
        onToggleAvailable(res.data.isAvailable);
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update status");
    } finally {
      setToggling(false);
    }
  };

  const logoutHandler = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/logout`,
        {},
        authHeaders()
      );
      if (res.data.success) {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-emerald-100 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/rider" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow">
              <Bike className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900 hidden sm:inline">
              Quick<span className="text-emerald-500">Bite</span> Rider
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200">
            <span className={`text-xs font-semibold ${isAvailable ? "text-emerald-600" : "text-gray-400"}`}>
              {isAvailable ? "Online" : "Offline"}
            </span>
            <ToggleSwitch checked={isAvailable} disabled={toggling} onCheckedChange={handleToggle} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 py-1.5 rounded-xl">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoUrl} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-600 font-bold text-sm">
                    {user?.username?.[0]?.toUpperCase() || "R"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-800 max-w-[100px] truncate hidden sm:inline">
                  {user?.username}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-white border border-gray-200">
              <DropdownMenuItem asChild>
                <Link to="/rider/profile" className="flex items-center cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logoutHandler} className="cursor-pointer text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default RiderNavbar;
