import { useCallback, useEffect, useState } from "react";
import { childSnapshot, listLinkedChildren, type ChildSnapshot, type LinkedChild } from "@/services/linkService";
import { logError } from "@/lib/errors";

export interface LinkedKid { info: LinkedChild; snap: ChildSnapshot }

/** Parent only: linked student accounts plus a read-only snapshot of each one's planner. */
export function useLinkedChildren(enabled = true) {
  const [kids, setKids] = useState<LinkedKid[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(enabled ? "loading" : "ready");

  const reload = useCallback(async () => {
    if (!enabled) return;
    try {
      const list = await listLinkedChildren();
      const snaps = await Promise.all(list.map((c) => childSnapshot(c.child_id)));
      setKids(list.map((info, i) => ({ info, snap: snaps[i] })));
      setStatus("ready");
    } catch (e) {
      logError("link.load", e);
      setStatus("error");
    }
  }, [enabled]);

  useEffect(() => { void reload(); }, [reload]);
  return { kids, status, reload };
}
