import { Sidebar } from "../components/Sidebar";
import { ChatHeader } from "../components/ChatHeader";
import { ChatArea } from "../components/ChatArea";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useChatStore from "../store/chatStore";
import useSearchUserStore from "../store/searchUserStore";
import { UserSearchModal } from "../components/UserSearchModal";
import useUserStore from "../store/userStore";
import { useSocketStore } from "../store/socketStore";
import ChatAppSkeleton from "../components/skeletons/ChatLoading";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { motion } from "motion/react";
export const ChatPage: React.FC = () => {
  const { fetchChats, chats } = useChatStore();
  const { modalOpen } = useSearchUserStore();
  const { loading, user } = useUserStore();
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const activeConversation =
    chats && chats.length > 0
      ? chats.find((c) => c.id === activeConversationId) || null
      : null;
  useEffect(() => {
    if (!activeConversationId && location.pathname !== "/chat") {
      navigate("/chat");
    }
  }, [activeConversationId, navigate, location.pathname]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats , chats]);
  useEffect(() => {
    useSocketStore.getState().sendMessage("joinRoom", activeConversationId);
  }, [activeConversationId]);
  const { chat } = useParams<{ chat: string }>();
  useEffect(() => {
    if (chat) {
      console.log("Setting active conversation ID from URL:", chat);
      setActiveConversationId(chat);
    }
  }, [chat]);

  useEffect(() => {
    if (chats && chats.length === 0) {
      fetchChats();
    }
  }, [chats, fetchChats]);

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <>
      {loading ? (
        <ChatAppSkeleton />
      ) : (
        <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="flex overflow-hidden relative h-screen bg-gray-100">
          <div className="flex h-screen">
            <Sidebar
              conversations={chats || []}
              activeConversationId={activeConversationId}
              onConversationSelect={handleConversationSelect}
              isOpen={sidebarOpen}
              onToggle={toggleSidebar}
            />
          </div>
          {modalOpen && (
            <UserSearchModal
              isOpen={modalOpen}
              onClose={() => {}}
              onSelectUser={() => {}}
            />
          )}

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
      )}
    </>
  );
};
