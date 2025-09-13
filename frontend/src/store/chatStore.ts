import { create } from "zustand";



export interface Participant {
  id: string;
  name: string;
}

export interface Chat {
  id: string;
  name: string;
  lastMessage?: string;
  updatedAt: string;
  participants: Participant[];
}


type ChatStore = {
  chats: Chat[];
  loading: boolean;
  error: string | null;
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  clearChats: () => void;
  fetchChats: () => Promise<void>;
};

const useChatStore = create<ChatStore>((set) => ({
  chats: [],
  loading: false,
  error: null,

  setChats: (chats) => set({ chats }),
  addChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),
  clearChats: () => set({ chats: [] }),

  fetchChats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/u/user/chats", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // include cookies for auth
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }

      const data: Chat[] = await response.json();
      set({ chats: data, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      });
      console.error("Error fetching chats:", error);
    }
  },
}));

export default useChatStore;
