import { Phone, Video, MoreVertical, Menu } from "lucide-react";
import useUserStore from "../store/userStore";
import type { Chat } from "../store/chatStore";
import defaultAvatar from "../assets/default-avatar.png";


interface Props {
  conversation: Chat | null;
  onSidebarToggle: () => void;
}

export const ChatHeader: React.FC<Props> = ({
  conversation,
  onSidebarToggle,
}) => {
  const { user } = useUserStore();
  

  if (!conversation) {
    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <button
          onClick={onSidebarToggle}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-center text-gray-500">Select a conversation</div>
        <div className="w-10" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <button
            onClick={onSidebarToggle}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full lg:hidden mr-2"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative">
            <img
              src={
                conversation.isGroup
                  ? conversation.groupAvatar || defaultAvatar
                  : conversation.participants.find((p) => p.id !== user?.id)
                      ?.avatarUrl || defaultAvatar
              }
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {conversation.isGroup
                ? conversation.groupName
                : conversation.participants.find((p) => p.id !== user?.id)
                    ?.fullname || "Unknown"}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
            onClick={() => alert("Calling feature coming soon!")}
          >
            <Phone className="h-5 w-5" />
          </button>
          <button
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
            onClick={() => alert("Video feature coming soon!")}
          >
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );
};
