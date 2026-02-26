import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


import { LandingPage } from './pages/Landing';
import { AuthPage } from './pages/Auth';
import { ChatPage } from './pages/ChatPage';
import { CallPage } from './pages/CallPage';

import ProtectedRoute from './components/ProtectRoutes';
import PublicRouteWrapper from './components/PublicRouteWrapper';
import useUserStore from './store/userStore';
import { useSocketStore } from './store/socketStore';

import Settings from './pages/Settings';
import ChatAppSkeleton from './components/skeletons/ChatLoading';


function App() {
  const { fetchUser } = useUserStore();
  const { connect } = useSocketStore();

  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const init = async () => {
      try {
        await fetchUser();
        await connect();
      } catch (error) {
        console.error('App initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <ChatAppSkeleton />
    );
  }



  return (

    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicRouteWrapper><LandingPage /></PublicRouteWrapper>} />
        <Route path="auth/:mode" element={<PublicRouteWrapper><AuthPage /></PublicRouteWrapper>} />

        {/* Protected routes */}
        <Route path="chat/:chatId?" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="call/:callId" element={<ProtectedRoute><CallPage /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>

      {/* Global CallManager */}

    </BrowserRouter>

  );
}

export default App;
