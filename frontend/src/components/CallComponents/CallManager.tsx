import { useEffect } from "react";
import IncomingCallModal from "./IncomingCallModal";
import OutgoingCallModal from "./OutgoingCallModal";
import { useCalls, CallingState } from "@stream-io/video-react-sdk";
import { useCallStreamStore } from "../../store/callStreamStore";

export const CallManager = ({ onNavigateToCall }: { onNavigateToCall: (callId: string) => void }) => {
  const calls = useCalls();
  const client = useCallStreamStore((state) => state.client);
  const activeCall = useCallStreamStore((state) => state.activeCall);
  const setActiveCall = useCallStreamStore((state) => state.setActiveCall);
  const clearActiveCall = useCallStreamStore((state) => state.clearActiveCall);
  const clearIncomingCall = useCallStreamStore((state) => state.clearIncomingCall);
  const clearOutgoingCall = useCallStreamStore((state) => state.clearOutgoingCall);

  useEffect(() => {
    if (!client) return;

    const handleAccepted = (event: any) => {
      const callId = event.call.id;
      onNavigateToCall(callId);
    };

    const handleEnded = () => {
      clearActiveCall();
      clearIncomingCall();
      clearOutgoingCall();
    };

    client.on("call.accepted", handleAccepted);
    client.on("call.ended", handleEnded);

    return () => {
      client.off("call.accepted", handleAccepted);
      client.off("call.ended", handleEnded);
    };
  }, [client, onNavigateToCall, clearActiveCall, clearIncomingCall, clearOutgoingCall]);

  const incomingCalls = calls.filter(
    (call) =>
      !call.isCreatedByMe && call.state.callingState === CallingState.RINGING
  );
  const [incomingCall] = incomingCalls;

  const outgoingCalls = calls.filter(
    (call) =>
      call.isCreatedByMe && call.state.callingState === CallingState.RINGING
  );
  const [outgoingCall] = outgoingCalls;

  // ✅ Always declared at top level
  useEffect(() => {
    if (incomingCall && !activeCall) {
      setActiveCall(incomingCall);
    }
  }, [incomingCall, activeCall, setActiveCall]);

  if (!client) return null;
  if (incomingCall) return <IncomingCallModal call={incomingCall} />;
  if (outgoingCall) return <OutgoingCallModal call={outgoingCall} />;
  return null;
};
