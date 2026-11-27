import { useState } from "react";
import { Check, ChevronRight, Plus, Sparkles } from "lucide-react";
import { Empty, Sheet, useAction } from "@/components/planner/ui";
import { EntryForm } from "@/pages/planner/TimetablePage";
import { TaskForm } from "@/pages/planner/TasksPage";
import { ExamForm } from "@/pages/planner/ExamsPage";
import { SubjectForm } from "@/pages/planner/SubjectsPage";
import { useLang } from "@/hooks/useLang";
import { usePlanner } from "@/hooks/usePlanner";
import { WEEKDAYS, daysUntil, fmtDate, hhmm, isoWeekday, relativeDay, starterSubjects, subjectIcon, tint, type Entry, type Exam, type PlannerData, type Subject, type Task } from "@/lib/planner";

type Tab = "timetable" | "homework" | "exams" | "subjects";
type Editing = { kind: "entry"; v: Entry | null } | { kind: "task"; v: Task | null } | { kind: "exam"; v: Exam | null } | { kind: "subject"; v: Subject | null } | null;

/**
 * Timetable / Homework / Exams (+ Subjects when editable) for one planner.
 * Read-only for a linked student's snapshot; editable for a child record kept by a parent
 * (render it inside <ChildScope> so the forms read and write that child's rows).
 */
