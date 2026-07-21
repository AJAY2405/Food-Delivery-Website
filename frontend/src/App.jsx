import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";

import MainLayout from "./components/layouts/MainLayout";
import { SocketProvider } from "./context/socketContext";

import Home from "./components/Home";

import Signup from "./components/LOG-RES/Signup";
import Login from "./components/LOG-RES/Login";

// Common Pages
import About from "./components/pages/About";
import PolicyPage from "./components/pages/PolicyPage";
import { Profile } from "./components/pages/Profile";
import VerifyEmail from "./components/pages/VerifyEmail";
import Verify from "./components/pages/Verify";
import VerifyOTP from "./components/pages/VerifyOTP";
import ForgotPassword from "./components/pages/ForgotPassword";
import ChangePassword from "./components/pages/ChangePassword";

// Customer
import CustomerBrowse from "./components/Customer/CustomerBrowse";
import CustomerCart from "./components/Customer/CustomerCart";
import OrderHistory from "./components/Customer/OrderHistory";
import EditProfile from "./components/Customer/EditProfile";
import AddressBook from "./components/Customer/AddressBook";
import TrackRider from "./components/Customer/TrackRider";

// Restaurant
import RestaurantAccount from "./components/Restaurants/RestaurantAccount";
import RestaurantOrders from "./components/Restaurants/RestaurantOrders";
import RestaurantMenu from "./components/Restaurants/RestaurantMenu";
import AddFood from "./components/Restaurants/AddFood";
import EditFood from "./components/Restaurants/EditFood";
import DeleteFood from "./components/Restaurants/DeleteFood";

// Rider
import RiderDashboard from "./components/Rider/RiderDashboard";
import AvailableOrders from "./components/Rider/AvailableOrders";
import PickedOrders from "./components/Rider/PickedOrders";
import DeliveryHistory from "./components/Rider/DeliveryHistory";
import RiderProfile from "./components/Rider/RiderProfile";
import OrderDetails from "./components/Rider/OrderDetails";
import LiveTracking from "./components/Rider/LiveTracking";

import Contact from "./components/pages/Contact";
import Loader from "./components/pages/Loader";

import ProtectedRoute from "./components/ProtectedRoute";

import { useEffect, useState } from "react";
import RestaurantProfilePage from "./components/Restaurants/RestaurantProfilepage";

const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/contact", element: <Contact /> },
      { path: "/policy", element: <PolicyPage /> },
    ],
  },

  // Authentication
  { path: "/signup", element: <Signup /> },
  { path: "/login", element: <Login /> },
  { path: "/verify", element: <VerifyEmail /> },
  { path: "/verify/:token", element: <Verify /> },
  { path: "/verify-otp/:email", element: <VerifyOTP /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/change-password/:email", element: <ChangePassword /> },
  // CUSTOMER
 {
  element: <MainLayout />,
  children: [
    {
      element: <ProtectedRoute allowedRoles={["customer"]} />,
      children: [
        { path: "/profile", element: <Profile /> },
        { path: "/profile/edit", element: <EditProfile /> },
        { path: "/profile/addresses", element: <AddressBook /> },

        { path: "/customer/browse", element: <CustomerBrowse /> },
        { path: "/cart", element: <CustomerCart /> },
        { path: "/order_history", element: <OrderHistory /> },
        { path: "/order/:orderId/track", element: <TrackRider /> },
      ],
    },
  ],
},

  // RESTAURANT
 {
  element: <MainLayout />,
  children: [
    {
      element: <ProtectedRoute allowedRoles={["restaurant"]} />,
      children: [
        { path: "/restaurant/account", element: <RestaurantAccount /> },
        { path: "/restaurant/profile", element: <RestaurantProfilePage /> },
        { path: "/restaurant/menu", element: <RestaurantMenu /> },
        { path: "/restaurant/orders", element: <RestaurantOrders /> },

        { path: "/restaurant/add-food", element: <AddFood /> },
        { path: "/restaurant/edit-food", element: <EditFood /> },
        { path: "/restaurant/edit-food/:foodId", element: <EditFood /> },
        { path: "/restaurant/delete-food", element: <DeleteFood /> },
      ],
    },
  ],
},
  // RIDER
  {
    element: <ProtectedRoute allowedRoles={["rider"]} />,
    children: [
      {
        path: "/rider",
        element: <RiderDashboard />,
        children: [
          { index: true, element: <AvailableOrders /> },
          { path: "available-orders", element: <AvailableOrders /> },
          { path: "picked-orders", element: <PickedOrders /> },
          { path: "history", element: <DeliveryHistory /> },
          { path: "profile", element: <RiderProfile /> },
          { path: "order/:orderId", element: <OrderDetails /> },
          { path: "track/:orderId", element: <LiveTracking /> },
        ],
      },
    ],
  },
  // 404
  {
    path: "*",
    element: <h1>404 Page Not Found</h1>,
  },
]);

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  );
}

export default App;