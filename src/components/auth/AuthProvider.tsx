import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { AuthContext, type ProfileStatus } from "@/hooks/useAuth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { logError } from "@/lib/errors";
import { getProfile } from "@/services/profileService";
import type { Profile } from "@/types/database";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>("idle");
  const requestId = useRef(0);

  const userId = session?.user.id ?? null;

  // 1. Session: resolve initial session (this also completes the PKCE code exchange on /auth/callback) and subscribe.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) logError("auth.getSession", error);
        setSession(data.session);
      })
      .catch((e) => logError("auth.getSession", e))
      .finally(() => active && setLoading(false));

    // Keep this callback synchronous: calling Supabase inside it can deadlock the client.
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const loadProfile = useCallback(async (id: string, showLoading: boolean) => {
    const myRequest = ++requestId.current;
    if (showLoading) setProfileStatus("loading");
    try {
      const p = await getProfile(id);
      if (myRequest !== requestId.current) return; // stale response (user changed)
      setProfile(p);
      setProfileStatus("ready");
    } catch (e) {
      if (myRequest !== requestId.current) return;
      logError("profile.fetch", e);
      setProfileStatus("error");
    }
  }, []);

  // 2. Profile: fetch whenever the signed-in user id changes (token refreshes keep the same id -> no refetch).
  useEffect(() => {
    if (!userId) {
      requestId.current++;
      setProfile(null);
      setProfileStatus("idle");
      return;
    }
    void loadProfile(userId, true);
  }, [userId, loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (userId) await loadProfile(userId, false);
  }, [userId, loadProfile]);

  const retryProfile = useCallback(async () => {
    if (userId) await loadProfile(userId, true);
  }, [userId, loadProfile]);

  const user = session?.user ?? null;
  const ready = !loading && (!user || profileStatus === "ready" || profileStatus === "error");

  return (
    <AuthContext.Provider
      value={{ loading, ready, session, user, profile, profileStatus, refreshProfile, retryProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
