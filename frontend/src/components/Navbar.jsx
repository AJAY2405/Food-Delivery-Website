import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import {
  Home,
  Menu,
  UtensilsCrossed,
  ClipboardList,
  LayoutDashboard,
  Settings,
  User,
  LogOut,
  ChefHat,
  PackageCheck,
  Bike,
} from "lucide-react";
import avatar6 from "../assets/avatar6.jpg";
import { getData } from "@/context/userContext";
import { FaCartArrowDown } from "react-icons/fa";

const Navbar = () => {
  const { user, setUser } = getData();
  const [search, setSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  //  ── Search handler 
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // Search submit — navigate to browse with the query 
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = search.trim();
    if (!trimmed) return;
    navigate("/customer/browse", { state: { search: trimmed } });
  };

  // 
  const logoutHandler = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/logout`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (res.data.success) {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        toast.success("Logged out successfully");
        navigate("/");
      }
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  //  Role-based dropdown items 
  const getDropdownItems = () => {
    if (!user) return [];

    switch (user.role) {
      case "customer":
        return [
          {
            to: "/",
            label: "Home",
            icon: <Home className="mr-2 h-4 w-4" />,
          },
          {
            to: "/profile",
            label: "My Profile",
            icon: <User className="mr-2 h-4 w-4" />,
          },
          {
            to: "/order_history",
            label: "Order History",
            icon: <ClipboardList className="mr-2 h-4 w-4" />,
          },
          {
            to: "/cart",
            label: "Cart",
            icon: <FaCartArrowDown className="mr-2 h-4 w-4" />,
          },
        ];

      case "restaurant":
        return [
          {
            to: "/",
            label: "Home",
            icon: <Home className="mr-2 h-4 w-4" />,
          },
          {
            to: "/restaurant/account",
            label: "Restaurant Profile",
            icon: <ChefHat className="mr-2 h-4 w-4" />,
          },
          {
            to: "/restaurant/menu",
            label: "Manage Menu",
            icon: <UtensilsCrossed className="mr-2 h-4 w-4" />,
          },
          {
            to: "/restaurant/add-food",
            label: "Add Food",
            icon: <UtensilsCrossed className="mr-2 h-4 w-4" />,
          },
          {
            to: "/restaurant/profile",
            label: "Account Setting",
            icon: <Settings className="mr-2 h-4 w-4" />,
          },
        ];

      case "rider":
        return [
          {
            to: "/",
            label: "Home",
            icon: <Home className="mr-2 h-4 w-4" />,
          },
          {
            to: "/rider",
            label: "Rider Dashboard",
            icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
          },
          {
            to: "/rider/available-orders",
            label: "Available Orders",
            icon: <PackageCheck className="mr-2 h-4 w-4" />,
          },
          {
            to: "/rider/picked-orders",
            label: "My Deliveries",
            icon: <Bike className="mr-2 h-4 w-4" />,
          },
          {
            to: "/rider/profile",
            label: "Profile",
            icon: <User className="mr-2 h-4 w-4" />,
          },
        ];

      default:
        return [];
    }
  };

  const dropdownItems = getDropdownItems();

  //  Role badge color 
  const roleBadgeColor = {
    restaurant:
      "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400",
    rider:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400",
    customer:
      "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400",
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-orange-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── Brand / Logo ── */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Quick<span className="text-orange-500">Bite</span>
            </span>
          </Link>

          {/* ── One dropdown, two triggers (avatar on desktop, hamburger on mobile) ── */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  {/* Mobile trigger content: hamburger only */}
                  <Menu className="h-5 w-5 md:hidden" />

                  {/* Desktop trigger content: avatar + name + role badge */}
                  <span className="hidden md:flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoUrl || avatar6} />
                      <AvatarFallback className="bg-orange-100 text-orange-600 font-bold text-sm">
                        {user.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 max-w-[100px] truncate">
                      {user.username}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                        roleBadgeColor[user.role] || roleBadgeColor.customer
                      }`}
                    >
                      {user.role}
                    </span>
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-orange-900"
              >
                {/* Mobile-only identity header inside the dropdown */}
                <div className="flex md:hidden items-center gap-3 px-2 py-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.photoUrl || avatar6} />
                    <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                      {user.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <span
                    className={`ml-auto text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                      roleBadgeColor[user.role] || roleBadgeColor.customer
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <DropdownMenuSeparator className="md:hidden" />

                <DropdownMenuLabel className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide hidden md:block">
                  My Account
                </DropdownMenuLabel>

                {dropdownItems.map((item) => (
                  <DropdownMenuItem key={item.to} asChild>
                    <Link to={item.to} className="flex items-center cursor-pointer">
                      {item.icon}
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={logoutHandler} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>

              {/* Desktop: plain buttons, no dropdown needed when logged out */}
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="border-orange-400 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    Log In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>

              <DropdownMenuContent
                align="end"
                className="w-56 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-orange-900 md:hidden"
              >
                <DropdownMenuItem asChild>
                  <Link to="/login" className="cursor-pointer">
                    Log In
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/signup" className="cursor-pointer">
                    Sign Up
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;