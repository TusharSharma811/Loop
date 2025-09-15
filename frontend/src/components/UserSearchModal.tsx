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

export function UserSearchModal({
  isOpen,
  onClose,
  onSelectUser,
}: UserSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { setModalClose, searchResults, searchUsers } = useSearchUserStore();
  const { createChat  } = useChatStore();
  const filteredUsers = useCallback(async () => {
    if (!searchQuery.trim()) return searchResults;
    const query = searchQuery.toLowerCase();
    await searchUsers(query);
  }, [searchQuery]);
 
  useEffect(() => {
    const timeout = setTimeout(() => {
      filteredUsers();
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, filteredUsers]);

  const handleStartChat = async (user: User) => {
    try {
      await createChat([user.id], false);
      setModalClose(false);
      console.log("Chat started successfully");
    } catch (error) {
      console.error("Error starting chat:", error);
    }
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
      if (event.key === "Escape") {
        handleClose();
      }
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Search Users
            </h2>
            <button
              onClick={handleClose}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or username"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {!searchResults || searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {searchQuery ? "No users found" : "No users available"}
                </p>
              </div>
            ) : (
              searchResults.map((user: User) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                  onClick={() => handleSelectUser(user)}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      {user.avatarUrl != null ? (
                        <img
                          src={user.avatarUrl || ""}
                          alt={user.fullname}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium text-sm">
                          {user.fullname
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* Online indicator */}
                    {/* {user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                    )} */}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {user.fullname}
                      </p>
                      {/* {user.isOnline && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                          Online
                        </span>
                      )} */}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      @{user.username}
                      {/* {!user.isOnline && user.lastSeen && <span className="ml-2">• Last seen {user.lastSeen}</span>} */}
                    </p>
                  </div>

                  {/* Chat Button */}
                  <button
                    onClick={() => handleStartChat(user)}
                    className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1"
                  >
                    <MessageCircle className="h-4 w-4" />
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
