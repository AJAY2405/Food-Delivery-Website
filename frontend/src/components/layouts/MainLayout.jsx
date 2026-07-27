import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import ScrollToTop from "../pages/ScrollToTop";
import FloatingCartButton from "../pages/Floatingcartbutton";

const MainLayout = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div>
      <ScrollToTop />
      {user?.role !== "rider" && <Navbar />}
      <Outlet />
      <FloatingCartButton />
      <Footer />
    </div>
  );
};

export default MainLayout;