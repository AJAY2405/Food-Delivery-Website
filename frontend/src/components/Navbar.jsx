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
  Info,
  Menu,
  X,
  UtensilsCrossed,
  ClipboardList,
  Heart,
  Search,
  LayoutDashboard,
  BookOpen,
  Settings,
  User,
  LogOut,
  ChefHat,
  PackageCheck,
} from "lucide-react";
import avatar6 from "../assets/avatar6.jpg";
import { getData } from "@/context/userContext";

const Navbar = () => {
  const { user, setUser } = getData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  /* ── Close mobile menu on route change ── */
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  /* ── Close mobile menu on Escape ── */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  /* ── Search handler ── */
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  /* ── Search submit — navigate to browse with the query ── */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = search.trim();
    if (!trimmed) return;
    navigate("/customer/browse", { state: { search: trimmed } });
    setIsMenuOpen(false);
  };

  /* ── Logout ── */
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

  /* ── Role-based nav links ── */
  const getNavLinks = () => {
    const commonLinks = [
      // { to: "/", label: "Home", icon: <Home className="h-4 w-4" /> },
      // { to: "/about", label: "About", icon: <Info className="h-4 w-4" /> },
    ];

    if (!user) return commonLinks;

    switch (user.role) {
      case "customer":
        return [
         
        ];

      case "restaurant":
        return [
          
        ];

      default:
        return commonLinks;
    }
  };

  /* ── Role-based dropdown items ── */
  const getDropdownItems = () => {
    if (!user) return [];

    switch (user.role) {
      case "customer":
        return [
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
            icon: <ClipboardList className="mr-2 h-4 w-4" />,
          }
        ];

      case "restaurant":
        return [
          {
            to: "/profile",
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

      default:
        return [];
    }
  };

  /* ── Active link style ── */
  const navLinkStyle = (path) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      location.pathname === path
        ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400"
        : "text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
    }`;

  const navLinks = getNavLinks();
  const dropdownItems = getDropdownItems();

  return (
    <>
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

            {/* ── Desktop Right Actions ── */}
            <div className="hidden md:flex items-center gap-3 shrink-0">

              {/* Role badge */}
              {user && (
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                    user.role === "restaurant"
                      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                      : "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400"
                  }`}
                >
                  {user.role}
                </span>
              )}

              {/* Avatar dropdown or Login/Signup buttons */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoUrl || avatar6} />
                        <AvatarFallback className="bg-orange-100 text-orange-600 font-bold text-sm">
                          {user.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 max-w-[100px] truncate">
                        {user.username}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-orange-900"
                  >
                    <DropdownMenuLabel className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
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
                <div className="flex items-center gap-2">
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
              )}
            </div>

            {/* ── Mobile: Hamburger ── */}
            <div className="flex md:hidden items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-orange-900 bg-white/95 dark:bg-black/95 backdrop-blur-xl px-4 py-4 space-y-3">

            {/* Nav links */}
            {/* <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={navLinkStyle(link.to)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div> */}

            <div className="pt-3 border-t border-gray-100 dark:border-orange-900/40">
              {user ? (
                <>
                  {/* User info */}
                  <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.photoUrl || avatar6} />
                      <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                        {user.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Dropdown items */}
                  {dropdownItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600"
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}

                  <button
                    onClick={logoutHandler}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mt-1"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-1">
                  <Link to="/login">
                    <Button
                      variant="outline"
                      className="w-full border-orange-400 text-orange-500 hover:bg-orange-50"
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile backdrop overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;