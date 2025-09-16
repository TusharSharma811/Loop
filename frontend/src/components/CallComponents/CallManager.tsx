
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCallStreamStore } from "../../store/callStreamStore";
import IncomingCallModal from "./IncomingCallModal";
import { OutgoingCallModal } from "./OutgoingCallModal";
import { StreamCall } from "@stream-io/video-react-sdk";

export const CallManager: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    client,
    incomingCall,
    outgoingCall,
    activeCall,
    clearIncomingCall,
    clearOutgoingCall,
    setActiveCall,
  } = useCallStreamStore();

  // When activeCall appears, navigate to call page ONLY if not already on a call page
  React.useEffect(() => {
    if (activeCall && !location.pathname.startsWith('/call/')) {
      const targetPath = `/call/${activeCall.id}`;
      if (location.pathname !== targetPath) {
        navigate(targetPath);
      }
    }
  }, [activeCall, navigate, location.pathname]);

  const handleAccept = async () => {
    if (!client || !incomingCall) return;
    
    try {
      const call = client.call("default", incomingCall.callId);
      await call.join({ create: false });
      
      // Clear the incoming call first to avoid any state conflicts
      clearIncomingCall();
      
      // Set active call only if it's not already set to this call
      const currentActiveCall = useCallStreamStore.getState().activeCall;
      if (!currentActiveCall || currentActiveCall.id !== call.id) {
        setActiveCall(call);
      }
      
      console.log("✅ Call accepted and joined");
    } catch (error) {
      console.error("❌ Failed to accept call:", error);
      clearIncomingCall();
    }
  };

  const handleReject = async () => {
    if (!client || !incomingCall) return;
    
    try {
      const call = client.call("default", incomingCall.callId);
      await call.leave();
      await call.reject();
      console.log("✅ Call rejected");
    } catch (error) {
      console.error("❌ Failed to reject call:", error);
    } finally {
      clearIncomingCall();
    }
  };

  const handleCancelOutgoing = async () => {
    if (!client || !outgoingCall) return;
    
    try {
      const call = client.call("default", outgoingCall.callId);
      await call.leave();
      console.log("✅ Outgoing call cancelled");
    } catch (error) {
      console.error("❌ Failed to cancel call:", error);
    } finally {
      clearOutgoingCall();
      if (activeCall?.id === outgoingCall.callId) {
        useCallStreamStore.getState().clearActiveCall();
        navigate("/", { replace: true });
      }
    }
  };

  return (
    <>
      {/* Incoming call modal */}
      {incomingCall && (
        <IncomingCallModal
          call={incomingCall}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}

      {/* Outgoing call modal - wrap in StreamCall for proper context */}
      {outgoingCall && client && (
        <StreamCall call={client.call("default", outgoingCall.callId)}>
          <OutgoingCallModal
            calleeId={outgoingCall.calleeId}
            calleeName={outgoingCall.calleeName}
            isVideo={outgoingCall.isVideo}
            onCancel={handleCancelOutgoing}
          />
        </StreamCall>
      )}
    </>
  );
};
