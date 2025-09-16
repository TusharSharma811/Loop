import React, { useEffect, useState } from "react";
import {
  StreamCall,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Phone, PhoneOff, Video as VideoIcon, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../store/userStore";

type IncomingCallModalProps = {
  call: any;
};

const InnerModal: React.FC = () => {
  const call = useCall(); // provided by StreamCall wrapper
  const [seconds, setSeconds] = useState(0);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const { useCallMembers, useCallSettings } = useCallStateHooks();
  const members = useCallMembers();
  const settings = useCallSettings();

  const navigate = useNavigate();

  // find caller info (anyone who isn't me)
  const caller = members.find((m) => m.user.id !== useUserStore.getState().user?.id);
  const callerName = caller?.user?.name ?? caller?.user?.id ?? "Unknown Caller";

  // is video call?
  const isVideo = settings?.video?.enabled ?? false;

  // ringing timer
  useEffect(() => {
    setSeconds(0);
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

  const handleAccept = async () => {
    if (!call) return;
    setIsAccepting(true);
    try {
      await call.accept();
      await call.join();
      navigate(`/call/${call.id}`, { replace: true }); 
    } catch (err) {
      console.error("Error accepting call: ", err);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!call) return;
    setIsRejecting(true);
    try {
      await call.reject();
    } catch (error) {
      console.error("Error rejecting call: ", error);
    } finally {
      setIsRejecting(false);
      navigate(-1); // back to previous page
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* top-right dismiss */}
        <button
          onClick={handleReject}
          disabled={isRejecting}
          aria-label="Close"
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {/* Avatar could go here */}
            <span className="absolute -inset-1 rounded-full ring-2 ring-green-400/30 animate-pulse pointer-events-none" />
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900">
              {callerName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isVideo ? "Incoming video call" : "Incoming audio call"}
            </p>
            <div className="mt-2 text-xs text-gray-400">
              Ringing •{" "}
              <span className="font-medium text-gray-700">
                {formatTime(seconds)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex items-center justify-center gap-6">
            <button
              onClick={handleReject}
              disabled={isRejecting || isAccepting}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 hover:bg-red-100 text-red-600 shadow disabled:opacity-50"
              aria-label="Reject call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            <button
              onClick={handleAccept}
              disabled={isAccepting || isRejecting}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg transform-gpu active:scale-95 disabled:opacity-50"
              aria-label="Accept call"
              title="Accept call"
            >
              {isVideo ? (
                <VideoIcon className="w-6 h-6" />
              ) : (
                <Phone className="w-6 h-6" />
              )}
            </button>
          </div>

          <div className="mt-3 text-xs text-center text-gray-400">
            Accept to join the call. You can change mic/camera in the call
            screen.
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Top-level wrapper — pass the call object here.
 * This wraps children in StreamCall so hooks like useCall() work.
 */
const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ call }) => {
  if (!call) return null;
  return (
    <StreamCall call={call}>
      <InnerModal />
    </StreamCall>
  );
};

export default IncomingCallModal;
