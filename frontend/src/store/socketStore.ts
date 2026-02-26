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
    });

    socket.on("disconnect", () => {
    });

    socket.on("chat-message", (msg) => {
      const user = useUserStore.getState().user;
      if (msg.message.senderId === user?.id && msg.message.messageType !== "image") return;
      const messageStore = useMessageStore.getState();

      // Deduplicate: skip if this message ID is already in the store
      if (msg.message.id && messageStore.messages.some((m) => m.id === msg.message.id)) return;

      messageStore.addMessage(msg.message as Message);
    });

    socket.on("online-user", (user) => {
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
      socket.emit(event, data);
    }
  },
}));
