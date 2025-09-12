import React from 'react';
import type { Conversation } from '../types';
import { currentUser } from '../utils/MockData';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick
}) => {
  const getConversationName = () => {
    if (conversation.isGroup && conversation.groupName) {
      return conversation.groupName;
    }
    return conversation.participants[0]?.name || 'Unknown';
  };

  const getConversationAvatar = () => {
    if (conversation.isGroup && conversation.groupAvatar) {
      return conversation.groupAvatar;
    }
    return conversation.participants[0]?.avatar || '';
  };

  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const isOwnMessage = conversation.lastMessage.senderId === currentUser.id;
    const preview = conversation.lastMessage.content.length > 30 
      ? conversation.lastMessage.content.substring(0, 30) + '...'
      : conversation.lastMessage.content;
    
    return isOwnMessage ? `You: ${preview}` : preview;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getStatusColor = () => {
    if (conversation.isGroup) return 'bg-gray-400';
    const status = conversation.participants[0]?.status;
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div
      className={`flex items-center p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
        isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={getConversationAvatar()}
          alt={getConversationName()}
          className="w-12 h-12 rounded-full object-cover"
        />
        {!conversation.isGroup && (
          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor()}`} />
        )}
      </div>
      
      <div className="flex-1 ml-3 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-medium truncate ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
            {getConversationName()}
          </h3>
          {conversation.lastMessage && (
            <span className="text-xs text-gray-500 ml-2">
              {formatTime(conversation.lastMessage.timestamp)}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-600 truncate">
            {getLastMessagePreview()}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};