import { Phone, Video, MoreVertical, Menu } from "lucide-react";
import useUserStore from "../store/userStore";
import type { Chat } from "../store/chatStore";
import defaultAvatar from "../assets/default-avatar.png";
import { useCallStreamStore } from "../store/callStreamStore";

interface Props {
  conversation: Chat | null;
  onSidebarToggle: () => void;
}

export const ChatHeader: React.FC<Props> = ({
  conversation,
  onSidebarToggle,
}) => {
  const { user } = useUserStore();
  const { client, initiateCall, isInCall, outgoingCall } = useCallStreamStore();

  const handleAudioCall = async () => {
    if (!client || !conversation || !user) {
      alert("Call service not initialized. Please try again later.");
      return;
    }

    if (isInCall || outgoingCall) {
      alert("You are already in a call or have an outgoing call.");
      return;
    }

    try {
      const otherParticipant = conversation.participants.find((p) => p.id !== user.id);
      if (!otherParticipant) {
        alert("Unable to identify call recipient.");
        return;
      }

      await initiateCall(otherParticipant.id, false, otherParticipant.fullname);
      console.log("✅ Audio call initiated");
    } catch (error) {
      console.error("❌ Failed to start audio call:", error);
      alert("Failed to start call. Please try again.");
    }
  };

  const handleVideoCall = async () => {
    if (!client || !conversation || !user) {
      alert("Call service not initialized. Please try again later.");
      return;
    }

    if (isInCall || outgoingCall) {
      alert("You are already in a call or have an outgoing call.");
      return;
    }

    try {
      const otherParticipant = conversation.participants.find((p) => p.id !== user.id);
      if (!otherParticipant) {
        alert("Unable to identify call recipient.");
        return;
      }

      await initiateCall(otherParticipant.id, true, otherParticipant.fullname);
      console.log("✅ Video call initiated");
    } catch (error) {
      console.error("❌ Failed to start video call:", error);
      alert("Failed to start video call. Please try again.");
    }
  };

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
                  ? conversation.groupName || defaultAvatar
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
          {/* Audio Call Button */}
          <button
            className={`p-2 rounded-full transition-all duration-200 group ${
              isInCall || outgoingCall
                ? 'text-gray-400 cursor-not-allowed'
                : !client
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-500 hover:bg-green-50 hover:text-green-600'
            }`}
            onClick={handleAudioCall}
            title={
              isInCall || outgoingCall
                ? "Already in a call"
                : !client
                ? "Call service unavailable"
                : "Start audio call"
            }
            disabled={!client || isInCall || !!outgoingCall}
          >
            <Phone className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </button>

          {/* Video Call Button */}
          <button
            className={`p-2 rounded-full transition-all duration-200 group ${
              isInCall || outgoingCall
                ? 'text-gray-400 cursor-not-allowed'
                : !client
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
            }`}
            onClick={handleVideoCall}
            title={
              isInCall || outgoingCall
                ? "Already in a call"
                : !client
                ? "Call service unavailable"
                : "Start video call"
            }
            disabled={!client || isInCall || !!outgoingCall}
          >
            <Video className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </button>

          {/* More Options */}
          <button 
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all duration-200"
            title="More options"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {/* Call Status Indicator */}
          {(isInCall || outgoingCall) && (
            <div className="items-center text-xs text-green-600 ml-2 hidden sm:flex">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              {isInCall ? "In call" : "Calling..."}
            </div>
          )}
          {!client && (
            <div className="text-xs text-red-500 ml-2 hidden sm:block">
              Call service unavailable
            </div>
          )}
        </div>
      </div>
    </>
  );
};
