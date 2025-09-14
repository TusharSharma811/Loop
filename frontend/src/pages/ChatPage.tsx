import { Sidebar } from "../components/Sidebar";
import { ChatHeader } from "../components/ChatHeader";
import { ChatArea } from "../components/ChatArea";
import { messages as initialMessages, currentUser } from "../utils/MockData";

import { useEffect, useState } from "react";
import useChatStore from "../store/chatStore";
import useSearchUserStore from "../store/searchUserStore";
import { UserSearchModal } from "../components/UserSearchModal";
import useUserStore from "../store/userStore";
import type { Message } from "../types"; // <-- recommend creating this

export const ChatPage: React.FC = () => {
  const { fetchChats, chats } = useChatStore();
  const { modalOpen } = useSearchUserStore();
  const { loading, user } = useUserStore();
   useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeConversation = chats.find((c) => c.id === activeConversationId) || null;

  // Fetch chats only once
 

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleSendMessage = (content: string) => {
    if (!activeConversationId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      conversationId: activeConversationId,
      content,
      timestamp: new Date(),
      type: "text",
      status: "sent",
    };

    setMessages((prev) => [...prev, newMessage]);

    // Simulate delivery/read updates
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "read" } : msg
        )
      );
    }, 2000);
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="loader">Loading...</div>
        </div>
      ) : (
        <div className="flex overflow-hidden relative h-screen bg-gray-100">
          <div className="flex h-screen">
          <Sidebar
            conversations={chats}
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
              messages={messages.filter((m) => m.conversationId === activeConversationId)}
              users={activeConversation?.participants.filter(
                (chatUser) => chatUser.id !== user?.id
              ) || []}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      )}
    </>
  );
};
