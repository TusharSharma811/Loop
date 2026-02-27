import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import useMessageStore, { type Message } from "./messageStore";
import useUserStore from "./userStore";
import useChatStore from "./chatStore";

type TypingUser = {
  userId: string;
  chatId: string;
  username: string;
};

type SocketStore = {
  socket: Socket | null;
  isConnected: boolean;
  typingUsers: TypingUser[];
  connect: () => void;
  disconnect: () => void;
  sendMessage: (event: string, data: unknown) => void;
  emitTyping: (chatId: string) => void;
};

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  typingUsers: [],

  connect: async () => {
    if (get().socket?.connected) return;

    const existingSocket = get().socket;
    if (existingSocket) {
      existingSocket.removeAllListeners();
      existingSocket.disconnect();
    }

    const userId = useUserStore.getState().user?.id;
    if (!userId) return;

    const socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:3000", {
      transports: ["websocket"],
      query: { userId },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socket.on("connect", () => {
      set({ isConnected: true });
    });

    socket.on("disconnect", () => {
      set({ isConnected: false });
    });

    socket.on("reconnect", () => {
      set({ isConnected: true });
      const chats = useChatStore.getState().chats;
      chats.forEach((chat) => socket.emit("joinRoom", chat.id));
    });

    socket.on("chat-message", (msg) => {
      const user = useUserStore.getState().user;
      if (msg.message.senderId === user?.id && msg.message.messageType !== "image") return;

      const messageStore = useMessageStore.getState();
      if (msg.message.id && messageStore.messages.some((m) => m.id === msg.message.id)) return;

      messageStore.addMessage(msg.message as Message);

      useChatStore.getState().updateLastMessage(msg.chatId, msg.message);
    });

    socket.on("online-user", (user) => {
      useChatStore.getState().addOnlineUser(user);
    });

    socket.on("user-typing", ({ userId: typingUserId, chatId, username }) => {
      const currentUser = useUserStore.getState().user;
      if (typingUserId === currentUser?.id) return;

      set((state) => {
        const exists = state.typingUsers.some(
          (t) => t.userId === typingUserId && t.chatId === chatId
        );
        if (exists) return state;
        return { typingUsers: [...state.typingUsers, { userId: typingUserId, chatId, username }] };
      });

      setTimeout(() => {
        set((state) => ({
          typingUsers: state.typingUsers.filter(
            (t) => !(t.userId === typingUserId && t.chatId === chatId)
          ),
        }));
      }, 3000);
    });

    socket.on("user-offline", (offlineUserId: string) => {
      useChatStore.getState().removeOnlineUser(offlineUserId);
    });

    set({ socket });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      set({ socket: null, isConnected: false, typingUsers: [] });
    }
  },

  sendMessage: (event, data) => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.emit(event, data);
    }
  },

  emitTyping: (chatId: string) => {
    const socket = get().socket;
    const user = useUserStore.getState().user;
    if (socket?.connected && user) {
      socket.emit("typing", { chatId, userId: user.id, username: user.fullname });
    }
  },
}));
