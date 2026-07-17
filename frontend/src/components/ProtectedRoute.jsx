import { Navigate, Outlet } from "react-router-dom";
import { getData } from "@/context/userContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = getData();

  // Wait until user data is loaded
  if (loading) {
    return <div>Loading...</div>;
  }

  // User not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role not allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;