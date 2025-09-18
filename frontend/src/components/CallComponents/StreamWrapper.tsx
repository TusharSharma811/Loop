import { StreamCall } from "@stream-io/video-react-sdk";
import { useCallStreamStore } from "../../store/callStreamStore";
import { useEffect, useRef } from "react";

export const StreamWrapper = ({ children }: { children: React.ReactNode }) => {
  const callStream = useRef(useCallStreamStore((state) => state.activeCall));
  const incomingCall = useCallStreamStore((state) => state.incomingCall);
useEffect(() => {
    if (incomingCall) {
      console.log("StreamWrapper - Incoming Call detected:", incomingCall);
      callStream.current = useCallStreamStore.getState().client?.call("default", incomingCall.callId) || null;
      console.log("StreamWrapper - Set callStream to incoming call:", callStream);
    }
  }, [incomingCall]);
  console.log("StreamWrapper - Current active callStream:", callStream);
  if (!callStream.current) return null;
console.log("StreamWrapper - Rendering StreamCall with callStream:", callStream);

  return <StreamCall call={callStream.current}>{children}</StreamCall>;
};
