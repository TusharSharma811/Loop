// socketStore.ts
import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import useMessageStore, {type  Message } from "./messageStore";

type SocketStore = {
  socket: Socket | null;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (event: string, data: unknown) => void;
};

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,

  connect: async () => {
    if (get().socket) return; // already connected

    const socket =  io("http://localhost:3000", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("🔌 Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected");
    });

    // Example listener
    socket.on("chat-message", (msg) => {
      console.log("📩 New message:", msg);
      const messageStore = useMessageStore.getState();
      messageStore.addMessage(msg.message as Message);
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
      socket.emit(event, data);
    } else {
      console.warn("⚠️ Socket not connected");
    }
  },
}));
