import { create } from "zustand";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import useUserStore from "./userStore";
import api from "../lib/axiosInstance";

interface CallStore {
  streamClient: StreamVideoClient | null;
  initStreamClient: () => Promise<StreamVideoClient | null>;
}

export const useCallStore = create<CallStore>((set) => ({
  streamClient: null,

  initStreamClient: async () => {
    const { user } = useUserStore.getState();
    if (!user) {
      console.error("No logged-in user found");
      return null;
    }

    try {
      // 1️⃣ Fetch token from backend
      const res = await api.post("/calls/get-token", { userId: user.id }, {
        headers: { "Content-Type": "application/json" },
      });

      const { token, apiKey } = res.data;
      if (!token || !apiKey) {
        console.error("Failed to get token or apiKey");
        return null;
      }

      // 2️⃣ Create client
      const client = new StreamVideoClient({ apiKey });

      // 3️⃣ Connect the user
      await client.connectUser({ id: user.id }, token);

      // 4️⃣ Save client in store
      set({ streamClient: client });

      return client;
    } catch (err) {
      console.error("Failed to initialize Stream client:", err);
      return null;
    }
  },
}));
