import { supabase } from "@/lib/supabase";

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { access_type: "offline", prompt: "select_account" },
    },
  });
  if (error) throw error;
  // On success the browser is redirected to Google; nothing else to do here.
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    // Server revoke failed (e.g. offline) — still clear the local session so the user is signed out on this device.
    await supabase.auth.signOut({ scope: "local" });
  }
}
