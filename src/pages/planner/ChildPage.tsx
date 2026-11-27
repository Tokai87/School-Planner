import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { ChildScope } from "@/components/planner/ChildScope";
import PlannerView from "@/components/planner/PlannerView";
import { LoadGate, PageHeader, PageShell, Sheet } from "@/components/planner/ui";
import { useLang } from "@/hooks/useLang";
import { usePlanner } from "@/hooks/usePlanner";
import { isPrimaryLevel, scopeToChild } from "@/lib/planner";
import { ChildForm } from "./ChildrenPage";

/** A child kept by hand: the parent fills in that child's subjects, timetable, homework and exams. */
export default function ChildPage() {
  const { id } = useParams();
  const { L, level } = useLang();
  const { data, status } = usePlanner();
  const [editing, setEditing] = useState(false);
  const child = data.children.find((c) => c.id === id);
  if (status === "ready" && !child) return <Navigate to="/children" replace />;
  if (!child) return <PageShell><PageHeader title="…" back="/children" /><LoadGate>{null}</LoadGate></PageShell>;
  const sub = [child.school_level && level(child.school_level), child.class_name, child.school_name].filter(Boolean).join(" · ");

  return (
    <PageShell>
      <PageHeader title={child.full_name} sub={sub || undefined} back="/children" />
      <button type="button" className="pl-btn pl-gh pl-wide pl-addrow" onClick={() => setEditing(true)}><Pencil size={16} aria-hidden="true" /> {L("Edit details", "Ubah butiran")}</button>
      <ChildScope childId={child.id}>
        <PlannerView data={scopeToChild(data, child.id)} editable secondary={!isPrimaryLevel(child.school_level)} />
      </ChildScope>
      <Sheet open={editing} onClose={() => setEditing(false)} title={L("Edit child", "Ubah butiran anak")}>
        {editing && <ChildForm initial={child} onClose={() => setEditing(false)} />}
      </Sheet>
    </PageShell>
  );
}
