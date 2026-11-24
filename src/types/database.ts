export type Role = "primary_student" | "secondary_student" | "parent";

export const PRIMARY_LEVELS = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"] as const;
export const SECONDARY_LEVELS = ["Form 1", "Form 2", "Form 3", "Form 4", "Form 5"] as const;
export const GENDERS = ["male", "female"] as const;
export type Gender = (typeof GENDERS)[number];
export const SESSIONS = ["Morning", "Afternoon", "Full Day"] as const;

export type SchoolSession = (typeof SESSIONS)[number];

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  school_name: string | null;
  class_name: string | null;
  school_level: string | null;
  school_session: SchoolSession | null;
  phone_number: string | null;
  /** Drives the colour theme. Null for profiles saved before the gender field existed (default theme). */
  gender: Gender | null;
  /** Storage path of the profile photo inside the private "avatars" bucket (`<user id>/avatar-<time>.jpg`). Null = no photo. */
  avatar_path: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

/** What the client is allowed to write. `id` always comes from the authenticated session. */
export type ProfileInput = Omit<Profile, "id" | "created_at" | "updated_at" | "onboarding_completed" | "avatar_path">;
