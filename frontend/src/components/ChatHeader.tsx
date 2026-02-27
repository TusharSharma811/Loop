import { Menu } from "lucide-react";
import useUserStore from "../store/userStore";
import type { Chat } from "../store/chatStore";
import defaultAvatar from "../assets/default-avatar.png";
import { useCallStreamStore } from "../store/callStreamStore";
import DropdownMenu from "./DropDownMenu";
import useChatStore from "../store/chatStore";
import ConfirmationModal from "./ConfirmationModal";
import { useState } from "react";

interface Props {
  conversation: Chat | null;
  onSidebarToggle: () => void;
}

export const ChatHeader: React.FC<Props> = ({ conversation, onSidebarToggle }) => {
  const { user } = useUserStore();
  const { deleteChat } = useChatStore();
  const { client, isInCall, outgoingCall } = useCallStreamStore();
  const { onlineUsers } = useChatStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteRequest = () => setIsModalOpen(true);

  const handleConfirmDelete = async () => {
    if (conversation) await deleteChat(conversation.id);
    setIsModalOpen(false);
  };

  const otherParticipant = conversation?.participants.find((p) => p.id !== user?.id);
  const isOnline = otherParticipant ? onlineUsers.includes(otherParticipant.id) : false;

  if (!conversation) {
    return (
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-bg-secondary/80 backdrop-blur-md">
        <button onClick={onSidebarToggle} className="p-2 text-text-muted hover:text-text hover:bg-surface-hover rounded-lg lg:hidden transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-text-muted text-sm">Select a conversation</div>
        <div className="w-10" />
      </div>
    );
  }

  const avatarSrc = conversation.isGroup
    ? defaultAvatar
    : otherParticipant?.avatarUrl && otherParticipant.avatarUrl !== "" ? otherParticipant.avatarUrl : defaultAvatar;

  const displayName = conversation.isGroup
    ? conversation.groupName
    : otherParticipant?.fullname || "Unknown";

  return (
    <>
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-bg-secondary/80 backdrop-blur-md">
        <div className="flex items-center">
          <button onClick={onSidebarToggle} className="p-2 text-text-muted hover:text-text hover:bg-surface-hover rounded-lg lg:hidden mr-2 transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative">
            <img src={avatarSrc} alt="avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-border" />
            {!conversation.isGroup && (
              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-bg-secondary ${isOnline ? "bg-success" : "bg-text-muted/30"}`} />
            )}
          </div>
          <div className="ml-3">
            <h2 className="text-sm font-semibold text-text">{displayName}</h2>
            {!conversation.isGroup && (
              <p className={`text-xs ${isOnline ? "text-success" : "text-text-muted"}`}>
                {isOnline ? "Online" : "Offline"}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <DropdownMenu onDelete={handleDeleteRequest} />
          <ConfirmationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleConfirmDelete}
            title="Delete Chat"
            message="Are you sure you want to delete this conversation? This action is permanent."
          />
          {(isInCall || outgoingCall) && (
            <div className="items-center text-xs text-success ml-2 hidden sm:flex">
              <div className="w-2 h-2 bg-success rounded-full mr-1.5 animate-pulse" />
              {isInCall ? "In call" : "Calling..."}
            </div>
          )}
          {!client && (
            <div className="text-xs text-danger ml-2 hidden sm:block">Call unavailable</div>
          )}
        </div>
      </div>
    </>
  );
};
