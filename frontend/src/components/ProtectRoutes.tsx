import { useEffect, type JSX } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import ChatAppSkeleton from "./skeletons/ChatLoading";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated === null) {
      checkAuth(); 
    }
  }, [isAuthenticated, checkAuth]);

  if (isAuthenticated === null) return <div><ChatAppSkeleton /></div>;

  if (!isAuthenticated) return <Navigate to="/auth/signin" replace />;

  return children;
};

export default ProtectedRoute;
