import { useMemo, useState, type FormEvent } from "react";
import { Check, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { Empty, Field, FormFooter, LoadGate, PageHeader, PageShell, Sheet, SubjectChip, SubjectSelect, subjectMap, useAction, useOpenOnNew } from "@/components/planner/ui";
import { useLang } from "@/hooks/useLang";
import { usePlanner } from "@/hooks/usePlanner";
import { addDays, daysUntil, fmtDate, relativeDay, todayKey, type Task } from "@/lib/planner";

export function TaskForm({ initial, onClose }: { initial: Task | null; onClose: () => void }) {
  const { L } = useLang();
  const { data, add, edit, remove } = usePlanner();
  const { busy, error, run, setError } = useAction();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [details, setDetails] = useState(initial?.details ?? "");
  const [subject, setSubject] = useState(initial?.subject_id ?? "");
  const [due, setDue] = useState(initial?.due_date ?? addDays(todayKey(), 1));

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError(L("Please enter what needs to be done.", "Sila masukkan tugasan yang perlu dibuat."));
    if (!due) return setError(L("Please choose a due date.", "Sila pilih tarikh akhir."));
    const row = { title: title.trim(), details: details.trim() || null, subject_id: subject || null, due_date: due };
    void run(() => (initial ? edit("tasks", initial.id, row) : add("tasks", { ...row, done: false })), onClose);
  }
  return (
    <form onSubmit={submit} noValidate>
      <Field label={L("Homework", "Kerja sekolah")}><input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder={L("e.g. Exercise 5, page 42", "cth. Latihan 5, muka surat 42")} /></Field>
      <Field label={L("Subject", "Subjek")}><SubjectSelect value={subject} onChange={setSubject} subjects={data.subjects} /></Field>
      <Field label={L("Due date", "Tarikh akhir")}><input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></Field>
      <Field label={L("Notes (optional)", "Nota (pilihan)")}><textarea rows={3} maxLength={1000} value={details} onChange={(e) => setDetails(e.target.value)} /></Field>
      <FormFooter busy={busy} error={error} onDelete={initial ? () => void run(() => remove("tasks", initial.id), onClose) : undefined} />
    </form>
  );
}

export default function TasksPage() {
  const { L, lang } = useLang();
  const { data, edit } = usePlanner();
  const [tab, setTab] = useState<"todo" | "done">("todo");
  const [editing, setEditing] = useState<Task | "new" | null>(null);
  const toggle = useAction();
  useOpenOnNew(() => setEditing("new"));
  const subj = useMemo(() => subjectMap(data.subjects), [data.subjects]);

  const todo = data.tasks.filter((t) => !t.done).sort((a, b) => a.due_date.localeCompare(b.due_date));
  const done = data.tasks.filter((t) => t.done).sort((a, b) => b.due_date.localeCompare(a.due_date));
  const groups: Array<{ key: string; label: string; items: Task[] }> = [
    { key: "over", label: L("Overdue", "Lewat"), items: todo.filter((t) => daysUntil(t.due_date) < 0) },
    { key: "today", label: L("Today", "Hari ini"), items: todo.filter((t) => daysUntil(t.due_date) === 0) },
    { key: "tom", label: L("Tomorrow", "Esok"), items: todo.filter((t) => daysUntil(t.due_date) === 1) },
    { key: "week", label: L("This week", "Minggu ini"), items: todo.filter((t) => daysUntil(t.due_date) >= 2 && daysUntil(t.due_date) <= 7) },
    { key: "later", label: L("Later", "Kemudian"), items: todo.filter((t) => daysUntil(t.due_date) > 7) },
  ].filter((g) => g.items.length);

  const Row = ({ t }: { t: Task }) => (
    <div className={`pl-row tk${t.done ? " dn" : ""}`}>
      <button type="button" className="pl-ck" role="checkbox" aria-checked={t.done} aria-label={t.done ? L("Mark as not done", "Tandakan belum siap") : L("Mark as done", "Tandakan siap")} disabled={toggle.busy} onClick={() => void toggle.run(() => edit("tasks", t.id, { done: !t.done }))}>
        {t.done && <Check size={18} aria-hidden="true" />}
      </button>
      <button type="button" className="pl-tx" onClick={() => setEditing(t)}>
        <b>{t.title}</b>
        <small><SubjectChip subject={t.subject_id ? subj.get(t.subject_id) : null} /> <span className={daysUntil(t.due_date) < 0 && !t.done ? "late" : undefined}>{relativeDay(t.due_date, L)} · {fmtDate(t.due_date, lang)}</span></small>
      </button>
    </div>
  );

  return (
    <PageShell>
      <PageHeader title={L("Homework", "Kerja Sekolah")} sub={todo.length ? L(`${todo.length} to do`, `${todo.length} belum siap`) : undefined} onAdd={() => setEditing("new")} addLabel={L("Add homework", "Tambah kerja sekolah")} />
      <LoadGate>
        <div className="pl-seg" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "todo"} onClick={() => setTab("todo")}>{L("To do", "Belum siap")} ({todo.length})</button>
          <button type="button" role="tab" aria-selected={tab === "done"} onClick={() => setTab("done")}>{L("Done", "Siap")} ({done.length})</button>
        </div>
        {toggle.error && <p className="pl-err" role="alert">{toggle.error}</p>}
        {tab === "todo" ? (
          groups.length === 0 ? (
            <Empty icon={ClipboardList} title={data.tasks.length ? L("All done! 🎉", "Semua siap! 🎉") : L("No homework yet", "Belum ada kerja sekolah")} text={data.tasks.length ? L("Nothing left to do. Enjoy your free time.", "Tiada lagi yang perlu dibuat. Nikmati masa lapang anda.") : L("Add your homework so you never miss a deadline.", "Tambah kerja sekolah supaya anda tak terlepas tarikh akhir.")}>
              <button type="button" className="pl-btn pl-pri" onClick={() => setEditing("new")}>{L("Add homework", "Tambah kerja sekolah")}</button>
              {data.subjects.length === 0 && <Link to="/subjects" className="pl-btn pl-gh">{L("Set up subjects", "Sediakan subjek")}</Link>}
            </Empty>
          ) : (
            groups.map((g) => (
              <section key={g.key}>
                <h2 className={`pl-h2${g.key === "over" ? " late" : ""}`}>{g.label}</h2>
                {g.items.map((t) => <Row key={t.id} t={t} />)}
              </section>
            ))
          )
        ) : done.length === 0 ? (
          <Empty icon={ClipboardList} title={L("Nothing finished yet", "Belum ada yang siap")} />
        ) : (
          done.map((t) => <Row key={t.id} t={t} />)
        )}
      </LoadGate>
      <Sheet open={editing !== null} onClose={() => setEditing(null)} title={editing && editing !== "new" ? L("Edit homework", "Ubah kerja sekolah") : L("New homework", "Kerja sekolah baharu")}>
        {editing !== null && <TaskForm initial={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      </Sheet>
    </PageShell>
  );
}
