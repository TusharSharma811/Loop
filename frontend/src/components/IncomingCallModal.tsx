// components/IncomingCallModal.tsx
import React from "react";
import { Call } from "@stream-io/video-react-sdk";

interface Props {
  call: Call;
  onAccept: () => void;
  onReject: () => void;
}

const IncomingCallModal: React.FC<Props> = ({ call, onAccept, onReject }) => {
  const callerName = call.state.createdBy?.name || "Unknown";
  const callType = call.type === "audio" ? "Audio Call" : "Video Call";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
        <h2 className="text-lg font-bold mb-2">{callType} Incoming</h2>
        <p className="mb-4">From {callerName}</p>
        <div className="flex justify-around">
          <button
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            onClick={onReject}
          >
            Reject
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            onClick={onAccept}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
