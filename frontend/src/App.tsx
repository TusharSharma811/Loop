import { LandingPage } from './pages/Landing';
import { AuthPage } from './pages/Auth';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ChatPage } from './pages/ChatPage';
import { useEffect } from 'react';
import ProtectedRoute from './components/ProtectRoutes';
import PublicRouteWrapper from './components/PublicRouteWrapper';
import useUserStore from './store/userStore';


function App() {

  const { fetchUser } = useUserStore();
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const router = createBrowserRouter([
    {
      path: "/",
      element:<PublicRouteWrapper><LandingPage  /></PublicRouteWrapper>,
    },
    {
      path: "/auth/:mode",
      element: <PublicRouteWrapper><AuthPage  /></PublicRouteWrapper>,
    },
    {
      path: "/chat",
      element: <ProtectedRoute><ChatPage /></ProtectedRoute>,
    },
  ]);



 
  return (
   <>
   <RouterProvider router={router} />
   </>
  );
}

export default App;