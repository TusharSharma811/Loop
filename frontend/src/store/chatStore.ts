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
}


type ChatStore = {
  chats: Chat[];
  loading: boolean;
  error: string | null;
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  clearChats: () => void;
  fetchChats: () => Promise<void>;
  createChat: (participantIds: string[], isGroup: boolean, groupName?: string) => Promise<void>;
};

const useChatStore = create<ChatStore>((set) => ({
  chats: [],
  loading: true,
  error: null,

  setChats: (chats) => set({ chats }),
  addChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),
  clearChats: () => set({ chats: [] }),

  fetchChats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/u/user/chats");
      const data: Chat[] = response.data;
      set({ chats: data, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      });
      console.error("Error fetching chats:", error);
    }
  finally {
      set({ loading: false });
    }
  },
  createChat: async (participantIds: string[], isGroup: boolean, groupName?: string) => {
    try{
      const response = await api.post("/u/create/chat", { participantIds, isGroup, groupName });

      if(!response.data.ok){
        throw new Error("Failed to create chat");
      }
      const newChat: Chat = response.data;
      set((state) => ({ chats: [...state.chats, newChat] }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      });
      console.error("Error creating chat:", error);
    }
    finally {
      set({ loading: false });
    }
  },
}));

export default useChatStore;
