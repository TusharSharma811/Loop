import { Sidebar } from "../components/Sidebar";
import { ChatHeader } from "../components/ChatHeader";
import { ChatArea } from "../components/ChatArea";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import useChatStore from "../store/chatStore";
import useSearchUserStore from "../store/searchUserStore";
import { UserSearchModal } from "../components/UserSearchModal";
import useUserStore from "../store/userStore";
import { useSocketStore } from "../store/socketStore";
import ChatAppSkeleton from "../components/skeletons/ChatLoading";
import { motion } from "motion/react";
import { StreamVideo } from "@stream-io/video-react-sdk";
import { CallManager } from "../components/CallComponents/CallManager";
import { useCallStreamStore } from "../store/callStreamStore";

const CallManagerWrapper = () => {
  const navigate = useNavigate();

  const handleNavigateToCall = (callId: string) => {
    navigate(`/call/${callId}`);
  };

  return <CallManager onNavigateToCall={handleNavigateToCall} />;
};

export const ChatPage: React.FC = () => {
  const { fetchChats, chats, loading: chatLoading } = useChatStore();
  const { modalOpen } = useSearchUserStore();
  const { loading, user } = useUserStore();
   const { fetchClient, client } = useCallStreamStore();
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { chat } = useParams<{ chat: string }>();

  useEffect(() => {
    async function initialize() {
      if (!user) return;
      await fetchChats();
      await fetchClient();
    }
    initialize();
  }, [fetchChats , user, fetchClient]);

  useEffect(() => {
    if (chat) {
      setActiveConversationId(chat);
    } else if (!activeConversationId && location.pathname !== "/chat") {
      navigate("/chat");
    }
  }, [chat, activeConversationId, location.pathname, navigate]);

  useEffect(() => {
    if (activeConversationId) {
      useSocketStore.getState().sendMessage("joinRoom", activeConversationId);
    }
  }, [activeConversationId]);

  const activeConversation =
    chats?.find((c) => c.id === activeConversationId) || null;

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
    navigate(`/chat/${conversationId}`);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <>
      {!client || loading || chatLoading ? (
        <ChatAppSkeleton />
      ) : (
            <StreamVideo client={client}>
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          className="flex overflow-hidden relative h-screen bg-gray-100"
        >
          {/* Sidebar */}
          <div className="flex h-screen">
            <Sidebar
              conversations={chats || []}
              activeConversationId={activeConversationId}
              onConversationSelect={handleConversationSelect}
              isOpen={sidebarOpen}
              onToggle={toggleSidebar}
            />
          </div>

          {/* Search Modal */}
          {modalOpen && (
            <UserSearchModal
              isOpen={modalOpen}
              onClose={() => {}}
              onSelectUser={() => {}}
            />
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <ChatHeader
              conversation={activeConversation}
              onSidebarToggle={toggleSidebar}
            />

            <ChatArea
              conversation={activeConversation}
              users={
                activeConversation?.participants.filter(
                  (chatUser) => chatUser.id !== user?.id
                ) || []
              }
            />
          </div>
        </motion.div>
        <CallManagerWrapper />
        </StreamVideo>
      )}
    </>
  );
};
