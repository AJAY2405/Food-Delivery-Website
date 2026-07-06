import { Children, Profiler, useState } from 'react'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import './App.css'
import MainLayout from './components/layouts/MainLayout'
import {Profile} from './components/pages/Profile'
import {About} from './components/pages/About'
import Signup from './components/LOG-RES/Signup';
// import { Login } from './components/LOG-RES/Login';
import VerifyEmail from './components/pages/VerifyEmail';
import Verify from './components/pages/Verify';
import VerifyOTP from './components/pages/VerifyOTP';
import Login from './components/LOG-RES/Login';
import Home from './components/Home';
import ForgotPassword from './components/pages/ForgotPassword';
import ChangePassword from './components/pages/ChangePassword';
import AddFood from './components/Restaurants/AddFood';
import EditFood from './components/Restaurants/EditFood';
import DeleteFood from './components/Restaurants/DeleteFood';
import RestaurantProfilePage from './components/Restaurants/RestaurantProfilepage';
import RestaurantMenu from './components/Restaurants/RestaurantMenu';
import CustomerBrowse from './components/Customer/CustomerBrowse';
import CustomerCart from './components/Customer/CustomerCart';
import { Favourites } from './components/Customer/Favourites';
import OrderHistory from './components/Customer/OrderHistory';
import RestaurantAccount from './components/Restaurants/RestaurantAccount';
import RestaurantOrders from './components/Restaurants/RestaurantOrders';
import EditProfile from './components/Customer/EditProfile';
import AddressBook from './components/Customer/AddressBook';
// import RestaurantAccount from './components/Restaurants/RestaurantAccount';



const router = createBrowserRouter([
  {
    path:"/",
    element:<MainLayout/>,
    children:[
      {path:"/",element:<Home/>}
    ]
  },

  { path: "/signup", element: <Signup /> },
  { path: "/login", element: <Login /> },
  {path:"/verify",element:<VerifyEmail/>},
  {path:"/verify/:token",element:<Verify/>},
  {path:"/verify-otp/:email",element:<VerifyOTP/>},
  { path: "/profile", element: <Profile /> },
  { path: "/about", element: <About /> },
  { path: "/cart", element: <CustomerCart /> },
  { path: "/favourites", element: <Favourites /> },
  { path: "/cart", element: <CustomerCart /> },
  { path: "/restaurant/orders", element: <RestaurantOrders /> },
  { path: "/order_history", element: <OrderHistory /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/change-password/:email", element: <ChangePassword /> },
  { path: "restaurant/profile", element: <RestaurantAccount /> },
  { path: "restaurant/add-food", element: <AddFood /> },
  { path: "restaurant/edit-food", element: <EditFood /> },
  { path: "restaurant/delete-food", element: <DeleteFood /> },
  { path: "restaurant/menu", element: <RestaurantMenu /> },
  { path: "restaurant/addfood", element: <AddFood /> },
  { path: "restaurant/deletefood", element: <DeleteFood/> },
  { path: "/restaurant/edit-food/:foodId", element: <EditFood/> },
  { path: "customer/browse", element: <CustomerBrowse/> },
  {
    path: "/restaurant/account",
    element: <RestaurantAccount />,
},

{ path: "/profile/edit", element: <EditProfile /> },
{ path: "/profile/addresses", element: <AddressBook/> },

])

function App() {

  return <RouterProvider router={router} />;
}

export default App
