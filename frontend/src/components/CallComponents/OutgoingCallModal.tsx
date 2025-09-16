import React, { useEffect } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useCall, useCallStateHooks, CallingState } from "@stream-io/video-react-sdk";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/default-avatar.png";

interface OutgoingCallModalProps {
  calleeId: string;
  calleeName?: string;
  calleeAvatar?: string;
  isVideo?: boolean;
  onCancel: () => void;
}

export const OutgoingCallModal: React.FC<OutgoingCallModalProps> = ({
  calleeId,
  calleeName,
  calleeAvatar,
  isVideo = false,
  onCancel,
}) => {
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  // Auto-navigate once the other side answers
  useEffect(() => {
    if (callingState === CallingState.JOINED && call) {
      console.log("✅ Call accepted, navigating to call page...");
      navigate(`/call/${call.id}`);
    }
  }, [callingState, call, navigate]);

  const getStatusText = () => {
    switch (callingState) {
      case CallingState.RINGING:
        return "Calling...";
      case CallingState.JOINING:
        return "Connecting...";
      case CallingState.JOINED:
        return "Connected";
      default:
        return "Initializing...";
    }
  };

  if (callingState === CallingState.RINGING || callingState === CallingState.JOINING) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full mx-4">
          {/* Callee Avatar */}
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img
                src={calleeAvatar || defaultAvatar}
                alt={calleeName || calleeId}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Call Info */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {calleeName || calleeId}
            </h2>
            <p className="text-gray-600 flex items-center justify-center gap-2 mb-2">
              {isVideo ? (
                <>
                  <Video className="h-4 w-4" />
                  Video Call
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4" />
                  Voice Call
                </>
              )}
            </p>
            <p className="text-sm text-blue-600 font-medium animate-pulse">
              {getStatusText()}
            </p>
          </div>

          {/* Calling Animation */}
          <div className="mb-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {isVideo ? (
                    <Video className="h-6 w-6 text-blue-600" />
                  ) : (
                    <Phone className="h-6 w-6 text-blue-600" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg mx-auto"
            aria-label="Cancel call"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      </div>
    );
  }

  // Return nothing if not in the appropriate state
  return null;
};
