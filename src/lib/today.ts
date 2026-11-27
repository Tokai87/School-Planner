import { buildAlerts } from "@/pages/planner/AlertsPage";
import { addDays, daysUntil, isoWeekday, todayKey, toMinutes, fromKey, type Entry, type Exam, type PlannerData, type Subject, type Task } from "@/lib/planner";

/** True when there is anything worth a red dot on the bell. */
export function hasAlerts(data: PlannerData, student: boolean): boolean {
  return buildAlerts(data, student, (en) => en, (k) => k).length > 0;
}

export interface TodayRow { entry: Entry; subject: Subject | undefined; now: boolean }

export function todayRows(data: PlannerData, date = new Date()): TodayRow[] {
  const wd = isoWeekday(date);
  const mins = date.getHours() * 60 + date.getMinutes();
  return data.timetable_entries
    .filter((e) => e.weekday === wd)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .map((entry) => ({
      entry,
      subject: data.subjects.find((s) => s.id === entry.subject_id),
      now: mins >= toMinutes(entry.start_time) && mins < toMinutes(entry.end_time),
    }));
}

/** Distinct subjects taught tomorrow, for the "school bag" card. */
export function tomorrowSubjects(data: PlannerData): Subject[] {
  const wd = isoWeekday(fromKey(addDays(todayKey(), 1)));
  const seen = new Set<string>();
  const out: Subject[] = [];
  for (const e of [...data.timetable_entries].filter((x) => x.weekday === wd).sort((a, b) => a.start_time.localeCompare(b.start_time))) {
    const s = data.subjects.find((x) => x.id === e.subject_id);
    if (s && !seen.has(s.id)) { seen.add(s.id); out.push(s); }
  }
  return out;
}

export const pendingTasks = (data: PlannerData): Task[] => data.tasks.filter((t) => !t.done);
export const dueTodayTasks = (data: PlannerData): Task[] => data.tasks.filter((t) => !t.done && daysUntil(t.due_date) <= 0);
export const upcomingExams = (data: PlannerData): Exam[] =>
  data.exams.filter((x) => daysUntil(x.exam_date) >= 0).sort((a, b) => a.exam_date.localeCompare(b.exam_date));

/** Share of homework marked done among tasks due within the current ISO week (falls back to all tasks). */
export function weekProgress(data: PlannerData): number | null {
  const start = addDays(todayKey(), -(isoWeekday(new Date()) - 1));
  const end = addDays(start, 6);
  const week = data.tasks.filter((t) => t.due_date >= start && t.due_date <= end);
  const pool = week.length ? week : data.tasks;
  if (!pool.length) return null;
  return Math.round((pool.filter((t) => t.done).length / pool.length) * 100);
}

