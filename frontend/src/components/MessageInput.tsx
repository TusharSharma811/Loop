import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, Image as ImageIcon } from 'lucide-react';
import useMessageStore from '../store/messageStore';
import { useSocketStore } from '../store/socketStore';
import useUserStore from '../store/userStore';
import CommandPalette from './CommandPalete';

interface MessageInputProps {
  disabled?: boolean;
  conversationId?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ disabled = false, conversationId }) => {
  const [message, setMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const { sendMessage } = useMessageStore();
  const { socket, emitTyping } = useSocketStore();
  const { user: currentUser } = useUserStore();

  const handleTyping = () => {
    if (conversationId && currentUser) {
      emitTyping(conversationId);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && socket && conversationId && currentUser) {
      sendMessage(socket, conversationId, message.trim(), 'text', currentUser.id);
      setMessage('');
    }
  };

  const handleSendImage = () => {
    if (!selectedFile || !socket || !conversationId || !currentUser) return;
    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const fileData = {
          content: reader.result,
          name: selectedFile.name,
          size: selectedFile.size,
        };
        sendMessage(socket, conversationId, JSON.stringify(fileData), 'image', currentUser.id);
      }
      setImagePreview(null);
      setSelectedFile(null);
      setUploading(false);
    };
    reader.onerror = () => {
      setUploadError('Failed to read file.');
      setUploading(false);
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === '/' && message === '') {
      e.preventDefault();
      setShowCommands(prev => !prev);
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
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
      setUploadError('Image exceeds 5MB limit.');
      if (e.target) e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (e.target) e.target.value = '';
  };

  const clearPreview = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setSelectedFile(null);
  };

  return (
    <div className="border-t border-border bg-bg-secondary/80 backdrop-blur-md relative">
      {imagePreview && (
        <div className="px-4 pt-3">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-xl border border-border" />
            <button onClick={clearPreview} className="absolute -top-2 -right-2 w-6 h-6 bg-danger rounded-full flex items-center justify-center text-white hover:bg-danger/80 transition-colors">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {showCommands && (
        <div className="absolute bottom-full left-4 right-4 mb-2 glass-strong rounded-xl shadow-[var(--shadow-elevated)] z-10 max-h-60 max-w-xs overflow-y-auto">
          <div className="p-3">
            <CommandPalette />
          </div>
        </div>
      )}

      <div className="p-3">
        <form onSubmit={imagePreview ? (e) => { e.preventDefault(); handleSendImage(); } : handleSubmit} className="flex items-end space-x-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

          <button
            type="button"
            className="p-2.5 text-text-muted hover:text-primary-light hover:bg-surface-hover rounded-xl transition-colors flex-shrink-0"
            disabled={disabled}
            onClick={handleAttachmentClick}
            title="Attach image"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
              onKeyDown={handleKeyPress}
              placeholder={disabled ? "Select a conversation..." : "Type a message..."}
              disabled={disabled}
              className="w-full px-4 py-2.5 bg-bg-tertiary border border-border rounded-xl resize-none text-text text-sm placeholder-text-muted focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all outline-none disabled:opacity-40"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>

          <button
            type="submit"
            disabled={disabled || uploading || (!message.trim() && !imagePreview)}
            className="p-2.5 gradient-bg text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
            title={imagePreview ? "Send image" : "Send message"}
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : imagePreview ? (
              <ImageIcon className="h-5 w-5" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>

        {uploadError && (
          <div className="mt-2 flex items-center justify-between text-xs text-danger bg-danger/10 p-2 rounded-lg border border-danger/20">
            <span>{uploadError}</span>
            <button onClick={() => setUploadError('')} className="p-0.5 rounded-full hover:bg-danger/20 transition-colors">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
