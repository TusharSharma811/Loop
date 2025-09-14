// CallModalContent.tsx
import React, { useState, useEffect } from 'react';
import { useCallStateHooks, ParticipantView } from '@stream-io/video-react-sdk';

interface Props {
  onClose: () => void;
}

const CallModalContent: React.FC<Props> = ({ onClose }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const { useParticipants, useCall } = useCallStateHooks();
  const participants = useParticipants();
  const call = useCall();

  useEffect(() => {
    if (call) {
      call.on('call.ended', onClose);
    }
    return () => {
      if (call) {
        call.off('call.ended', onClose);
      }
    };
  }, [call, onClose]);

  return (
    <div className="call-modal">
      <div className="call-header">
        <h2>Call with {participants.length} participants</h2>
        <button onClick={onClose}>End Call</button>
      </div>
      <div className="call-body">
        <div className="participants">
          {participants.map((p) => (
            <div key={p.sessionId} className="participant">
              <ParticipantView participant={p} />
            </div>
          ))}
        </div>
      </div>
      <div className="call-footer">
        <button
          onClick={() => {
            call?.localParticipant?.audioTrack?.setEnabled(isMuted);
            setIsMuted(!isMuted);
          }}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button
          onClick={() => {
            call?.localParticipant?.videoTrack?.setEnabled(isCameraOff);
            setIsCameraOff(!isCameraOff);
          }}
        >
          {isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
        </button>
      </div>
    </div>
  );
};

export default CallModalContent;
