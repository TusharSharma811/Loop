import React from "react";
import type { Chat } from "../store/chatStore";
import useUserStore from "../store/userStore";
import defaultImage from '../assets/default-avatar.png';
import useChatStore from "../store/chatStore";

interface ConversationItemProps {
  conversation: Chat;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
}) => {
  const { user: currentUser } = useUserStore();
  const { onlineUsers } = useChatStore();

  const getConversationName = () => {
    if (conversation.isGroup && conversation.groupName) return conversation.groupName;
    return conversation.participants.find((p) => p.id !== currentUser?.id)?.fullname || "Unknown";
  };

  const getConversationAvatar = () => {
    if (conversation.isGroup && conversation.groupName) return conversation.name || defaultImage;
    const otherParticipant = conversation.participants.find((p) => p.id !== currentUser?.id);
    return otherParticipant?.avatarUrl && otherParticipant.avatarUrl !== "" ? otherParticipant.avatarUrl : defaultImage;
  };

  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) return "No messages yet";
    const isOwnMessage = conversation.lastMessage.senderId === currentUser?.id;
    const preview =
      conversation.lastMessage.messageType !== "text"
        ? "📷 Image"
        : conversation.lastMessage.content.length > 30
          ? conversation.lastMessage.content.substring(0, 30) + "..."
          : conversation.lastMessage.content;
    return isOwnMessage ? `You: ${preview}` : preview;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const isOnline = (() => {
    if (conversation.isGroup || !currentUser) return false;
    const other = conversation.participants.find((p) => p.id !== currentUser.id);
    return other ? onlineUsers.includes(other.id) : false;
  })();

  return (
    <div
      className={`flex items-center p-3 mx-2 my-0.5 cursor-pointer rounded-xl transition-all duration-200 ${isActive
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-surface-hover border border-transparent"
        }`}
      onClick={onClick}
    >
      <div className="relative flex-shrink-0">
        <img
          src={getConversationAvatar()}
          alt={getConversationName()}
          className="w-11 h-11 rounded-full object-cover"
        />
        {!conversation.isGroup && (
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-bg-secondary ${isOnline ? "bg-success" : "bg-text-muted/30"
              }`}
          />
        )}
      </div>

      <div className="flex-1 ml-3 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-medium truncate ${isActive ? "text-primary-light" : "text-text"}`}>
            {getConversationName()}
          </h3>
          {conversation.lastMessage && (
            <span className="text-[11px] text-text-muted ml-2 flex-shrink-0">
              {formatTime(new Date(conversation.lastMessage.timeStamp))}
            </span>
          )}
        </div>
        <p className="text-xs text-text-muted truncate mt-0.5">
          {getLastMessagePreview()}
        </p>
      </div>
    </div>
  );
};
