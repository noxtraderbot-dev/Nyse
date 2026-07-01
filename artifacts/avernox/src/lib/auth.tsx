import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "wouter";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useGetMe, User } from "@workspace/api-client-react";

interface AuthContextType {
  token: string | null;
  user: User | null | undefined;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("avernox_token"));
  const [userState, setUserState] = useState<User | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    setAuthTokenGetter(() => token);
    if (token) {
      localStorage.setItem("avernox_token", token);
    } else {
      localStorage.removeItem("avernox_token");
    }
  }, [token]);

  // If we have a token but no user yet, useGetMe will fetch it
  const { data: user, isLoading: isUserLoading, error } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (error) {
      // Token might be invalid
      setToken(null);
      setUserState(null);
    } else if (user) {
      setUserState(user);
    }
  }, [user, error]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUserState(newUser);
  };

  const logout = () => {
    setToken(null);
    setUserState(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user: userState || user,
        isLoading: !!token && isUserLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
