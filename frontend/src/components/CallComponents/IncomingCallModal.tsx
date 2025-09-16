import React from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import useUserStore from "../../store/userStore";
import defaultAvatar from "../../assets/default-avatar.png";

interface IncomingCallModalProps {
  call: {
    callId: string;
    callerId: string;
    callerName?: string;
    callerAvatar?: string;
    isVideo: boolean;
  };
  onAccept: () => void;
  onReject: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ call, onAccept, onReject }) => {
  const user = useUserStore((state) => state.user);
  
  if(call.callerId === user?.id) return null; // Prevent showing modal for self calls
  
  console.log("Rendering IncomingCallModal with call:", call);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full mx-4 animate-pulse">
        {/* Caller Avatar */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img
              src={call.callerAvatar || defaultAvatar}
              alt={call.callerName || call.callerId}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Call Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {call.callerName || call.callerId}
          </h2>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            {call.isVideo ? (
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
          <p className="text-sm text-gray-500 mt-1">Incoming call...</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-6 justify-center">
          {/* Reject Button */}
          <button
            onClick={onReject}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg"
            aria-label="Reject call"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
          
          {/* Accept Button */}
          <button
            onClick={onAccept}
            className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg animate-bounce"
            aria-label="Accept call"
          >
            {call.isVideo ? (
              <Video className="h-6 w-6" />
            ) : (
              <Phone className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Ripple effect for incoming call */}
        <div className="absolute inset-0 rounded-2xl border-4 border-green-400 animate-ping opacity-75 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
