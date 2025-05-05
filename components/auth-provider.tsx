"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          setUser(null);
        } else if (sessionData.session) {
          const { data, error } = await supabase.auth.getUser();
          if (error) {
            console.error("Error fetching user:", error);
            setUser(null);
          } else {
            setUser(data.user);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setUser(null);
      }
      setIsLoading(false);
    };
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
