import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

export type ProfileStatus = "idle" | "loading" | "ready" | "error";

export interface AuthContextValue {
  /** True only while the initial session (including OAuth code exchange) is being resolved. */
  loading: boolean;
  /** True once the session is known AND, if signed in, the profile lookup has finished (ready or error). */
  ready: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  profileStatus: ProfileStatus;
  /** Re-fetch the profile without flipping into a loading state. */
  refreshProfile: () => Promise<void>;
  /** Re-fetch after a failure, showing the loading state. */
  retryProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
