// CallModal.tsx
import React from 'react';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import CallModalContext from './CallModalContext';


interface Props {
  call: any;
  onClose: () => void;
}

const CallModal: React.FC<Props> = ({ call, onClose }) => {
  if (!call) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] h-[80%] rounded-xl shadow-lg overflow-hidden">
        <StreamCall call={call}>
          <StreamTheme>
            <CallModalContext onClose={onClose} />
          </StreamTheme>
        </StreamCall>
      </div>
    </div>
  );
};

export default CallModal;