export default function PlannerView({ data, editable, secondary }: { data: PlannerData; editable: boolean; secondary?: boolean }) {
  const { L, lang } = useLang();
  const { edit, addMany } = usePlanner();
  const [tab, setTab] = useState<Tab>("timetable");
  const [day, setDay] = useState(isoWeekday(new Date()));
  const [editing, setEditing] = useState<Editing>(null);
  const act = useAction();

  const subj = new Map(data.subjects.map((s) => [s.id, s]));
  const today = isoWeekday(new Date());
  const rows = data.timetable_entries.filter((e) => e.weekday === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
  const todo = data.tasks.filter((t) => !t.done).sort((a, b) => a.due_date.localeCompare(b.due_date));
  const done = data.tasks.filter((t) => t.done);
  const exams = data.exams.filter((x) => daysUntil(x.exam_date) >= 0).sort((a, b) => a.exam_date.localeCompare(b.exam_date));
  const tabs: Array<[Tab, string]> = [
    ["timetable", L("Timetable", "Jadual")],
    ["homework", editable ? L("Homework", "Kerja") : `${L("Homework", "Kerja")} (${todo.length})`],
    ["exams", editable ? L("Exams", "Exam") : `${L("Exams", "Exam")} (${exams.length})`],
    ...(editable ? [["subjects", L("Subjects", "Subjek")] as [Tab, string]] : []),
  ];

  const AddBtn = ({ label, onClick }: { label: string; onClick: () => void }) =>
    editable ? <button type="button" className="pl-btn pl-pri pl-wide pl-addrow" onClick={onClick}><Plus size={18} aria-hidden="true" /> {label}</button> : null;
  const rowProps = (open: () => void) => (editable ? { onClick: open } : { style: { cursor: "default" } as const });
  const close = () => setEditing(null);
  const needSubjects = editable && data.subjects.length === 0;
  const goSubjects = (
    <Empty icon={Sparkles} title={L("Add subjects first", "Tambah subjek dahulu")} text={L("Classes, homework and exams are linked to subjects.", "Kelas, kerja sekolah dan peperiksaan dikaitkan dengan subjek.")}>
      <button type="button" className="pl-btn pl-pri" onClick={() => setTab("subjects")}>{L("Go to Subjects", "Ke Subjek")}</button>
    </Empty>
  );

  return (
    <>
      <div className={`pl-seg ${tabs.length === 4 ? "pl-seg4" : "pl-seg3"}`} role="tablist">
        {tabs.map(([k, label]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{label}</button>)}
      </div>

      {tab === "timetable" && (
        <>
          <div className="pl-days" role="tablist">
            {WEEKDAYS.map((w) => (
              <button key={w.n} type="button" role="tab" aria-selected={day === w.n} className={w.n === today ? "td" : undefined} onClick={() => setDay(w.n)}>
                {lang === "ms" ? w.msShort : w.enShort}
                <i style={{ opacity: data.timetable_entries.some((e) => e.weekday === w.n) ? 1 : 0 }} />
              </button>
            ))}
          </div>
          {needSubjects ? goSubjects : (
            <>
              <AddBtn label={L("Add a class", "Tambah kelas")} onClick={() => setEditing({ kind: "entry", v: null })} />
              {rows.length === 0 ? (
                <Empty icon={ChevronRight} title={data.timetable_entries.length ? L("No classes on this day", "Tiada kelas pada hari ini") : L("No timetable yet", "Belum ada jadual")} text={!editable && !data.timetable_entries.length ? L("Your child hasn't added their classes yet.", "Anak anda belum menambah kelas.") : undefined} />
              ) : rows.map((e) => {
                const s = subj.get(e.subject_id);
                const Icon = subjectIcon(s?.name ?? "");
                const c = s?.color ?? "#3B82F6";
                return (
                  <button key={e.id} type="button" className="pl-row tm" {...rowProps(() => setEditing({ kind: "entry", v: e }))}>
                    <span className="pl-time"><b>{hhmm(e.start_time)}</b>{hhmm(e.end_time)}</span>
                    <span className="pl-ic" style={{ background: tint(c), color: c }}><Icon size={22} aria-hidden="true" /></span>
                    <span className="pl-tx"><b>{s?.name ?? "—"}</b><small>{[s?.teacher, e.room && L(`Room ${e.room}`, `Bilik ${e.room}`)].filter(Boolean).join(" · ") || " "}</small></span>
                    {editable && <ChevronRight size={18} aria-hidden="true" className="pl-cv" />}
                  </button>
                );
              })}
            </>
          )}
        </>
      )}

      {tab === "homework" && (
        needSubjects ? goSubjects : (
          <>
            <AddBtn label={L("Add homework", "Tambah kerja sekolah")} onClick={() => setEditing({ kind: "task", v: null })} />
            {act.error && <p className="pl-err" role="alert">{act.error}</p>}
            {todo.length + done.length === 0 ? <Empty icon={ChevronRight} title={L("No homework yet", "Belum ada kerja sekolah")} /> : (
              <>
                {todo.map(taskRow)}
                {done.length > 0 && <h2 className="pl-h2">{L(`Done (${done.length})`, `Siap (${done.length})`)}</h2>}
                {done.map(taskRow)}
              </>
            )}
          </>
        )
      )}

      {tab === "exams" && (
        needSubjects ? goSubjects : (
          <>
            <AddBtn label={L("Add an exam", "Tambah peperiksaan")} onClick={() => setEditing({ kind: "exam", v: null })} />
            {exams.length === 0 ? <Empty icon={ChevronRight} title={L("No upcoming exams", "Tiada peperiksaan akan datang")} /> : exams.map((x) => {
              const s = x.subject_id ? subj.get(x.subject_id) : undefined;
              const left = daysUntil(x.exam_date);
              return (
                <button key={x.id} type="button" className="pl-row" {...rowProps(() => setEditing({ kind: "exam", v: x }))}>
                  <span className="pl-tx"><b>{x.title}</b><small>{s && <span className="pl-chip" style={{ background: tint(s.color), color: s.color }}>{s.name}</span>} {[x.start_time && hhmm(x.start_time), x.venue].filter(Boolean).join(" · ")}</small></span>
                  <span className={`pl-cd${left <= 7 ? " hot" : ""}`}>{relativeDay(x.exam_date, L)}</span>
                </button>
              );
            })}
          </>
        )
      )}

      {tab === "subjects" && editable && (
        <>
          {data.subjects.length === 0 && (
            <button type="button" className="pl-btn pl-pri pl-wide pl-addrow" disabled={act.busy} onClick={() => void act.run(() => addMany("subjects", starterSubjects(secondary ? "secondary_student" : "primary_student", lang)))}>
              <Sparkles size={18} aria-hidden="true" /> {L("Add common subjects", "Tambah subjek biasa")}
            </button>
          )}
          <AddBtn label={L("Add a subject", "Tambah subjek")} onClick={() => setEditing({ kind: "subject", v: null })} />
          {act.error && <p className="pl-err" role="alert">{act.error}</p>}
          {data.subjects.map((s) => {
            const Icon = subjectIcon(s.name);
            const n = data.timetable_entries.filter((e) => e.subject_id === s.id).length;
            return (
              <button key={s.id} type="button" className="pl-row" onClick={() => setEditing({ kind: "subject", v: s })}>
                <span className="pl-ic" style={{ background: tint(s.color), color: s.color }}><Icon size={22} aria-hidden="true" /></span>
                <span className="pl-tx"><b>{s.name}</b><small>{[s.teacher, n ? L(`${n} ${n === 1 ? "class" : "classes"} / week`, `${n} kelas / minggu`) : L("Not in timetable", "Tiada dalam jadual")].filter(Boolean).join(" · ")}</small></span>
                <ChevronRight size={18} aria-hidden="true" className="pl-cv" />
              </button>
            );
          })}
        </>
      )}

      {editable && (
        <Sheet open={editing !== null} onClose={close} title={editing ? sheetTitle(editing, L) : ""}>
          {editing?.kind === "entry" && <EntryForm initial={editing.v} day={day} onClose={close} />}
          {editing?.kind === "task" && <TaskForm initial={editing.v} onClose={close} />}
          {editing?.kind === "exam" && <ExamForm initial={editing.v} onClose={close} />}
          {editing?.kind === "subject" && <SubjectForm initial={editing.v} onClose={close} />}
        </Sheet>
      )}
    </>
  );

  function taskRow(t: Task) {
    const s = t.subject_id ? subj.get(t.subject_id) : undefined;
    const late = daysUntil(t.due_date) < 0 && !t.done;
    return (
      <div key={t.id} className={`pl-row tk${t.done ? " dn" : ""}`} style={editable ? undefined : { cursor: "default" }}>
        {editable && (
          <button type="button" className="pl-ck" role="checkbox" aria-checked={t.done} aria-label={t.done ? L("Mark as not done", "Tandakan belum siap") : L("Mark as done", "Tandakan siap")} disabled={act.busy} onClick={() => void act.run(() => edit("tasks", t.id, { done: !t.done }))}>
            {t.done && <Check size={18} aria-hidden="true" />}
          </button>
        )}
        <button type="button" className="pl-tx" disabled={!editable} style={editable ? undefined : { cursor: "default" }} onClick={() => setEditing({ kind: "task", v: t })}>
          <b>{t.title}</b>
          <small>{s && <span className="pl-chip" style={{ background: tint(s.color), color: s.color }}>{s.name}</span>} <span className={late ? "late" : undefined}>{t.done ? fmtDate(t.due_date, lang) : `${relativeDay(t.due_date, L)} · ${fmtDate(t.due_date, lang)}`}</span></small>
        </button>
      </div>
    );
  }
}

function sheetTitle(e: NonNullable<Editing>, L: (en: string, ms: string) => string): string {
  const n = e.v === null;
  if (e.kind === "entry") return n ? L("New class", "Kelas baharu") : L("Edit class", "Ubah kelas");
  if (e.kind === "task") return n ? L("New homework", "Kerja sekolah baharu") : L("Edit homework", "Ubah kerja sekolah");
  if (e.kind === "exam") return n ? L("New exam", "Peperiksaan baharu") : L("Edit exam", "Ubah peperiksaan");
  return n ? L("New subject", "Subjek baharu") : L("Edit subject", "Ubah subjek");
}
