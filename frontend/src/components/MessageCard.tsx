import React from 'react';
import type { Message } from '../store/messageStore';
import type { User } from '../store/userStore';
import defaultImage from '../assets/default-avatar.png';
import useUserStore from '../store/userStore';

interface MessageBubbleProps {
  message: Message;
  sender: User | undefined;
  isOwn: boolean;
  showAvatar: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, sender, isOwn, showAvatar }) => {
  const user = useUserStore((state) => state.user);

  const formatTime = (date?: Date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex items-end mb-1 ${isOwn ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-3' : ''}`}>
      {!isOwn && (
        <div className="mr-2 flex-shrink-0">
          {showAvatar ? (
            <img
              src={sender?.avatarUrl && sender?.avatarUrl !== "" ? sender?.avatarUrl : defaultImage}
              alt={sender?.fullname || 'User'}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7" />
          )}
        </div>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {!isOwn && showAvatar && (
          <span className="text-[11px] text-text-muted mb-1 px-1">{sender?.fullname}</span>
        )}

        <div className={`relative px-4 py-2 rounded-2xl ${isOwn
            ? 'gradient-bg text-white rounded-br-md'
            : 'bg-bg-elevated text-text rounded-bl-md border border-border'
          }`}>
          {message.messageType === 'image' ? (
            <img
              src={message.content}
              alt="Shared image"
              className="max-w-full rounded-lg h-[240px] w-[240px] object-cover"
              loading="lazy"
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          )}
        </div>

        <span className={`text-[10px] mt-0.5 px-1 ${isOwn ? 'text-text-muted/60' : 'text-text-muted/40'}`}>
          {formatTime(message.timestamp || message.timeStamp)}
        </span>
      </div>

      {isOwn && (
        <div className="ml-2 flex-shrink-0">
          {showAvatar ? (
            <img
              src={user?.avatarUrl && user?.avatarUrl !== "" ? user?.avatarUrl : defaultImage}
              alt={user?.fullname || 'User'}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7" />
          )}
        </div>
      )}
    </div>
  );
};