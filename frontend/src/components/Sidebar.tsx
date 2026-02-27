import React, { useState, useMemo, useCallback } from "react";
import { Search, Plus, MessageCircle, Settings } from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import useSearchUserStore from "../store/searchUserStore";
import useUserStore from "../store/userStore";
import useChatStore, { type Chat } from "../store/chatStore";
import { useSocketStore } from "../store/socketStore";
import { useNavigate } from "react-router-dom";
import useMessageStore from "../store/messageStore";
import { ChatListSkeleton } from "./skeletons/ChatAreaSkeleton";

interface SidebarProps {
  activeConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeConversationId,
  onConversationSelect,
  isOpen,
  onToggle,
}) => {
  const { chats: conversations, loading } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const setModalOpen = useSearchUserStore((s) => s.setModalOpen);
  const user = useUserStore((s) => s.user);
  const sendMessage = useSocketStore((s) => s.sendMessage);
  const navigate = useNavigate();

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const name =
        (conv.isGroup && conv.groupName) ||
        conv.participants.map((p) => p.fullname).join(", ") ||
        "Unknown";
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [conversations, searchQuery]);

  const handleConversationClick = useCallback(
    (conversation: Chat) => {
      sendMessage("joinRoom", conversation.id as string);
      onConversationSelect(conversation.id);
      const msgStore = useMessageStore.getState();
      msgStore.setMessages([]);
      msgStore.fetchMessages(conversation.id as string);
      navigate(`/chat/${conversation.id}`);
    },
    [sendMessage, onConversationSelect, navigate]
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 lg:hidden"
          onClick={onToggle}
        />
      )}

      <div
        className={`fixed lg:relative inset-y-0 left-0 z-20
          w-80 bg-bg-secondary border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          h-full flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-text font-logo">Loop</h1>
          </div>
          <div className="flex items-center space-x-1">
            <button
              aria-label="User profile"
              onClick={() => navigate("/settings")}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer glass hover:bg-surface-hover transition-colors text-text"
            >
              {user?.fullname?.charAt(0).toUpperCase() || "U"}
            </button>
            <button
              aria-label="New chat"
              onClick={() => setModalOpen(true)}
              className="p-2 text-text-secondary hover:text-text hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-tertiary border border-border rounded-lg text-text text-sm placeholder-text-muted focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-4 flex-1 overflow-y-auto">
            <ChatListSkeleton />
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 no-scrollbar">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="h-10 w-10 text-text-muted mx-auto mb-3 opacity-50" />
                <p className="text-text-muted text-sm">
                  {searchQuery ? "No conversations found" : "No conversations yet"}
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={activeConversationId === conversation.id}
                  onClick={() => handleConversationClick(conversation)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};
