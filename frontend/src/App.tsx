import { LandingPage } from './pages/Landing';
import { AuthPage } from './pages/Auth';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ChatPage } from './pages/ChatPage';
import { useEffect } from 'react';
import ProtectedRoute from './components/ProtectRoutes';
import PublicRouteWrapper from './components/PublicRouteWrapper';
import useUserStore from './store/userStore';
import { useSocketStore } from './store/socketStore';


function App() {

  const { fetchUser } = useUserStore();
  const { connect } = useSocketStore();
  useEffect(() => {
    fetchUser();
    connect();
  }, [fetchUser , connect]);

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
      children: [
        {
          path: ":chatId",
          element: <ChatPage />,
        },
      ],
    },
  ]);



 
  return (
   <>
   <RouterProvider router={router} />
   </>
  );
}

export default App;