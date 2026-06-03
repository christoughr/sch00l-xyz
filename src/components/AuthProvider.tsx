"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadProgress } from "@/lib/progress";
import { mergeLocalProgressToCloud, syncProgressToDb } from "@/lib/progress-db";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  syncProgress: () => Promise<void>;
  supabaseReady: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
  syncProgress: async () => {},
  supabaseReady: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseReady = isSupabaseConfigured();

  const syncProgress = useCallback(async () => {
    const supabase = createClient();
    if (!supabase || !user) return;
    const progress = loadProgress();
    await syncProgressToDb(supabase, user.id, progress);
  }, [user]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" && session?.user) {
        await mergeLocalProgressToCloud(supabase, session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signOut, syncProgress, supabaseReady }}
    >
      {children}
    </AuthContext.Provider>
  );
}
