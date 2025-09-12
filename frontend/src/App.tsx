import { LandingPage } from './pages/Landing';
import { AuthPage } from './pages/Auth';
import useAuthStore from './store/authStore';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ChatPage } from './pages/ChatPage';
import { useEffect } from 'react';


function App() {

  const { isAuthenticated, fetchUser } = useAuthStore();
  useEffect(()=>{
    if(isAuthenticated){
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LandingPage  />,
    },
    {
      path: "/auth/:mode",
      element: <AuthPage  />,
    },
    {
      path: "/chat",
      element: <ChatPage />,
    },
  ]);



 
  return (
   <>
   <RouterProvider router={router} />
   </>
  );
}

export default App;