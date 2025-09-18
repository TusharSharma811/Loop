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

import ChatAppSkeleton from './components/skeletons/ChatLoading';


function App() {
  const { fetchUser, user } = useUserStore();
  const { connect } = useSocketStore();
 
  const [isLoading, setIsLoading] = useState(true);
 
  // --- Initialize user, socket, and video client ---
  useEffect(() => {
    const init = async () => {
      try {
        if (!user) await fetchUser();
        await connect();
        
      } catch (error) {
        console.error('App initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [user, fetchUser, connect]);

  // --- Loading / Error states ---
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ChatAppSkeleton />
      </div>
    );
  }
 

  // --- Main App Content ---
  return (

      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicRouteWrapper><LandingPage /></PublicRouteWrapper>} />
          <Route path="auth/:mode" element={<PublicRouteWrapper><AuthPage /></PublicRouteWrapper>} />

          {/* Protected routes */}
          <Route path="chat/:chatId?" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="call/:callId" element={<ProtectedRoute><CallPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>

        {/* Global CallManager */}
        
      </BrowserRouter>
  
  );
}

export default App;
