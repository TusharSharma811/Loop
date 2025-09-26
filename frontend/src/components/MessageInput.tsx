import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import useMessageStore from '../store/messageStore';
import { useSocketStore } from '../store/socketStore';
import useUserStore from '../store/userStore';


interface MessageInputProps {
  disabled?: boolean;
  conversationId?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  disabled = false,
  conversationId 
}) => {
  const [message, setMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const { sendMessage } = useMessageStore();
  const { socket } = useSocketStore();
  const { user: currentUser } = useUserStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      if (socket && conversationId && currentUser) {
        sendMessage(socket, conversationId, message.trim(), 'text', currentUser?.id);
      }
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  const handleAttachmentClick = () => {
    setUploadError('');
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
        setUploadError('Only image files are allowed.');
        if (e.target) e.target.value = '';
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Image exceeds 5MB limit. Please select a smaller file.');
      if(e.target) e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (socket && conversationId && currentUser && typeof reader.result === 'string') {
        const fileData = {
          content: reader.result,
          name: file.name,
          size: file.size,
        };

        sendMessage(socket, conversationId, JSON.stringify(fileData), 'image', currentUser.id);
      }
    };
    reader.onerror = () => setUploadError('Failed to read file. Please try again.');
    if(e.target) e.target.value = '';
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        {/* The hidden input that actually handles the file selection */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
        <div className="flex space-x-2">
          {/* This button just opens the file dialog */}
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors" disabled={disabled} onClick={handleAttachmentClick} title="Attach image">
            <Paperclip className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Select a conversation..." : "Type a message..."}
            disabled={disabled}
            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors" disabled={disabled} title="Add emoji">
            <Smile className="h-5 w-5" />
          </button>
        </div>
        
        {/* A simple Send button for text messages */}
        <button type="submit" disabled={disabled || !message.trim()} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed data-[disabled]:hidden" title="Send message" data-disabled={!message.trim()}>
          <Send className="h-5 w-5" />
        </button>
      </form>
      {uploadError && (
        <div className="mt-2 flex items-center justify-between text-sm text-red-600 bg-red-50 p-2 rounded-md">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError('')} className="p-1 rounded-full hover:bg-red-100">
             <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

