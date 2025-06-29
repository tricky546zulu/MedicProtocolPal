import { useState, useEffect, createContext, useContext } from "react";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: { name: string; email: string; licenseNumber?: string; password: string }) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem("medic_protocol_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("medic_protocol_user");
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/signin", { email, password });
      const data = await response.json();
      setUser(data.user);
      localStorage.setItem("medic_protocol_user", JSON.stringify(data.user));
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: { name: string; email: string; licenseNumber?: string; password: string }) => {
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/signup", userData);
      const data = await response.json();
      setUser(data.user);
      localStorage.setItem("medic_protocol_user", JSON.stringify(data.user));
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("medic_protocol_user");
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
