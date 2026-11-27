import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Link2Off } from "lucide-react";
import { Empty, PageHeader, PageShell, useAction } from "@/components/planner/ui";
import { Spinner } from "@/components/ui/Spinner";
import { useLang } from "@/hooks/useLang";
import { useLinkedChildren } from "@/hooks/useLinkedChildren";
import { asPlanner, unlink } from "@/services/linkService";
import { WEEKDAYS, daysUntil, fmtDate, hhmm, isoWeekday, relativeDay, subjectIcon, tint } from "@/lib/planner";

type Tab = "timetable" | "homework" | "exams";

/** Read-only view of a linked student's timetable, homework and exams. */
export default function LinkedChildPage() {
  const { id } = useParams();
  const { L, lang, level } = useLang();
  const navigate = useNavigate();
  const { kids, status } = useLinkedChildren();
  const [tab, setTab] = useState<Tab>("timetable");
  const [day, setDay] = useState(isoWeekday(new Date()));
  const [confirm, setConfirm] = useState(false);
  const rm = useAction();

  if (status === "loading") return <PageShell><div className="pl-load"><Spinner /></div></PageShell>;
  const kid = kids.find((k) => k.info.child_id === id);
  if (!kid) return <Navigate to="/children" replace />;
  const d = asPlanner(kid.snap);
  const subj = new Map(d.subjects.map((s) => [s.id, s]));
  const today = isoWeekday(new Date());
  const rows = d.timetable_entries.filter((e) => e.weekday === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
  const todo = d.tasks.filter((t) => !t.done).sort((a, b) => a.due_date.localeCompare(b.due_date));
  const done = d.tasks.filter((t) => t.done);
  const exams = d.exams.filter((x) => daysUntil(x.exam_date) >= 0).sort((a, b) => a.exam_date.localeCompare(b.exam_date));
  const sub = [kid.info.school_level && level(kid.info.school_level), kid.info.class_name, kid.info.school_name].filter(Boolean).join(" · ");

  return (
    <PageShell>
      <PageHeader title={kid.info.full_name} sub={sub || undefined} back="/children" />
      <p className="pl-ro">{L("View only. Your child manages their own planner.", "Lihat sahaja. Anak anda menguruskan perancangnya sendiri.")}</p>
      <div className="pl-seg pl-seg3" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "timetable"} onClick={() => setTab("timetable")}>{L("Timetable", "Jadual")}</button>
        <button type="button" role="tab" aria-selected={tab === "homework"} onClick={() => setTab("homework")}>{L("Homework", "Kerja")} ({todo.length})</button>
        <button type="button" role="tab" aria-selected={tab === "exams"} onClick={() => setTab("exams")}>{L("Exams", "Exam")} ({exams.length})</button>
      </div>

      {tab === "timetable" && (
        <>
          <div className="pl-days" role="tablist">
            {WEEKDAYS.map((w) => (
              <button key={w.n} type="button" role="tab" aria-selected={day === w.n} className={w.n === today ? "td" : undefined} onClick={() => setDay(w.n)}>
                {lang === "ms" ? w.msShort : w.enShort}
                <i style={{ opacity: d.timetable_entries.some((e) => e.weekday === w.n) ? 1 : 0 }} />
              </button>
            ))}
          </div>
          {rows.length === 0 ? (
            <Empty icon={ChevronRight} title={d.timetable_entries.length ? L("No classes on this day", "Tiada kelas pada hari ini") : L("No timetable yet", "Belum ada jadual")} text={d.timetable_entries.length ? undefined : L("Your child hasn't added their classes yet.", "Anak anda belum menambah kelas.")} />
          ) : rows.map((e) => {
            const s = subj.get(e.subject_id);
            const Icon = subjectIcon(s?.name ?? "");
            const c = s?.color ?? "#3B82F6";
            return (
              <div key={e.id} className="pl-row tm" style={{ cursor: "default" }}>
                <span className="pl-time"><b>{hhmm(e.start_time)}</b>{hhmm(e.end_time)}</span>
                <span className="pl-ic" style={{ background: tint(c), color: c }}><Icon size={22} aria-hidden="true" /></span>
                <span className="pl-tx"><b>{s?.name ?? "—"}</b><small>{[s?.teacher, e.room && L(`Room ${e.room}`, `Bilik ${e.room}`)].filter(Boolean).join(" · ") || " "}</small></span>
              </div>
            );
          })}
        </>
      )}

      {tab === "homework" && (
        todo.length + done.length === 0 ? (
          <Empty icon={ChevronRight} title={L("No homework yet", "Belum ada kerja sekolah")} />
        ) : (
          <>
            {todo.map((t) => {
              const s = t.subject_id ? subj.get(t.subject_id) : undefined;
              const late = daysUntil(t.due_date) < 0;
              return (
                <div key={t.id} className="pl-row" style={{ cursor: "default" }}>
                  <span className="pl-tx"><b>{t.title}</b><small>{s && <span className="pl-chip" style={{ background: tint(s.color), color: s.color }}>{s.name}</span>} <span className={late ? "late" : undefined}>{relativeDay(t.due_date, L)} · {fmtDate(t.due_date, lang)}</span></small></span>
                </div>
              );
            })}
            {done.length > 0 && <h2 className="pl-h2">{L(`Done (${done.length})`, `Siap (${done.length})`)}</h2>}
            {done.map((t) => (
              <div key={t.id} className="pl-row tk dn" style={{ cursor: "default" }}>
                <span className="pl-tx"><b>{t.title}</b><small>{fmtDate(t.due_date, lang)}</small></span>
              </div>
            ))}
          </>
        )
      )}

      {tab === "exams" && (
        exams.length === 0 ? (
          <Empty icon={ChevronRight} title={L("No upcoming exams", "Tiada peperiksaan akan datang")} />
        ) : exams.map((x) => {
          const s = x.subject_id ? subj.get(x.subject_id) : undefined;
          const left = daysUntil(x.exam_date);
          return (
            <div key={x.id} className="pl-row" style={{ cursor: "default" }}>
              <span className="pl-tx"><b>{x.title}</b><small>{s && <span className="pl-chip" style={{ background: tint(s.color), color: s.color }}>{s.name}</span>} {[x.start_time && hhmm(x.start_time), x.venue].filter(Boolean).join(" · ")}</small></span>
              <span className={`pl-cd${left <= 7 ? " hot" : ""}`}>{relativeDay(x.exam_date, L)}</span>
            </div>
          );
        })
      )}

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
