import { Sidebar } from "../components/Sidebar";
import { ChatHeader } from "../components/ChatHeader";
import { ChatArea } from "../components/ChatArea";
import { messages as initialMessages, currentUser } from "../utils/MockData";
import type { Message } from "../types";
import { useEffect, useState } from "react";
import useChatStore from "../store/chatStore";
import useAuthStore from "../store/authStore";
import useSearchUserStore from "../store/searchUserStore";
import { UserSearchModal } from "../components/UserSearchModal";

export const ChatPage: React.FC = () => {
  const { fetchChats, chats } = useChatStore();
  const { modalOpen } = useSearchUserStore();
  const { userLoading } = useAuthStore();
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >("1");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeConversation =
    chats.find((c) => c.id === activeConversationId) || null;
  const [users, setUsers] = useState<any>([]);
  const user = useAuthStore((state) => state.user);
  useEffect(() => {
   async function fetchData(){
     await fetchChats();
    setUsers(
      chats.flatMap((chat) =>
        chat.participants.filter((chatuser) => chatuser.id !== user.id)
      )
    );
    console.log("Fetched chats:", chats);
   }
   fetchData();
  }, [fetchChats]);
  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const handleSendMessage = (content: string) => {
    if (!activeConversationId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content,
      timestamp: new Date(),
      type: "text",
      status: "sent",
    };
    setMessages((prev) => [...prev, newMessage]);

    // Simulate message status updates
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
      {userLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="loader">Loading...</div>
        </div>
      ) : (
        <div className="flex overflow-hidden relative h-screen bg-gray-100 ">
          <Sidebar
            conversations={users}
            activeConversationId={activeConversationId}
            onConversationSelect={handleConversationSelect}
            isOpen={sidebarOpen}
            onToggle={toggleSidebar}
          />
          {modalOpen && (
            <UserSearchModal
              isOpen={modalOpen}
              onClose={() => {}}
              onSelectUser={() => {}}
              users={users}
            />
          )}
          <div className="flex-1 flex flex-col min-w-0">
            <ChatHeader
              conversation={activeConversation}
              onSidebarToggle={toggleSidebar}
            />

            <ChatArea
              conversation={activeConversation}
              messages={messages.filter((m) => {
                return activeConversationId === "1";
              })}
              users={users}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      )}
    </>
  );
};
