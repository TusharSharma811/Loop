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

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  sender,
  isOwn,
  showAvatar
}) => {
  // const formatTime = (date: Date) => {
  //   if (!isOwn) return null;
  //   return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  // };
  const user = useUserStore((state) => state.user);

  // const getStatusIcon = () => {
    
  //   switch ( message && message.statuses.filter(s => s === 'read').length > 0 ? 'read' : message.statuses.filter(s => s === 'delivered').length > 0 ? 'delivered' : 'sent') {
  //     case 'sent':
  //       return <Check className="h-4 w-4 text-gray-400" />;
  //     case 'delivered':
  //       return <CheckCheck className="h-4 w-4 text-gray-400" />;
  //     case 'read':
  //       return <CheckCheck className="h-4 w-4 text-blue-500" />;
  //     default:
  //       return null;
  //   }
  // };

  return (
    <div className={`flex items-end mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <div className="mr-3">
          {showAvatar ? (
            <img
              src={ sender?.avatarUrl && sender?.avatarUrl != "" ? sender?.avatarUrl : defaultImage}
              alt={sender?.fullname || 'User'}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      )}
      
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && showAvatar && (
          <span className="text-xs text-gray-500 mb-1 px-3">
            {sender?.fullname}
          </span>
        )}
        
        <div className={`
          relative max-w-xs lg:max-w-md px-4 py-2 rounded-2xl
          ${isOwn 
            ? 'bg-blue-600 text-white rounded-br-md' 
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }
          shadow-sm
        `}>
          {message.messageType === 'image' ? (
            <img
              src={message.content}
              alt="User uploaded"
              className="max-w-full rounded-lg h-[256px] w-[256px] object-cover"
            />
          ): <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>}
         
{/*           
          <div className={`flex items-center justify-end mt-1 space-x-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
            <span className="text-xs opacity-75">
              {formatTime(message.timestamp)}
            </span>
            {getStatusIcon()}
          </div> */}
        </div>
      </div>
      
      {isOwn && (
        <div className="ml-3">
          {showAvatar ? (
            <img
              src={user?.avatarUrl &&user?.avatarUrl != "" ? user?.avatarUrl : defaultImage}
              alt={user?.fullname || 'User'}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      )}
    </div>
  );
};