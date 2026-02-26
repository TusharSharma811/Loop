
import { create } from "zustand";
import api from "../lib/axiosInstance";
import { StreamVideoClient, Call } from "@stream-io/video-react-sdk";
import useUserStore from "./userStore";

interface IncomingCall {
  callId: string;
  callerId: string;
  callerName?: string;
  callerAvatar?: string;
  isVideo: boolean;
}

interface OutgoingCall {
  callId: string;
  calleeId: string;
  calleeName?: string;
  isVideo: boolean;
}

export interface CallStreamStore {
  client: StreamVideoClient | null;
  setClient: (client: StreamVideoClient) => void;
  clearClient: () => void;
  fetchClient: () => Promise<void>;
  initiateCall: (
    calleeId: string,
    isVideo?: boolean,
    calleeName?: string
  ) => Promise<void>;
  deleteCall: (callId: string) => Promise<void>;

  activeCall: Call | null;
  setActiveCall: (call: Call) => void;
  clearActiveCall: () => void;

  incomingCall: IncomingCall | null;
  setIncomingCall: (callData: IncomingCall) => void;
  clearIncomingCall: () => void;

  outgoingCall: OutgoingCall | null;
  setOutgoingCall: (callData: OutgoingCall) => void;
  clearOutgoingCall: () => void;

  isInCall: boolean;
  callError: string | null;
  setCallError: (error: string | null) => void;
}

export const useCallStreamStore = create<CallStreamStore>((set, get) => ({
  client: null,
  setClient: (client) => set({ client }),

  clearClient: () => {
    const { client } = get();
    if (client) {
      try {
        client.disconnectUser();
      } catch (e) {
        console.warn(e);
      }
    }
    set({
      client: null,
      activeCall: null,
      incomingCall: null,
      outgoingCall: null,
      isInCall: false,
      callError: null,
    });
  },

  fetchClient: async () => {
    const { user } = useUserStore.getState();
    if (!user) return;

    const existingClient = get().client;
    if (existingClient) {
      return;
    }

    try {
      const response = await api.get("/calls/get-token");
      const { token, apiKey } = response.data;

      const newClient = new StreamVideoClient({ apiKey });
      await newClient.connectUser({ id: user.id }, token);



      set({ client: newClient });
    } catch (error) {
      set({ callError: "Failed to initialize call service" });
    }
  },

  // Enhanced initiate call with video support
  initiateCall: async (
    calleeId: string,
    isVideo = false,
  ) => {
    const { client } = get();
    if (!client) throw new Error("No Stream client available");

    try {
      const callId = `${Date.now()}-${calleeId}`;
      const typeofCall = isVideo ? "default" : "audio_room";
      const call = client.call(typeofCall, callId);

      await call.getOrCreate({
        data: {
          members: [
            { user_id: useUserStore.getState().user?.id || "", role: "admin" },
            { user_id: calleeId, role: "admin" },
          ],
          custom: {
            callerInfo : useUserStore.getState().user ? {
              id: useUserStore.getState().user?.id,
              name: useUserStore.getState().user?.fullname,
              avatar: useUserStore.getState().user?.avatarUrl,
            } : {},
          }
        },
        ring: true,
        video: isVideo,
      });

      // Enable video if requested
      if (isVideo) {
        await call.camera.enable();
      }
      await call.microphone.enable();

      set({
        activeCall: call,
        callError: null,
      });
    } catch (error) {
      set({ callError: "Failed to start call" });
    }
  },

  // Helper to delete/leave call safely
  deleteCall: async (callId: string) => {
    const { client } = get();
    if (!client) return;
    try {
      const call = client.call("default", callId);
      try {
        await call.leave();
      } catch { /* already left */ }
      try {
        await call.delete();
      } catch { /* already deleted */ }
    } catch {
      // outer catch
    } finally {
      // cleanup store
      get().clearActiveCall();
      get().clearIncomingCall();
      get().clearOutgoingCall();
      set({ isInCall: false });
    }
  },

  activeCall: null,
  setActiveCall: (call) => set({ activeCall: call, isInCall: true }),
  clearActiveCall: () => set({ activeCall: null, isInCall: false }),

  incomingCall: null,
  setIncomingCall: (callData) => set({ incomingCall: callData }),
  clearIncomingCall: () => set({ incomingCall: null }),

  outgoingCall: null,
  setOutgoingCall: (callData) => set({ outgoingCall: callData }),
  clearOutgoingCall: () => set({ outgoingCall: null }),

  isInCall: false,
  callError: null,
  setCallError: (error) => set({ callError: error }),
}));
