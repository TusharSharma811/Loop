import { useEffect, useState, type JSX } from "react";
import { Navigate } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";
import useAuthStore from "../store/authStore";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, setIsAuthenticated } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated) {
          setLoading(false);
          return children;
        }
        const res = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.valid) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        setIsAuthenticated(false);
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, setIsAuthenticated, children]);

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/auth/signin" replace />;

  return children;
};

export default ProtectedRoute;
