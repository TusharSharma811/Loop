import React, { useState } from "react";
import { Search, Plus, Settings, MessageCircle } from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import useSearchUserStore from "../store/searchUserStore";
import useUserStore from "../store/userStore";
import type { Chat } from "../store/chatStore";

interface SidebarProps {
  conversations: Chat[];
  activeConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onConversationSelect,
  isOpen,
  onToggle,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { setModalOpen } = useSearchUserStore();
  const user  = useUserStore((state) => state.user);
  console.log("Conversations in Sidebar:", conversations);
  console.log("Active user ID:", user);
  
  
  const filteredConversations = conversations.filter((conv) => {
    const name =
      conv.groupName ||
      conv.participants.map((p) => p.name).join(", ") ||
      "Unknown Chat";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-20
          w-80 bg-white border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out 
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} h-full flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <MessageCircle className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              aria-label="User profile"
              className="w-8 h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-semibold cursor-pointer"
            >
              {user?.fullname?.charAt(0).toUpperCase() || "U"}
            </button>
            <button
              aria-label="New chat"
              onClick={() => setModalOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              aria-label="Settings"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="overflow-y-auto flex-1  ">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={activeConversationId === conversation.id}
                onClick={() => {
                  onConversationSelect(conversation.id);
                  if (window.innerWidth < 1024) onToggle(); // close sidebar on mobile
                }}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};
