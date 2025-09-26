import { create } from "zustand";
import api from "../lib/axiosInstance";
import type { User } from "./userStore";
import type { Message } from "./messageStore";




export interface Chat {
  id: string;
  name: string;
  lastMessage?: Message;
  updatedAt: string;
  participants: User[];
  isGroup: boolean;
  groupName?: string;
  avatarUrl?: string;
}


type ChatStore = {
  chats: Chat[];
  onlineUsers: string[];
  loading: boolean;
  error: string | null;
  setChats: (chats: Chat[]) => void;
  addOnlineUser: (userId: string) => void;
  addChat: (chat: Chat) => void;
  clearChats: () => void;
  fetchChats: () => Promise<void>;
  createChat: (participantIds: string[], isGroup: boolean, groupName?: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
};

const useChatStore = create<ChatStore>((set) => ({
  chats: [],
  onlineUsers: [],
  loading: true,
  error: null,

  setChats: (chats) => set({ chats }),
  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.includes(userId)
        ? state.onlineUsers
        : [...state.onlineUsers, userId],
    })),
  addChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),
  clearChats: () => set({ chats: [] }),

 fetchChats: async () => {
  set({ loading: true, error: null });
  try {
    const response = await api.get("/chats");
    if (!response.data) throw new Error("Failed to fetch chats");

    const data: Chat[] = response.data;

    set((state) =>
      JSON.stringify(state.chats) !== JSON.stringify(data)
        ? { chats: data, loading: false }
        : { loading: false }
    );
  } catch (error) {
    set({
      error: error instanceof Error ? error.message : "Unknown error",
      loading: false,
    });
    console.error("Error fetching chats:", error);
  }
},
  createChat: async (participantIds: string[], isGroup: boolean, groupName?: string) => {
  set({ loading: true, error: null });
  try {
    const response = await api.post("/chats/create/chat", {
      participantIds,
      isGroup,
      groupName,
    });

    if (!response.data) {
      throw new Error("Failed to create chat");
    }

    const newChat: Chat = response.data;

    set((state) => {
      // ✅ prevent duplicates
      const exists = state.chats.some((c) => c.id === newChat.id);
      if (exists) {
        return { loading: false }; // no state change if already exists
      }
      console.log("Adding new chat:", newChat);
      
      return { chats: [...state.chats, newChat], loading: false };
    });
  } catch (error) {
    set({
      error: error instanceof Error ? error.message : "Unknown error",
      loading: false,
    });
    console.error("Error creating chat:", error);
  }
},
  deleteChat: async (chatId: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/chats/delete/${chatId}`);
      set((state) => ({
        chats: state.chats.filter((chat) => chat.id !== chatId),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      });
      console.error("Error deleting chat:", error);
    }
  },

}));

export default useChatStore;
