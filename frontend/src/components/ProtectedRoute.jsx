// import { Navigate, Outlet } from "react-router-dom";
// import { getData } from "@/context/userContext";

// const ProtectedRoute = ({ allowedRoles }) => {
//   const { user, loading } = getData();

//   // Wait until user data is loaded
//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   // User not logged in
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   // Role not allowed
//   if (!allowedRoles.includes(user.role)) {
//     return <Navigate to="/" replace />;
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;

import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const ProtectedRoute = ({ allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          setLoading(false);
          return;
        }

        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(data.user);
      } catch (error) {
        console.error(error);
        localStorage.removeItem("accessToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;