import type { Gender, Profile, Role } from "@/types/database";

export const ROLE_LABEL: Record<Role, string> = {
  primary_student: "Primary Student",
  secondary_student: "Secondary Student",
  parent: "Parent / Guardian",
};

export function dashboardPathFor(role: Role): string {
  return role === "primary_student"
    ? "/dashboard/primary"
    : role === "secondary_student"
      ? "/dashboard/secondary"
      : "/dashboard/parent";
}

export function themeClassFor(role: Role | null | undefined): string {
  return role === "secondary_student" ? "theme-secondary" : role === "parent" ? "theme-parent" : "theme-primary";
}

/** Single source of truth for "where should this user go after auth?" */
export function getPostAuthPath(profile: Profile | null): string {
  if (!profile || !profile.onboarding_completed) return "/onboarding/role";
  return dashboardPathFor(profile.role);
}

/** Wrapper class that selects the male (default blue) or female (rose / purple) colour theme. */
export function genderClassFor(gender: Gender | null | undefined): string {
  return gender === "female" ? "g-f" : "g-m";
}
