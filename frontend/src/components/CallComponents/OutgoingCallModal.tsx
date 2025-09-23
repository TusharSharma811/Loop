// src/components/CallComponents/OutgoingCallModal.tsx
import React, { useEffect, useState } from "react";
import { Call, StreamCall, useCall } from "@stream-io/video-react-sdk";
import { PhoneOff, X } from "lucide-react";
import defaultAvatar from "../../assets/defaultAvatar.png";
type OutgoingCallModalProps = {
  call: Call;
};

const InnerModal: React.FC = () => {
  const call = useCall();
  const [seconds, setSeconds] = useState(0);
  const [isCanceling, setIsCanceling] = useState(false);
  const onCancel = (call: Call) => {
    console.log("Call cancelled: ", call);
  };
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60)
      .toString()
      .padStart(2, "0");
    const s = (t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleCancel = async () => {
    if (!call) return;
    setIsCanceling(true);
    try {
      if (typeof call.endCall === "function") {
        await call.endCall();
      } else if (typeof call.leave === "function") {
        await call.leave({ reason: "caller_cancelled" });
      }
      onCancel(call);
    } catch (err) {
      console.error("Failed to cancel call:", err);
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* optional dismiss button */}
        <button
          onClick={handleCancel}
          aria-label="Close"
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={defaultAvatar}
              alt="callee avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
            />
            {/* pulse animation */}
            <span className="absolute -inset-1 rounded-full ring-2 ring-blue-400/30 animate-ping pointer-events-none" />
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900">{"xyz"}</h3>
            <p className="text-sm text-gray-500 mt-1">
              { "Calling…"}
            </p>
            <div className="mt-2 text-xs text-gray-400">
              Ringing • <span className="font-medium text-gray-700">{formatTime(seconds)}</span>
            </div>
          </div>

          {/* Cancel button */}
          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={handleCancel}
              disabled={isCanceling}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transform-gpu active:scale-95"
              aria-label="Cancel call"
              title="Cancel call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-3 text-xs text-center text-gray-400">
            Waiting for {"abc"} to answer…
          </div>
        </div>
      </div>
    </div>
  );
};

const OutgoingCallModal: React.FC<OutgoingCallModalProps> = ({ call}) => {
  if (!call) return null;
  return (
    <StreamCall call={call}>
      <InnerModal  />
    </StreamCall>
  );
};

export default OutgoingCallModal;
