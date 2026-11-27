import { supabase } from "@/lib/supabase";
import { EMPTY_DATA, type PlannerData } from "@/lib/planner";

export interface LinkedChild { link_id: string; child_id: string; full_name: string; gender: "male" | "female" | null; school_level: string | null; class_name: string | null; school_name: string | null; avatar_path: string | null; linked_at: string }
export interface LinkedParent { link_id: string; full_name: string; linked_at: string }
export type ChildSnapshot = Pick<PlannerData, "subjects" | "timetable_entries" | "tasks" | "exams">;

/** Student: new one-time code (valid 24 h, replaces any earlier one). */
export async function createLinkCode(): Promise<string> {
  const { data, error } = await supabase.rpc("create_link_code");
  if (error) throw error;
  return data as string;
}

/** Parent: redeem a code. Resolves to the student's name. */
export async function redeemLinkCode(code: string): Promise<string> {
  const { data, error } = await supabase.rpc("redeem_link_code", { p_code: code });
  if (error) throw error;
  return data as string;
}

export async function listLinkedChildren(): Promise<LinkedChild[]> {
  const { data, error } = await supabase.rpc("linked_children");
  if (error) throw error;
  return (data as LinkedChild[]) ?? [];
}

export async function listLinkedParents(): Promise<LinkedParent[]> {
  const { data, error } = await supabase.rpc("linked_parents");
  if (error) throw error;
  return (data as LinkedParent[]) ?? [];
}

export async function childSnapshot(childId: string): Promise<ChildSnapshot> {
  const { data, error } = await supabase.rpc("child_snapshot", { p_child: childId });
  if (error) throw error;
  const d = (data ?? {}) as Partial<ChildSnapshot>;
  return { subjects: d.subjects ?? [], timetable_entries: d.timetable_entries ?? [], tasks: d.tasks ?? [], exams: d.exams ?? [] };
}

export async function unlink(linkId: string): Promise<void> {
  const { error } = await supabase.from("parent_links").delete().eq("id", linkId);
  if (error) throw error;
}

export const asPlanner = (s: ChildSnapshot): PlannerData => ({ ...EMPTY_DATA, ...s });

/** Friendly text for the error codes raised by the database functions. */
export function linkErrorMessage(e: unknown, L: (en: string, ms: string) => string): string {
  const m = (e as { message?: string })?.message ?? "";
  if (m.includes("invalid_or_expired")) return L("That code is invalid or has expired. Ask your child for a new one.", "Kod itu tidak sah atau telah tamat tempoh. Minta kod baharu daripada anak anda.");
  if (m.includes("parents_only")) return L("Only parent accounts can link a child.", "Hanya akaun ibu bapa boleh memautkan anak.");
  if (m.includes("students_only")) return L("Only student accounts can create a link code.", "Hanya akaun pelajar boleh membuat kod pautan.");
  return L("Something went wrong. Please try again.", "Sesuatu tidak kena. Sila cuba lagi.");
}
