import { BookOpen, Calculator, Atom, FlaskConical, Globe, Landmark, Languages, Monitor, Music, Palette, Dumbbell, Leaf, type LucideIcon } from "lucide-react";
import type { Role } from "@/types/database";
import type { Lang } from "@/lib/lang";

export interface Subject { id: string; name: string; teacher: string | null; color: string; created_at: string }
export interface Entry { id: string; subject_id: string; weekday: number; start_time: string; end_time: string; room: string | null }
export interface Task { id: string; subject_id: string | null; title: string; details: string | null; due_date: string; done: boolean }
export interface Exam { id: string; subject_id: string | null; title: string; exam_date: string; start_time: string | null; venue: string | null }
export interface Note { id: string; subject_id: string | null; title: string; body: string | null; updated_at: string }
export type EventKind = "holiday" | "event" | "meeting" | "other";
export interface PEvent { id: string; child_id: string | null; title: string; event_date: string; kind: EventKind; details: string | null }
export interface Child { id: string; full_name: string; gender: "male" | "female" | null; school_level: string | null; class_name: string | null; school_name: string | null }

export interface PlannerData { subjects: Subject[]; timetable_entries: Entry[]; tasks: Task[]; exams: Exam[]; notes: Note[]; events: PEvent[]; children: Child[] }
export type TableName = keyof PlannerData;
export const EMPTY_DATA: PlannerData = { subjects: [], timetable_entries: [], tasks: [], exams: [], notes: [], events: [], children: [] };

export const COLORS = ["#3B82F6", "#22A35A", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];
/** Light tint of a #RRGGBB colour, for icon backgrounds. */
export function tint(hex: string, alpha = 0.16): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/* ---------- dates (all local, as YYYY-MM-DD strings) ---------- */
const p2 = (n: number) => String(n).padStart(2, "0");
export const toKey = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
export const fromKey = (k: string) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
export const todayKey = () => toKey(new Date());
export const addDays = (k: string, n: number) => { const d = fromKey(k); d.setDate(d.getDate() + n); return toKey(d); };
export const daysUntil = (k: string) => Math.round((fromKey(k).getTime() - fromKey(todayKey()).getTime()) / 86400000);
/** ISO weekday: 1 = Monday … 7 = Sunday. */
export const isoWeekday = (d: Date) => (d.getDay() === 0 ? 7 : d.getDay());
export const hhmm = (t: string | null | undefined) => (t ? t.slice(0, 5) : "");
export const nowMinutes = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
export const toMinutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

export const WEEKDAYS: Array<{ n: number; en: string; ms: string; enShort: string; msShort: string }> = [
  { n: 1, en: "Monday", ms: "Isnin", enShort: "Mon", msShort: "Isn" },
  { n: 2, en: "Tuesday", ms: "Selasa", enShort: "Tue", msShort: "Sel" },
  { n: 3, en: "Wednesday", ms: "Rabu", enShort: "Wed", msShort: "Rab" },
  { n: 4, en: "Thursday", ms: "Khamis", enShort: "Thu", msShort: "Kha" },
  { n: 5, en: "Friday", ms: "Jumaat", enShort: "Fri", msShort: "Jum" },
  { n: 6, en: "Saturday", ms: "Sabtu", enShort: "Sat", msShort: "Sab" },
  { n: 7, en: "Sunday", ms: "Ahad", enShort: "Sun", msShort: "Ahd" },
];

/** "Today", "Tomorrow", "In 3 days", "2 days ago" … */
export function relativeDay(k: string, L: (en: string, ms: string) => string): string {
  const d = daysUntil(k);
  if (d === 0) return L("Today", "Hari ini");
  if (d === 1) return L("Tomorrow", "Esok");
  if (d === -1) return L("Yesterday", "Semalam");
  if (d > 1) return L(`In ${d} days`, `${d} hari lagi`);
  return L(`${-d} days ago`, `${-d} hari lepas`);
}
export function fmtDate(k: string, lang: Lang, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }): string {
  return fromKey(k).toLocaleDateString(lang === "ms" ? "ms-MY" : "en-GB", opts);
}

/** Pick an icon from a subject's name (works for English and Malay names). */
export function subjectIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (/math|matematik|add\s?math/.test(n)) return Calculator;
  if (/physic|fizik/.test(n)) return Atom;
  if (/chem|kimia|scien|sains|biolog/.test(n)) return FlaskConical;
  if (/history|sejarah|geograf|geograph/.test(n)) return Globe;
  if (/islam|moral|agama|pai\b|pendidikan islam/.test(n)) return Landmark;
  if (/english|inggeris|bahasa|melayu|arab|cina|tamil|language/.test(n)) return Languages;
  if (/comput|komputer|ict|rbt|reka bentuk/.test(n)) return Monitor;
  if (/music|muzik/.test(n)) return Music;
  if (/art|seni|lukis/.test(n)) return Palette;
  if (/physical|jasmani|pj|sport|sukan|kesihatan|health/.test(n)) return Dumbbell;
  if (/alam|environment|nature/.test(n)) return Leaf;
  return BookOpen;
}

export function starterSubjects(role: Role, lang: Lang): Array<{ name: string; color: string }> {
  const ms = lang === "ms";
  const base = role === "secondary_student"
    ? [ms ? "Bahasa Melayu" : "Malay Language", ms ? "Bahasa Inggeris" : "English", ms ? "Matematik" : "Mathematics", ms ? "Sains" : "Science", ms ? "Sejarah" : "History", ms ? "Geografi" : "Geography", ms ? "Pendidikan Islam" : "Islamic Education", ms ? "Pendidikan Jasmani" : "Physical Education"]
    : [ms ? "Bahasa Melayu" : "Malay Language", ms ? "Bahasa Inggeris" : "English", ms ? "Matematik" : "Mathematics", ms ? "Sains" : "Science", ms ? "Pendidikan Islam" : "Islamic Education", ms ? "Pendidikan Jasmani" : "Physical Education", ms ? "Pendidikan Seni" : "Art", ms ? "Pendidikan Muzik" : "Music"];
  return base.map((name, i) => ({ name, color: COLORS[i % COLORS.length] }));
}

export const EVENT_KINDS: Array<{ id: EventKind; en: string; ms: string; color: string }> = [
  { id: "holiday", en: "Holiday", ms: "Cuti", color: "#22A35A" },
  { id: "event", en: "School event", ms: "Acara sekolah", color: "#3B82F6" },
  { id: "meeting", en: "Meeting", ms: "Mesyuarat", color: "#8B5CF6" },
  { id: "other", en: "Other", ms: "Lain-lain", color: "#F59E0B" },
];
