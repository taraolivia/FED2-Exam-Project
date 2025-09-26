"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getStoredUser, type User } from "@/lib/auth";

type UserContextType = {
  user: User | null;
  setUser: (user: User | null | ((prev: User | null) => User | null)) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * Provides user authentication context to the application
 * @param children - Child components to wrap with user context
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  const setUser = (
    userOrUpdater: User | null | ((prev: User | null) => User | null),
  ) => {
    if (typeof userOrUpdater === "function") {
      setUserState(userOrUpdater);
    } else {
      setUserState(userOrUpdater);
    }
  };

  useEffect(() => {
    setUserState(getStoredUser());
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook to access user authentication state and actions
 * @returns User context with current user and setter function
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
