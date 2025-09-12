import { Sidebar } from "../components/Sidebar";
import { ChatHeader } from "../components/ChatHeader";
import { ChatArea } from "../components/ChatArea";
import {
  conversations,
  messages as initialMessages,
  users,
  currentUser,
} from "../utils/MockData";
import type { Message } from "../types";
import { useState } from "react";

export const ChatPage: React.FC = () => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>("1");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;
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
      <div className="flex overflow-hidden relative h-screen bg-gray-100 ">
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onConversationSelect={handleConversationSelect}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <ChatHeader
            conversation={activeConversation}
            onSidebarToggle={toggleSidebar}
          />

          <ChatArea
            conversation={activeConversation}
            messages={messages.filter((m : any) => {
              // For demo purposes, show all messages for the first conversation
              // In a real app, you'd filter by conversation
              return activeConversationId === "1";
            })}
            users={users}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </>
  );
};
