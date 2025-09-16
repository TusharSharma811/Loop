import { PaginatedGridLayout, ParticipantView, StreamCall, useCall, useCallStateHooks } from "@stream-io/video-react-sdk"
import { useCallStreamStore } from "../store/callStreamStore";
import { useEffect } from "react";



const MyCallUi = () => {
  const call = useCall();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  console.log("Participants: ", participants);
  console.log("Call: ", call);
  
  
  return (
    <div>
      <h1>My Call UI</h1>
      <PaginatedGridLayout />
  
    </div>
  )
}

export const CallPage = () => {
  const activeCall = useCallStreamStore((state) => state.activeCall);
  if(!activeCall) return <div>No active call</div>
  return (
    <div>
      <StreamCall call={activeCall}>
        <MyCallUi />
      </StreamCall>
    </div>
  )
}

