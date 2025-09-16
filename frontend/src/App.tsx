
import { LandingPage } from "./pages/Landing";
import { AuthPage } from "./pages/Auth";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { ChatPage } from "./pages/ChatPage";
import {useState, useEffect} from "react";
import ProtectedRoute from "./components/ProtectRoutes";
import PublicRouteWrapper from "./components/PublicRouteWrapper";
import useUserStore from "./store/userStore";
import { useSocketStore } from "./store/socketStore";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { useCallStreamStore } from "./store/callStreamStore";
import { CallManager } from "./components/CallComponents/CallManager";
import { CallPage } from "./pages/CallPage";

// Layout component that includes CallManager
const AppLayout: React.FC = () => {
  const { client } = useCallStreamStore();
  
  return (
    <>
      <Outlet />
      {client && <CallManager />}
    </>
  );
};
function App() {
  const { fetchUser, user } = useUserStore();
  const { connect } = useSocketStore();
  const { fetchClient } = useCallStreamStore();
 const [client , setClient] = useState<StreamVideoClient | null>(null);
  useEffect(() => {
    const init = async () => {
      if(!user)await fetchUser();
      connect();
      await fetchClient();
      setClient(useCallStreamStore.getState().client);
    }
    init();
  }, [user, fetchUser, connect , fetchClient]);
  
 

  const router = createBrowserRouter([
    {
      path: "/",
      element: <AppLayout />,
      children: [
        {
          index: true,
          element: (
            <PublicRouteWrapper>
              <LandingPage />
            </PublicRouteWrapper>
          ),
        },
        {
          path: "auth/:mode",
          element: (
            <PublicRouteWrapper>
              <AuthPage />
            </PublicRouteWrapper>
          ),
        },
        {
          path: "chat",
          element: (
            <ProtectedRoute>
              <StreamVideo client={client!}>
                <ChatPage />
              </StreamVideo>
            </ProtectedRoute>
          ),
          children: [
            {
              path: ":chatId",
              element: <ChatPage />,
            },
          ],
        },
        {
          path: "call/:callId",
          element: (
            <ProtectedRoute>
              <StreamVideo client={client!}>
                <CallPage />
              </StreamVideo>
            </ProtectedRoute>
          )
        },
        {
          path: "*",
          element: <div>404 Not Found</div>,
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;
