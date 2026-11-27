import { supabase } from "@/lib/supabase";
import { EMPTY_DATA, type PlannerData, type TableName } from "@/lib/planner";

const TABLES = Object.keys(EMPTY_DATA) as TableName[];

/** Load every planner table for the signed-in user (RLS returns only their own rows). */
export async function loadPlanner(): Promise<PlannerData> {
  const results = await Promise.all(TABLES.map((t) => supabase.from(t).select("*")));
  const out: Record<string, unknown[]> = {};
  results.forEach((r, i) => {
    if (r.error) throw r.error;
    out[TABLES[i]] = (r.data as unknown[]) ?? [];
  });
  return out as unknown as PlannerData;
}

export async function insertRow<T>(table: TableName, row: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.from(table).insert(row).select("*").single();
  if (error) throw error;
  return data as T;
}

export async function insertRows<T>(table: TableName, rows: Array<Record<string, unknown>>): Promise<T[]> {
  const { data, error } = await supabase.from(table).insert(rows).select("*");
  if (error) throw error;
  return (data as T[]) ?? [];
}

export async function updateRow<T>(table: TableName, id: string, patch: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.from(table).update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data as T;
}

export async function deleteRow(table: TableName, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}
