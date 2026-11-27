import { useMemo, type ReactNode } from "react";
import { PlannerContext, usePlanner, type PlannerContextValue } from "@/hooks/usePlanner";
import { scopeToChild, type TableName } from "@/lib/planner";

const SCOPED: TableName[] = ["subjects", "timetable_entries", "tasks", "exams"];

/**
 * Narrows the planner context to one child record: screens and forms below it see only that
 * child's subjects, timetable, homework and exams, and anything they create is stamped with child_id.
 */
export function ChildScope({ childId, children }: { childId: string; children: ReactNode }) {
  const base = usePlanner();
  const value = useMemo<PlannerContextValue>(() => {
    const stamp = (t: TableName, row: Record<string, unknown>) => (SCOPED.includes(t) ? { ...row, child_id: childId } : row);
    return {
      ...base,
      data: { ...base.data, ...scopeToChild(base.data, childId), notes: base.data.notes, events: base.data.events, children: base.data.children },
      add: (t, row) => base.add(t, stamp(t, row)),
      addMany: (t, rows) => base.addMany(t, rows.map((r) => stamp(t, r))),
    };
  }, [base, childId]);
  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}
