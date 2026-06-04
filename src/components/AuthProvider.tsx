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
import { syncProFromCloud, isProUser as isProLocal, deactivateProLocal } from "@/lib/free-tier";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isPro: boolean;
  signOut: () => Promise<void>;
  syncProgress: () => Promise<void>;
  refreshPro: () => Promise<void>;
  supabaseReady: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isPro: false,
  signOut: async () => {},
  syncProgress: async () => {},
  refreshPro: async () => {},
  supabaseReady: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

async function fetchIsPro(
  supabase: NonNullable<ReturnType<typeof createClient>>,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", userId)
    .maybeSingle();
  return !!data?.is_pro;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(() =>
    typeof window !== "undefined" ? isProLocal() : false
  );
  const supabaseReady = isSupabaseConfigured();

  const refreshPro = useCallback(async () => {
    const supabase = createClient();
    if (!supabase || !user) {
      setIsPro(isProLocal());
      return;
    }
    const pro = await fetchIsPro(supabase, user.id);
    syncProFromCloud(pro);
    setIsPro(pro || isProLocal());
  }, [user]);

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

    supabase.auth
      .getUser()
      .then(async ({ data }) => {
        setUser(data.user);
        if (data.user) {
          const pro = await fetchIsPro(supabase, data.user.id);
          syncProFromCloud(pro);
          setIsPro(pro || isProLocal());
        } else {
          setIsPro(isProLocal());
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setIsPro(false);
        deactivateProLocal();
        setLoading(false);
        return;
      }
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        const pro = await fetchIsPro(supabase, session.user.id);
        syncProFromCloud(pro);
        setIsPro(pro || isProLocal());
      }
      if (event === "SIGNED_IN" && session?.user) {
        await mergeLocalProgressToCloud(supabase, session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    setUser(null);
    setIsPro(false);
    deactivateProLocal();

    void fetch("/api/auth/signout", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    }).catch(() => undefined);

    const supabase = createClient();
    if (supabase) {
      void Promise.race([
        supabase.auth.signOut({ scope: "local" }),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]).catch(() => undefined);
    }

    if (typeof window !== "undefined") {
      window.location.replace("/?signed_out=1");
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("signed_out") !== "1") return;
    setUser(null);
    setIsPro(false);
    deactivateProLocal();
    const supabase = createClient();
    if (supabase) {
      void supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    }
    window.history.replaceState({}, "", window.location.pathname || "/");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success" && user) {
      void refreshPro();
    }
  }, [user, refreshPro]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isPro,
        signOut,
        syncProgress,
        refreshPro,
        supabaseReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
