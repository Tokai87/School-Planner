import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { upsertProfile } from "@/services/profileService";
import type { ProfileInput } from "@/types/database";

/** Profile state + save action for the signed-in user. The id always comes from the session, never from form data. */
export function useProfile() {
  const { user, profile, profileStatus, refreshProfile, retryProfile } = useAuth();

  const saveProfile = useCallback(
    async (input: ProfileInput) => {
      if (!user) throw new Error("Not signed in");
      return upsertProfile(user.id, input);
    },
    [user],
  );

  return { profile, status: profileStatus, saveProfile, refreshProfile, retryProfile };
}
