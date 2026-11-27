import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Link2Off } from "lucide-react";
import PlannerView from "@/components/planner/PlannerView";
import { PageHeader, PageShell, useAction } from "@/components/planner/ui";
import { Spinner } from "@/components/ui/Spinner";
import { useLang } from "@/hooks/useLang";
import { useLinkedChildren } from "@/hooks/useLinkedChildren";
import { asPlanner, unlink } from "@/services/linkService";

/** Read-only view of a linked student's timetable, homework and exams. */
export default function LinkedChildPage() {
  const { id } = useParams();
  const { L, level } = useLang();
  const navigate = useNavigate();
  const { kids, status } = useLinkedChildren();
  const [confirm, setConfirm] = useState(false);
  const rm = useAction();

  if (status === "loading") return <PageShell><div className="pl-load"><Spinner /></div></PageShell>;
  const kid = kids.find((k) => k.info.child_id === id);
  if (!kid) return <Navigate to="/children" replace />;
  const sub = [kid.info.school_level && level(kid.info.school_level), kid.info.class_name, kid.info.school_name].filter(Boolean).join(" · ");

  return (
    <PageShell>
      <PageHeader title={kid.info.full_name} sub={sub || undefined} back="/children" />
      <p className="pl-ro">{L("View only. Your child manages their own planner.", "Lihat sahaja. Anak anda menguruskan perancangnya sendiri.")}</p>
      <PlannerView data={asPlanner(kid.snap)} editable={false} />
      <div style={{ marginTop: 22 }}>
        {rm.error && <p className="pl-err" role="alert">{rm.error}</p>}
        {confirm ? (
          <button type="button" className="pl-btn pl-dng pl-wide" disabled={rm.busy} onClick={() => void rm.run(() => unlink(kid.info.link_id), () => navigate("/children", { replace: true }))}>{L("Confirm: stop following", "Sahkan: berhenti ikuti")}</button>
        ) : (
          <button type="button" className="pl-btn pl-gh pl-wide" onClick={() => setConfirm(true)}><Link2Off size={18} aria-hidden="true" /> {L("Unlink this account", "Nyahpaut akaun ini")}</button>
        )}
      </div>
    </PageShell>
  );
}
