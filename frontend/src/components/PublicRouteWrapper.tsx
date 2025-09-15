import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

interface Props {
  children: React.ReactNode;
}

const PublicRouteWrapper: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated === null) {
      checkAuth(); // run only if unknown
    }
  }, [isAuthenticated, checkAuth]);

  if (isAuthenticated === null) return children

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
};

export default PublicRouteWrapper;
