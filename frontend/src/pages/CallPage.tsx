import {
  PaginatedGridLayout,
  ParticipantView,
  StreamCall,
  useCall,
  useCallStateHooks,
  Avatar,
} from "@stream-io/video-react-sdk";
import { useCallStreamStore } from "../store/callStreamStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const MyCallUi = () => {
  const call = useCall();
    useEffect(() => {
    if (call) {
      call.join().catch((err) => console.error("Join error:", err));
      call.microphone.enable().catch((err) => console.error("Mic error:", err));
      
    }
  }, [call]);
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const navigate = useNavigate();

console.log("Rendering MyCallUi, call:", call, "participants:", participants);

  if (!call) return <div className="p-4">No call data</div>;

  return (
    <div className="flex flex-col h-screen w-full bg-gray-900 text-white">
      {/* Header */}
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Meeting Room</h1>
        <span className="text-sm text-gray-400">
          {participants.length} participants
        </span>
      </header>

      {/* Participants Grid */}
      <main className="flex-1 flex items-center justify-center p-4">
        <PaginatedGridLayout />
          {participants.map((p) => (
            <ParticipantView
              key={p.sessionId}
              participant={p}
              trackType="videoTrack"
              ParticipantViewUI={() =>
                  (
                  <div className="flex items-center justify-center w-full h-full bg-gray-800 rounded-xl">
                    <Avatar
                      imageSrc={p.image}
                      name={p.name || "User"}
                      className="w-20 h-20 rounded-full"
                    />
                  </div>
                )
              }
              className="rounded-xl overflow-hidden shadow-lg"
            />
          ))}
    
      </main>

      {/* Footer Controls */}
      <footer className="p-4 border-t border-gray-700 flex justify-center gap-4">
        <button
          onClick={() => call.camera.toggle()}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full"
        >
          {call.camera.state.status === "enabled" ? "📷 On" : "📷 Off"}
        </button>
        <button
          onClick={() => call.microphone.toggle()}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full"
        >
          {call.microphone.state.status === "enabled" ? "🎤 On" : "🎤 Off"}
        </button>
        <button
          onClick={() => call.screenShare.toggle()}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full"
        >
          🖥️ Share
        </button>
        <button
          onClick={async () => {
            await call.microphone.disable();
            await call.camera.disable();
            await call.leave();

            navigate(-1);
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-full"
        >
          🚪 Leave
        </button>
      </footer>
    </div>
  );
};

export const CallPage = () => {
  const activeCall = useCallStreamStore((state) => state.activeCall);
console.log("Rendering CallPage, activeCall:", activeCall);

  if (!activeCall) return <div className="p-4">No active call</div>;

  return (
    <StreamCall call={activeCall}>
      <MyCallUi />
    </StreamCall>
  );
};
