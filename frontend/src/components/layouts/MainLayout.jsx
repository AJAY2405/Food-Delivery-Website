// import React from 'react'
// import { Outlet } from "react-router-dom";
// import Navbar from '../Navbar'
// import Footer from '../Footer';

// const MainLayout = () => {
//   return (
//     <div>
//         <Navbar/>
//         <Outlet/>
//         <Footer/>
//     </div>
//   )
// }

// export default MainLayout


import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";

const MainLayout = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div>
      {user?.role !== "rider" && <Navbar />}
      <Outlet />
      <Footer />
    </div>
  );
};

export default MainLayout;