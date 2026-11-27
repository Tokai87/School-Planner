import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { PlannerContext, type PlannerContextValue } from "@/hooks/usePlanner";
import { useAuth } from "@/hooks/useAuth";
import { EMPTY_DATA, type PlannerData, type TableName } from "@/lib/planner";
import { logError } from "@/lib/errors";
import { deleteRow, insertRow, insertRows, loadPlanner, updateRow } from "@/services/plannerService";

/** Holds the signed-in user's planner data (small, so it is loaded once and shared by every screen). */
export function PlannerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [data, setData] = useState<PlannerData>(EMPTY_DATA);
  const [status, setStatus] = useState<PlannerContextValue["status"]>("loading");

  const reload = useCallback(async () => {
    try {
      setData(await loadPlanner());
      setStatus("ready");
    } catch (e) {
      logError("planner.load", e);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    setStatus("loading");
    setData(EMPTY_DATA);
    void reload();
  }, [userId, reload]);

  const add = useCallback(async <T,>(table: TableName, row: Record<string, unknown>) => {
    const created = await insertRow<T>(table, row);
    setData((d) => ({ ...d, [table]: [...(d[table] as unknown[]), created] }) as PlannerData);
    return created;
  }, []);

  const addMany = useCallback(async <T,>(table: TableName, rows: Array<Record<string, unknown>>) => {
    const created = await insertRows<T>(table, rows);
    setData((d) => ({ ...d, [table]: [...(d[table] as unknown[]), ...created] }) as PlannerData);
    return created;
  }, []);

  const edit = useCallback(async <T extends { id: string },>(table: TableName, id: string, patch: Record<string, unknown>) => {
    const updated = await updateRow<T>(table, id, patch);
    setData((d) => ({ ...d, [table]: (d[table] as Array<{ id: string }>).map((r) => (r.id === id ? updated : r)) }) as PlannerData);
    return updated;
  }, []);

  const remove = useCallback(async (table: TableName, id: string) => {
    await deleteRow(table, id);
    setData((d) => {
      const next = { ...d, [table]: (d[table] as Array<{ id: string }>).filter((r) => r.id !== id) } as PlannerData;
      // Mirror the database cascade / set-null rules so the UI never shows orphans.
      if (table === "subjects") {
        next.timetable_entries = d.timetable_entries.filter((e) => e.subject_id !== id);
        next.tasks = d.tasks.map((t) => (t.subject_id === id ? { ...t, subject_id: null } : t));
        next.exams = d.exams.map((x) => (x.subject_id === id ? { ...x, subject_id: null } : x));
        next.notes = d.notes.map((n) => (n.subject_id === id ? { ...n, subject_id: null } : n));
      }
      if (table === "children") {
        next.events = d.events.map((e) => (e.child_id === id ? { ...e, child_id: null } : e));
        next.subjects = d.subjects.filter((x) => x.child_id !== id);
        next.timetable_entries = d.timetable_entries.filter((x) => x.child_id !== id);
        next.tasks = d.tasks.filter((x) => x.child_id !== id);
        next.exams = d.exams.filter((x) => x.child_id !== id);
      }
      return next;
    });
  }, []);

  const value = useMemo<PlannerContextValue>(() => ({ data, status, reload, add, addMany, edit: edit as PlannerContextValue["edit"], remove }), [data, status, reload, add, addMany, edit, remove]);
  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}
