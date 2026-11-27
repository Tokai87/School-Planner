import { createContext, useContext } from "react";
import type { PlannerData, TableName } from "@/lib/planner";

export interface PlannerContextValue {
  data: PlannerData;
  status: "loading" | "ready" | "error";
  reload: () => Promise<void>;
  add: <T>(table: TableName, row: Record<string, unknown>) => Promise<T>;
  addMany: <T>(table: TableName, rows: Array<Record<string, unknown>>) => Promise<T[]>;
  edit: <T>(table: TableName, id: string, patch: Record<string, unknown>) => Promise<T>;
  remove: (table: TableName, id: string) => Promise<void>;
}

export const PlannerContext = createContext<PlannerContextValue | null>(null);

export function usePlanner(): PlannerContextValue {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be used inside <PlannerProvider>");
  return ctx;
}
