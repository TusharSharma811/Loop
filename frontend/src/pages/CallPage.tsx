import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  StreamCall, 
  SpeakerLayout,
  CallControls,
  ParticipantView,
  useCall,
  useCallStateHooks,
  Call
} from "@stream-io/video-react-sdk";
import { useCallStreamStore } from "../store/callStreamStore";
import { PhoneOff, Users } from "lucide-react";

const CallUI: React.FC = () => {
  const call = useCall();
  const navigate = useNavigate();
  const { 
    useParticipants,
    useCallStartedAt
  } = useCallStateHooks();
  
  const participants = useParticipants();
  const callStartedAt = useCallStartedAt();

  const [showParticipants, setShowParticipants] = React.useState(false);
  const [callDuration, setCallDuration] = React.useState<string>("00:00");

  // Update call duration every second
  React.useEffect(() => {
    if (!callStartedAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(callStartedAt).getTime();
      const duration = Math.floor((now - start) / 1000);
      
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      setCallDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStartedAt]);

  const handleEndCall = async () => {
    try {
      await call?.leave();
      // Use getState() to avoid dependency issues
      useCallStreamStore.getState().clearActiveCall();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Failed to end call:", error);
      navigate("/", { replace: true });
    }
  };

  if (!call) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading call...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Main call area */}
      <div className="h-screen flex flex-col">
        {/* Call header */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Call in progress</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-300">
              <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
              {callStartedAt && <span>• {callDuration}</span>}
            </div>
          </div>
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Users className="h-5 w-5" />
          </button>
        </div>

        {/* Video area */}
        <div className="flex-1 relative">
          <div className="h-full">
            {participants.length > 0 ? (
              <SpeakerLayout />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-800">
                <div className="text-white text-center">
                  <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-lg">Waiting for others to join...</p>
                  <p className="text-sm text-gray-400 mt-2">Share the call link to invite participants</p>
                </div>
              </div>
            )}
          </div>

          {/* Participants sidebar */}
          {showParticipants && (
            <div className="absolute right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 p-4">
              <div className="text-white mb-4">
                <h3 className="text-lg font-semibold mb-4">Participants ({participants.length})</h3>
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div key={participant.sessionId} className="bg-gray-700 rounded-lg overflow-hidden">
                      <div className="h-32">
                        <ParticipantView 
                          participant={participant} 
                          trackType="videoTrack"
                        />
                      </div>
                      <div className="p-2 text-center">
                        <span className="text-sm text-white">
                          {participant.name || participant.userId}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call controls */}
        <div className="bg-gray-800 p-6">
          <div className="flex justify-center items-center space-x-4">
            {/* GetStream's built-in call controls */}
            <CallControls />
            
            {/* Custom end call button */}
            <button
              onClick={handleEndCall}
              className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 transform hover:scale-105 ml-4"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CallPage: React.FC = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const { client, activeCall } = useCallStreamStore();

  const [callInstance, setCallInstance] = React.useState<Call | null>(null);
  const [isJoining, setIsJoining] = React.useState(true);

  // Use a ref to avoid dependency issues
  const callInstanceRef = React.useRef<Call | null>(null);

  React.useEffect(() => {
    if (!client || !callId) {
      navigate("/", { replace: true });
      return;
    }

    const initializeCall = async () => {
      try {
        const call = client.call("default", callId);
        
        // Try to join the call
        try {
          await call.join({ create: false });
          console.log("✅ Successfully joined call");
        } catch (error) {
          console.log("⚠️ Join attempt failed, might already be joined:", error);
        }

        callInstanceRef.current = call;
        setCallInstance(call);
        
        // Only set activeCall if it's not already the right call
        if (!activeCall || activeCall.id !== call.id) {
          useCallStreamStore.getState().setActiveCall(call);
        }
        
        setIsJoining(false);
        
        console.log(`✅ Call initialized: ${callId}`);
      } catch (error) {
        console.error("❌ Failed to initialize call:", error);
        navigate("/", { replace: true });
      }
    };

    initializeCall();

    return () => {
      // Use the ref to avoid dependency issues
      if (callInstanceRef.current) {
        callInstanceRef.current.leave().catch(console.error);
      }
      // Only clear if this is the active call
      const currentActiveCall = useCallStreamStore.getState().activeCall;
      if (currentActiveCall && callInstanceRef.current && currentActiveCall.id === callInstanceRef.current.id) {
        useCallStreamStore.getState().clearActiveCall();
      }
      callInstanceRef.current = null;
    };
  }, [client, callId, navigate, activeCall]);

  if (isJoining || !callInstance) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamCall call={callInstance}>
      <CallUI />
    </StreamCall>
  );
};
