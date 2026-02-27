import { useState, useEffect, useCallback } from "react";
import { Search, X, MessageCircle, Users } from "lucide-react";
import useSearchUserStore from "../store/searchUserStore";
import useChatStore from "../store/chatStore";
import type { User } from "../store/userStore";

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
}

export function UserSearchModal({ isOpen, onClose, onSelectUser }: UserSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { setModalClose, searchResults, searchUsers } = useSearchUserStore();
  const { createChat } = useChatStore();

  const filteredUsers = useCallback(async () => {
    if (!searchQuery.trim()) return searchResults;
    await searchUsers(searchQuery.toLowerCase());
  }, [searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => filteredUsers(), 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, filteredUsers]);

  const handleStartChat = async (user: User) => {
    try {
      await createChat([user.id], false);
      setModalClose(false);
    } catch { /* handled */ }
  };

  const handleSelectUser = (user: User) => {
    onSelectUser(user);
    onClose();
    setSearchQuery("");
  };

  const handleClose = () => {
    setModalClose(false);
    onClose();
    setSearchQuery("");
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative glass-strong rounded-2xl shadow-[var(--shadow-elevated)] max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-light" />
              Search Users
            </h2>
            <button onClick={handleClose} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-hover transition-colors">
              <X className="h-4 w-4 text-text-muted" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name or username"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-tertiary border border-border rounded-lg text-text text-sm placeholder-text-muted focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all outline-none"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          <div className="space-y-1.5">
            {!searchResults || searchResults.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-10 w-10 mx-auto mb-3 text-text-muted opacity-40" />
                <p className="text-sm text-text-muted">
                  {searchQuery ? "No users found" : "Start typing to search"}
                </p>
              </div>
            ) : (
              searchResults.map((user: User) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer group"
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-bg-tertiary flex-shrink-0">
                    {user.avatarUrl != null ? (
                      <img src={user.avatarUrl || ""} alt={user.fullname} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center gradient-bg text-white font-medium text-sm">
                        {user.fullname.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text text-sm truncate">{user.fullname}</p>
                    <p className="text-xs text-text-muted truncate">@{user.username}</p>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleStartChat(user); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity gradient-bg text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Chat
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
