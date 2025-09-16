import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StreamVideo } from '@stream-io/video-react-sdk';

import { LandingPage } from './pages/Landing';
import { AuthPage } from './pages/Auth';
import { ChatPage } from './pages/ChatPage';
import { CallPage } from './pages/CallPage';

import ProtectedRoute from './components/ProtectRoutes';
import PublicRouteWrapper from './components/PublicRouteWrapper';
import { CallManager } from './components/CallComponents/CallManager';

import useUserStore from './store/userStore';
import { useSocketStore } from './store/socketStore';
import { useCallStreamStore } from './store/callStreamStore';

// --- Global CallManager Wrapper ---
import { useNavigate } from 'react-router-dom';
const CallManagerWrapper = () => {
  const navigate = useNavigate();

  const handleNavigateToCall = (callId: string) => {
    navigate(`/call/${callId}`);
  };

  return <CallManager onNavigateToCall={handleNavigateToCall} />;
};

function App() {
  const { fetchUser, user } = useUserStore();
  const { connect } = useSocketStore();
  const { fetchClient, client } = useCallStreamStore();
  const [isLoading, setIsLoading] = useState(true);

  // --- Initialize user, socket, and video client ---
  useEffect(() => {
    const init = async () => {
      try {
        if (!user) await fetchUser();
        await connect();
        await fetchClient();
      } catch (error) {
        console.error('App initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [user, fetchUser, connect, fetchClient]);

  // --- Loading / Error states ---
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Failed to initialize video client. Please refresh the page.
      </div>
    );
  }

  // --- Main App Content ---
  return (
    <StreamVideo client={client}>
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
        <CallManagerWrapper />
      </BrowserRouter>
    </StreamVideo>
  );
}

export default App;
