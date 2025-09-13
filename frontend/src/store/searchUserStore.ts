import { create } from "zustand";

type SearchUserStore = {
    searchResults: [];
    setSearchResults: (results: []) => void;
    modalOpen: boolean;
    setModalOpen: (isOpen: boolean) => void;
    setModalClose: (isOpen: boolean) => void;
};


const useSearchUserStore = create<SearchUserStore>((set) => ({
    searchResults: [],
    setSearchResults: (results) => set({ searchResults: results }),
    modalOpen: false,
    setModalOpen: (isOpen: boolean) => set({ modalOpen: isOpen }),
    setModalClose: (isOpen: boolean) => set({ modalOpen: isOpen }),
}));

export default useSearchUserStore;
