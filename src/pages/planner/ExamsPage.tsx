import { useMemo, useState, type FormEvent } from "react";
import { FileText } from "lucide-react";
import { Empty, Field, FormFooter, LoadGate, PageHeader, PageShell, Sheet, SubjectChip, SubjectSelect, subjectMap, useAction, useOpenOnNew } from "@/components/planner/ui";
import { useLang } from "@/hooks/useLang";
import { usePlanner } from "@/hooks/usePlanner";
import { addDays, daysUntil, fmtDate, fromKey, hhmm, relativeDay, todayKey, type Exam } from "@/lib/planner";

function ExamForm({ initial, onClose }: { initial: Exam | null; onClose: () => void }) {
  const { L } = useLang();
  const { data, add, edit, remove } = usePlanner();
  const { busy, error, run, setError } = useAction();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subject, setSubject] = useState(initial?.subject_id ?? "");
  const [date, setDate] = useState(initial?.exam_date ?? addDays(todayKey(), 14));
  const [time, setTime] = useState(hhmm(initial?.start_time));
  const [venue, setVenue] = useState(initial?.venue ?? "");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError(L("Please name the exam.", "Sila namakan peperiksaan."));
    if (!date) return setError(L("Please choose the exam date.", "Sila pilih tarikh peperiksaan."));
    const row = { title: title.trim(), subject_id: subject || null, exam_date: date, start_time: time || null, venue: venue.trim() || null };
    void run(() => (initial ? edit("exams", initial.id, row) : add("exams", row)), onClose);
  }
  return (
    <form onSubmit={submit} noValidate>
      <Field label={L("Exam name", "Nama peperiksaan")}><input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder={L("e.g. Mid-Year Exam", "cth. Peperiksaan Pertengahan Tahun")} /></Field>
      <Field label={L("Subject", "Subjek")}><SubjectSelect value={subject} onChange={setSubject} subjects={data.subjects} /></Field>
      <div className="pl-2">
        <Field label={L("Date", "Tarikh")}><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label={L("Time (optional)", "Masa (pilihan)")}><input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
      </div>
      <Field label={L("Venue (optional)", "Tempat (pilihan)")}><input value={venue} maxLength={60} onChange={(e) => setVenue(e.target.value)} placeholder={L("e.g. School hall", "cth. Dewan sekolah")} /></Field>
      <FormFooter busy={busy} error={error} onDelete={initial ? () => void run(() => remove("exams", initial.id), onClose) : undefined} />
    </form>
  );
}

export default function ExamsPage() {
  const { L, lang } = useLang();
  const { data } = usePlanner();
  const [editing, setEditing] = useState<Exam | "new" | null>(null);
  const [showPast, setShowPast] = useState(false);
  useOpenOnNew(() => setEditing("new"));
  const subj = useMemo(() => subjectMap(data.subjects), [data.subjects]);
  const upcoming = data.exams.filter((x) => daysUntil(x.exam_date) >= 0).sort((a, b) => a.exam_date.localeCompare(b.exam_date));
  const past = data.exams.filter((x) => daysUntil(x.exam_date) < 0).sort((a, b) => b.exam_date.localeCompare(a.exam_date));

  const Row = ({ x, muted }: { x: Exam; muted?: boolean }) => {
    const d = fromKey(x.exam_date);
    const left = daysUntil(x.exam_date);
    return (
      <button type="button" className={`pl-row${muted ? " dn" : ""}`} onClick={() => setEditing(x)}>
        <span className="pl-db"><i>{d.toLocaleDateString(lang === "ms" ? "ms-MY" : "en-GB", { month: "short" })}</i><b>{d.getDate()}</b></span>
        <span className="pl-tx">
          <b>{x.title}</b>
          <small><SubjectChip subject={x.subject_id ? subj.get(x.subject_id) : null} /> {[x.start_time && hhmm(x.start_time), x.venue].filter(Boolean).join(" · ")}</small>
        </span>
        <span className={`pl-cd${left >= 0 && left <= 7 ? " hot" : ""}`}>{muted ? fmtDate(x.exam_date, lang) : relativeDay(x.exam_date, L)}</span>
      </button>
    );
  };

  return (
    <PageShell>
      <PageHeader title={L("Exams", "Peperiksaan")} sub={upcoming[0] ? `${L("Next", "Seterusnya")}: ${relativeDay(upcoming[0].exam_date, L)}` : undefined} onAdd={() => setEditing("new")} addLabel={L("Add exam", "Tambah peperiksaan")} />
      <LoadGate>
        {upcoming.length === 0 ? (
          <Empty icon={FileText} title={L("No upcoming exams", "Tiada peperiksaan akan datang")} text={L("Add your exam dates to get a countdown on your home screen.", "Tambah tarikh peperiksaan untuk dapatkan kiraan detik di skrin utama.")}>
            <button type="button" className="pl-btn pl-pri" onClick={() => setEditing("new")}>{L("Add an exam", "Tambah peperiksaan")}</button>
          </Empty>
        ) : upcoming.map((x) => <Row key={x.id} x={x} />)}
        {past.length > 0 && (
          <>
            <button type="button" className="pl-btn pl-gh pl-wide" onClick={() => setShowPast(!showPast)} aria-expanded={showPast}>
              {showPast ? L("Hide past exams", "Sembunyi peperiksaan lepas") : L(`Past exams (${past.length})`, `Peperiksaan lepas (${past.length})`)}
            </button>
            {showPast && past.map((x) => <Row key={x.id} x={x} muted />)}
          </>
        )}
      </LoadGate>
      <Sheet open={editing !== null} onClose={() => setEditing(null)} title={editing && editing !== "new" ? L("Edit exam", "Ubah peperiksaan") : L("New exam", "Peperiksaan baharu")}>
        {editing !== null && <ExamForm initial={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      </Sheet>
    </PageShell>
  );
}
