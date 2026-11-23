import { supabase } from "@/lib/supabase";
import type { Profile, ProfileInput } from "@/types/database";

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

/**
 * Create or update the caller's own profile. `userId` must come from the authenticated session.
 * Conflict target is the primary key (= auth.users.id), so repeat sign-ins never create duplicates.
 * RLS additionally enforces id = auth.uid() on the server.
 */
export async function upsertProfile(userId: string, input: ProfileInput): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...input, onboarding_completed: true }, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  return data as Profile;
}
