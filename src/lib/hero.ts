import type { Gender, Role } from "@/types/database";
import boy from "@/assets/boy.webp";
import student from "@/assets/student.webp";
import couple from "@/assets/couple.webp";

// Optional artwork: drop files named hero-<primary|secondary|parent>-<male|female>.webp into src/assets
// (e.g. hero-primary-female.webp) and they are picked up automatically, no code change needed.
const custom = import.meta.glob("/src/assets/hero-*.webp", { eager: true, import: "default" }) as Record<string, string>;

/** Character illustration for a role + gender, or null when there is no artwork yet (the UI then shows an icon badge). */
export function heroFor(role: Role, gender: Gender | null | undefined): string | null {
  const g: Gender = gender === "female" ? "female" : "male";
  const key = role === "primary_student" ? "primary" : role === "secondary_student" ? "secondary" : "parent";
  const found = custom[`/src/assets/hero-${key}-${g}.webp`];
  if (found) return found;
  if (role === "parent") return couple; // a couple suits either parent
  if (g === "female") return null; // no girl artwork bundled yet
  return role === "primary_student" ? boy : student;
}
