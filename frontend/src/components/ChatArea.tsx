import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageCard';
import { MessageInput } from './MessageInput';
import type { User } from '../store/userStore';
import type { Chat as Conversation } from '../store/chatStore';
import useMessageStore from '../store/messageStore';
import useUserStore from '../store/userStore';
import { useSocketStore } from '../store/socketStore';
import { MessageListSkeleton } from './skeletons/ChatAreaSkeleton';
import { MessageCircle } from 'lucide-react';

interface ChatAreaProps {
  conversation: Conversation | null;
  users: User[];
}

export const ChatArea: React.FC<ChatAreaProps> = ({ conversation, users }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeUser: User = users[0];
  const { user: currentUser } = useUserStore();
  const { messages, loading } = useMessageStore();
  const { typingUsers } = useSocketStore();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ block: "end", inline: "nearest" });
    }
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg">
        <div className="text-center animate-slide-up">
          <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-glow-primary)] opacity-80">
            <MessageCircle className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-text mb-2">Welcome to Loop</h3>
          <p className="text-text-muted text-sm max-w-xs mx-auto">Select a conversation from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  const typingInChat = typingUsers.filter(
    (t) => t.chatId === conversation.id && t.userId !== currentUser?.id
  );

  return (
    <div className="flex-1 flex flex-col h-[80%]">
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-1 bg-bg">
        {loading ? (
          <MessageListSkeleton />
        ) : !messages || messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-text-muted mb-1">No messages yet</p>
              <p className="text-sm text-text-muted/60">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const sender =
              message.senderId === activeUser?.id
                ? activeUser
                : users.find((u) => u.id === message.senderId);
            const isOwn = message.senderId === currentUser?.id;
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;

            return (
              <MessageBubble
                key={message.id || `msg-${index}`}
                message={message}
                sender={sender}
                isOwn={isOwn}
                showAvatar={showAvatar}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {typingInChat.length > 0 && (
        <div className="px-4 py-2 bg-bg border-t border-border">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-primary-light rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-primary-light rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-primary-light rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-text-muted">
              {typingInChat.map((t) => t.username).join(", ")} typing...
            </span>
          </div>
        </div>
      )}

      <MessageInput conversationId={conversation.id} disabled={!conversation} />
    </div>
  );
};
