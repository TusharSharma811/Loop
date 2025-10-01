// socketStore.ts
import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import useMessageStore, { type Message } from "./messageStore";
import useUserStore from "./userStore";
import useChatStore from "./chatStore";

type SocketStore = {
  socket: Socket | null;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (event: string, data: unknown) => void;
};

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,

  connect: async () => {
    if (get().socket) return; 

    const socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:3000", {
      transports: ["websocket"],
      query: { userId: useUserStore.getState().user?.id  || "" },
    });

    socket.on("connect", () => {
      console.log("🔌 Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected");
    });

    socket.on("chat-message", (msg) => {
      console.log("📩 New message:", msg);
      const user = useUserStore.getState().user;
      if (msg.message.senderId === user?.id && msg.message.messageType !== "image") return;
      const messageStore = useMessageStore.getState();
      
      messageStore.addMessage(msg.message as Message);
      console.log("Updated messages:", messageStore.messages);
    });

    socket.on("online-user", (user) => {
      console.log("👤 Online user:", user);
      useChatStore.getState().addOnlineUser(user);
    });

    set({ socket });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  sendMessage: (event, data) => {
    const socket = get().socket;
    if (socket) {
      console.log("📤 Emitting event:", event, data);

      socket.emit(event, data );
    } else {
      console.warn("⚠️ Socket not connected");
    }
  },
}));
