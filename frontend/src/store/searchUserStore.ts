import { create } from "zustand";
import api from "../lib/axiosInstance";

type SearchUserStore = {
    searchResults: [];
    setSearchResults: (results: []) => void;
    modalOpen: boolean;
    setModalOpen: (isOpen: boolean) => void;
    setModalClose: (isOpen: boolean) => void;
    searchUsers: (query: string) => Promise<void>;
};


const useSearchUserStore = create<SearchUserStore>((set) => ({
    searchResults: [],
    setSearchResults: (results) => set({ searchResults: results }),
    modalOpen: false,
    setModalOpen: (isOpen: boolean) => set({ modalOpen: isOpen }),
    setModalClose: (isOpen: boolean) => set({ modalOpen: isOpen }),
    searchUsers : async (query: string) => {
        try {
            const response = await api.get(`/u/search?q=${query}`);
            if (!response.data) {
                throw new Error("Failed to search users");
            }
            set({ searchResults: response.data });
        } catch (error) {
            console.error("Error searching users:", error);
        }
    }
}));

export default useSearchUserStore;
