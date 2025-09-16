// store/callStreamStore.ts
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
  initiateCall: (calleeId: string, isVideo?: boolean, calleeName?: string) => Promise<void>;
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
      try { client.disconnectUser(); } catch (e) { console.warn(e); }
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
      console.log("⚠️ Stream client already exists, skipping fetch");
      return;
    }

    try {
      const response = await api.get("/calls/get-token");
      const { token, apiKey } = response.data;

      const newClient = new StreamVideoClient({ apiKey });
      await newClient.connectUser({ id: user.id }, token);

      // Enhanced event handlers with proper types
      newClient.on("call.ring", (event: { call?: unknown; user?: unknown; call_cid?: string }) => {
        console.log("📞 call.ring event:", event);
        const currentUserId = useUserStore.getState().user?.id;
        const callerId = (event?.call as { created_by?: { id: string } })?.created_by?.id ?? (event?.user as { id: string })?.id;
        const callId = (event?.call as { id: string })?.id ?? (event?.call_cid?.split?.(":")?.[1]);
        const isVideo = (event?.call as { settings?: { video?: { enabled: boolean } } })?.settings?.video?.enabled || false;

        if (!callId) return;
        if (currentUserId && currentUserId !== callerId) {
          set({ 
            incomingCall: { 
              callId, 
              callerId,
              callerName: (event?.call as { created_by?: { name: string } })?.created_by?.name || callerId,
              isVideo
            } 
          });
        }
      });

      newClient.on("call.accepted", (event: { call?: unknown }) => {
        console.log("call.accepted:", event);
        if (event?.call) {
          set({ outgoingCall: null, activeCall: event.call as Call, isInCall: true });
        }
      });

      newClient.on("call.rejected", (event: { call?: unknown }) => {
        console.log("call.rejected:", event);
        set({ outgoingCall: null, callError: "Call was rejected" });
        setTimeout(() => set({ callError: null }), 3000);
      });

      newClient.on("call.ended", (event: { call?: unknown }) => {
        console.log("call.ended:", event);
        get().clearActiveCall();
        get().clearIncomingCall();
        get().clearOutgoingCall();
        set({ isInCall: false });
      });

      // helpful debug during dev
      newClient.on("all", (event: { type: string }) => {
        console.debug("Stream event:", event.type, event);
      });

      set({ client: newClient });
      console.log("✅ Connected Stream Video client:", user.id);
    } catch (error) {
      console.error("❌ Error fetching call stream client:", error);
      set({ callError: "Failed to initialize call service" });
    }
  },

  // Enhanced initiate call with video support
  initiateCall: async (calleeId: string, isVideo = false, calleeName?: string) => {
    const { client } = get();
    if (!client) throw new Error("No Stream client available");
    
    try {
      const callId = `${Date.now()}-${calleeId}`;
      const call = client.call("default", callId);
      
      await call.getOrCreate({
        data: {
          members: [
            { user_id: useUserStore.getState().user?.id || "", role: "admin" },
            { user_id: calleeId, role: "user" }
          ]
        },
        ring: true
      });

      // Enable video if requested
      if (isVideo) {
        await call.camera.enable();
      }
      await call.microphone.enable();

      set({ 
        outgoingCall: { 
          callId: call.id, 
          calleeId, 
          calleeName,
          isVideo 
        },
        activeCall: call,
        callError: null
      });
    } catch (error) {
      console.error("Failed to initiate call:", error);
      set({ callError: "Failed to start call" });
    }
  },

  // Helper to delete/leave call safely
  deleteCall: async (callId: string) => {
    const { client } = get();
    if (!client) return;
    try {
      const call = client.call("default", callId);
      try { await call.leave(); } catch (e) { console.warn("Failed leaving call", e); }
      try { await call.delete(); } catch (e) { console.warn("Failed deleting call", e); } 
    } catch (e) {
      console.warn("Failed deleting call", e);
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
