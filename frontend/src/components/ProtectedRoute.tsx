import { Navigate, Outlet } from "react-router-dom";
import authService from "../services/auth";

const ProtectedRoute = () => {
  return authService.isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
