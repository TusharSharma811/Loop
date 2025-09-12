import React from 'react';
import { Phone, Video, MoreVertical, Menu } from 'lucide-react';
import type { Conversation } from '../types';

interface ChatHeaderProps {
  conversation: Conversation | null;
  onSidebarToggle: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation, onSidebarToggle }) => {
  if (!conversation) {
    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <button
          onClick={onSidebarToggle}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-center text-gray-500">Select a conversation to start chatting</div>
        <div className="w-10" />
      </div>
    );
  }

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

  const getStatusText = () => {
    if (conversation.isGroup) {
      return `${conversation.participants.length} members`;
    }
    
    const user = conversation.participants[0];
    if (user?.status === 'online') {
      return 'Online';
    } else if (user?.lastSeen) {
      const now = new Date();
      const diff = now.getTime() - user.lastSeen.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (minutes < 60) {
        return `Last seen ${minutes}m ago`;
      } else if (hours < 24) {
        return `Last seen ${hours}h ago`;
      } else {
        return `Last seen ${days}d ago`;
      }
    }
    return 'Offline';
  };

  const getStatusColor = () => {
    if (conversation.isGroup) return 'text-gray-500';
    const status = conversation.participants[0]?.status;
    switch (status) {
      case 'online': return 'text-green-600';
      case 'away': return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center">
        <button
          onClick={onSidebarToggle}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors lg:hidden mr-2"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="relative">
          <img
            src={getConversationAvatar()}
            alt={getConversationName()}
            className="w-10 h-10 rounded-full object-cover"
          />
          {!conversation.isGroup && conversation.participants[0]?.status === 'online' && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>
        
        <div className="ml-3">
          <h2 className="text-lg font-semibold text-gray-900">{getConversationName()}</h2>
          <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
          <Phone className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
          <Video className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};