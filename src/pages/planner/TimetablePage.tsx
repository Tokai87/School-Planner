import { useMemo, useState, type FormEvent } from "react";
import { CalendarDays, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Empty, Field, FormFooter, LoadGate, PageHeader, PageShell, Sheet, SubjectSelect, useAction, useOpenOnNew, subjectMap } from "@/components/planner/ui";
import { useLang } from "@/hooks/useLang";
import { usePlanner } from "@/hooks/usePlanner";
import { hhmm, isoWeekday, nowMinutes, subjectIcon, tint, toMinutes, WEEKDAYS, type Entry } from "@/lib/planner";

function EntryForm({ initial, day, onClose }: { initial: Entry | null; day: number; onClose: () => void }) {
  const { L, lang } = useLang();
  const { data, add, addMany, edit, remove } = usePlanner();
  const { busy, error, run, setError } = useAction();
  const lastEnd = data.timetable_entries.filter((e) => e.weekday === day).map((e) => hhmm(e.end_time)).sort().pop();
  const [subject, setSubject] = useState(initial?.subject_id ?? "");
  const [days, setDays] = useState<number[]>([initial?.weekday ?? day]);
  const [start, setStart] = useState(hhmm(initial?.start_time) || lastEnd || "08:00");
  const [end, setEnd] = useState(hhmm(initial?.end_time) || "09:00");
  const [room, setRoom] = useState(initial?.room ?? "");
  const toggle = (n: number) => setDays((d) => (initial ? [n] : d.includes(n) ? d.filter((x) => x !== n) : [...d, n]));

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!subject) return setError(L("Please choose a subject.", "Sila pilih subjek."));
    if (days.length === 0) return setError(L("Choose at least one day.", "Pilih sekurang-kurangnya satu hari."));
    if (!start || !end || end <= start) return setError(L("The end time must be after the start time.", "Masa tamat mesti selepas masa mula."));
    const base = { subject_id: subject, start_time: start, end_time: end, room: room.trim() || null };
    void run(() => (initial ? edit("timetable_entries", initial.id, { ...base, weekday: days[0] }) : days.length === 1 ? add("timetable_entries", { ...base, weekday: days[0] }) : addMany("timetable_entries", days.map((d) => ({ ...base, weekday: d })))), onClose);
  }
  return (
    <form onSubmit={submit} noValidate>
      <Field label={L("Subject", "Subjek")}><SubjectSelect value={subject} onChange={setSubject} subjects={data.subjects} required /></Field>
      <div className="pl-f">
        <span>{initial ? L("Day", "Hari") : L("Days", "Hari")}</span>
        <div className="pl-chips" role="group" aria-label={L("Days", "Hari")}>
          {WEEKDAYS.map((w) => (
            <button key={w.n} type="button" aria-pressed={days.includes(w.n)} onClick={() => toggle(w.n)}>{lang === "ms" ? w.msShort : w.enShort}</button>
          ))}
        </div>
      </div>
      <div className="pl-2">
        <Field label={L("Starts", "Mula")}><input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
        <Field label={L("Ends", "Tamat")}><input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
      </div>
      <Field label={L("Room (optional)", "Bilik (pilihan)")}><input value={room} maxLength={40} onChange={(e) => setRoom(e.target.value)} placeholder={L("e.g. 3A or Lab 1", "cth. 3A atau Makmal 1")} /></Field>
      <FormFooter busy={busy} error={error} onDelete={initial ? () => void run(() => remove("timetable_entries", initial.id), onClose) : undefined} />
    </form>
  );
}

export default function TimetablePage() {
  const { L, lang } = useLang();
  const { data } = usePlanner();
  const today = isoWeekday(new Date());
  const [day, setDay] = useState(today);
  const [editing, setEditing] = useState<Entry | "new" | null>(null);
  useOpenOnNew(() => setEditing("new"));
  const subj = useMemo(() => subjectMap(data.subjects), [data.subjects]);
  const rows = data.timetable_entries.filter((e) => e.weekday === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
  const has = (n: number) => data.timetable_entries.some((e) => e.weekday === n);
  const now = nowMinutes();
  const dayName = WEEKDAYS.find((w) => w.n === day)!;

  return (
    <PageShell>
      <PageHeader title={L("Timetable", "Jadual Waktu")} sub={L("Your weekly classes", "Kelas mingguan anda")} onAdd={() => setEditing("new")} addLabel={L("Add class", "Tambah kelas")} />
      <LoadGate>
        <div className="pl-days" role="tablist" aria-label={L("Day of the week", "Hari dalam minggu")}>
          {WEEKDAYS.map((w) => (
            <button key={w.n} type="button" role="tab" aria-selected={day === w.n} className={w.n === today ? "td" : undefined} onClick={() => setDay(w.n)}>
              {lang === "ms" ? w.msShort : w.enShort}
              <i style={{ opacity: has(w.n) ? 1 : 0 }} />
            </button>
          ))}
        </div>
        <h2 className="pl-h2">{lang === "ms" ? dayName.ms : dayName.en}{day === today ? ` · ${L("Today", "Hari ini")}` : ""}</h2>

        {data.subjects.length === 0 ? (
          <Empty icon={CalendarDays} title={L("Add your subjects first", "Tambah subjek anda dahulu")} text={L("A class needs a subject. It only takes a moment.", "Setiap kelas perlukan subjek. Ia hanya ambil seketika.")}>
            <Link to="/subjects" className="pl-btn pl-pri">{L("Go to Subjects", "Ke Subjek")}</Link>
          </Empty>
        ) : rows.length === 0 ? (
          <Empty icon={CalendarDays} title={L("No classes on this day", "Tiada kelas pada hari ini")}>
            <button type="button" className="pl-btn pl-pri" onClick={() => setEditing("new")}>{L("Add a class", "Tambah kelas")}</button>
          </Empty>
        ) : (
          rows.map((e) => {
            const s = subj.get(e.subject_id);
            const Icon = subjectIcon(s?.name ?? "");
            const live = day === today && now >= toMinutes(e.start_time) && now < toMinutes(e.end_time);
            return (
              <button key={e.id} type="button" className="pl-row tm" onClick={() => setEditing(e)}>
                <span className="pl-time"><b>{hhmm(e.start_time)}</b>{hhmm(e.end_time)}</span>
                <span className="pl-ic" style={{ background: tint(s?.color ?? "#3B82F6"), color: s?.color ?? "#3B82F6" }}><Icon size={22} aria-hidden="true" /></span>
                <span className="pl-tx"><b>{s?.name ?? "—"}</b><small>{[s?.teacher, e.room && L(`Room ${e.room}`, `Bilik ${e.room}`)].filter(Boolean).join(" · ") || " "}</small></span>
                {live ? <span className="pl-now">{L("Now", "Kini")}</span> : <ChevronRight size={18} aria-hidden="true" className="pl-cv" />}
              </button>
            );
          })
        )}
      </LoadGate>
      <Sheet open={editing !== null} onClose={() => setEditing(null)} title={editing && editing !== "new" ? L("Edit class", "Ubah kelas") : L("New class", "Kelas baharu")}>
        {editing !== null && <EntryForm initial={editing === "new" ? null : editing} day={day} onClose={() => setEditing(null)} />}
      </Sheet>
    </PageShell>
  );
}
