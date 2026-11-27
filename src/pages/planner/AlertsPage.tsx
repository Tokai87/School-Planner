import { useNavigate } from "react-router-dom";
import { BellRing, CalendarDays, ChevronRight, ClipboardList, FileText } from "lucide-react";
import { Empty, LoadGate, PageHeader, PageShell } from "@/components/planner/ui";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { usePlanner } from "@/hooks/usePlanner";
import { useLinkedChildren } from "@/hooks/useLinkedChildren";
import { asPlanner } from "@/services/linkService";
import { daysUntil, EVENT_KINDS, fmtDate, relativeDay, tint, type PlannerData } from "@/lib/planner";
import type { LucideIcon } from "lucide-react";

interface Alert { key: string; icon: LucideIcon; color: string; title: string; sub: string; to: string; days: number }

export function buildAlerts(data: PlannerData, student: boolean, L: (en: string, ms: string) => string, fmt: (k: string) => string): Alert[] {
  const out: Alert[] = [];
  if (student) {
    for (const t of data.tasks) {
      const d = daysUntil(t.due_date);
      if (!t.done && d <= 3) out.push({ key: `t${t.id}`, icon: ClipboardList, color: d < 0 ? "#EF4444" : "#F59E0B", title: t.title, sub: `${d < 0 ? L("Overdue", "Lewat") : L("Homework due", "Kerja sekolah akhir")} · ${relativeDay(t.due_date, L)}`, to: "/tasks", days: d });
    }
    for (const x of data.exams) {
      const d = daysUntil(x.exam_date);
      if (d >= 0 && d <= 14) out.push({ key: `x${x.id}`, icon: FileText, color: "#EF4444", title: x.title, sub: `${L("Exam", "Peperiksaan")} · ${relativeDay(x.exam_date, L)} · ${fmt(x.exam_date)}`, to: "/exams", days: d });
    }
  }
  for (const e of data.events) {
    const d = daysUntil(e.event_date);
    if (d >= 0 && d <= (student ? 14 : 30)) {
      const kind = EVENT_KINDS.find((k) => k.id === e.kind)!;
      out.push({ key: `e${e.id}`, icon: CalendarDays, color: kind.color, title: e.title, sub: `${L(kind.en, kind.ms)} · ${relativeDay(e.event_date, L)} · ${fmt(e.event_date)}`, to: "/calendar", days: d });
    }
  }
  return out.sort((a, b) => a.days - b.days);
}

export default function AlertsPage() {
  const { L, lang } = useLang();
  const { profile } = useAuth();
  const { data } = usePlanner();
  const navigate = useNavigate();
  const parent = profile?.role === "parent";
  const linked = useLinkedChildren(parent);
  const own = buildAlerts(data, !parent, L, (k) => fmtDate(k, lang));
  const theirs = linked.kids.flatMap(({ info, snap }) =>
    buildAlerts(asPlanner(snap), true, L, (k) => fmtDate(k, lang)).map((a) => ({ ...a, key: `${info.child_id}${a.key}`, title: `${info.full_name.split(" ")[0]}: ${a.title}`, to: `/children/linked/${info.child_id}` })));
  const items = [...own, ...theirs].sort((a, b) => a.days - b.days);
  return (
    <PageShell>
      <PageHeader title={L("Alerts", "Notifikasi")} sub={items.length ? L(`${items.length} need your attention`, `${items.length} perlukan perhatian`) : undefined} />
      <LoadGate>
        {items.length === 0 ? (
          <Empty icon={BellRing} title={L("You're all caught up", "Anda sudah terkini")} text={L("Overdue homework, upcoming exams and school events will show up here.", "Kerja sekolah lewat, peperiksaan dan acara sekolah akan muncul di sini.")} />
        ) : (
          items.map((a) => (
            <button key={a.key} type="button" className="pl-row" onClick={() => navigate(a.to)}>
              <span className="pl-ic" style={{ background: tint(a.color), color: a.color }}><a.icon size={22} aria-hidden="true" /></span>
              <span className="pl-tx"><b>{a.title}</b><small>{a.sub}</small></span>
              <ChevronRight size={18} aria-hidden="true" className="pl-cv" />
            </button>
          ))
        )}
      </LoadGate>
    </PageShell>
  );
}
