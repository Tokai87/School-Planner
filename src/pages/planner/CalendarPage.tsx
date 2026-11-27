import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList, FileText, PartyPopper } from "lucide-react";
import { Empty, Field, FormFooter, LoadGate, PageHeader, PageShell, Sheet, useAction, useOpenOnNew } from "@/components/planner/ui";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { usePlanner } from "@/hooks/usePlanner";
import { EVENT_KINDS, fmtDate, hhmm, isoWeekday, tint, toKey, todayKey, WEEKDAYS, type EventKind, type PEvent } from "@/lib/planner";

function EventForm({ initial, date, onClose }: { initial: PEvent | null; date: string; onClose: () => void }) {
  const { L } = useLang();
  const { profile } = useAuth();
  const { data, add, edit, remove } = usePlanner();
  const { busy, error, run, setError } = useAction();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [kind, setKind] = useState<EventKind>(initial?.kind ?? "event");
  const [d, setD] = useState(initial?.event_date ?? date);
  const [child, setChild] = useState(initial?.child_id ?? "");
  const [details, setDetails] = useState(initial?.details ?? "");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError(L("Please enter a title.", "Sila masukkan tajuk."));
    if (!d) return setError(L("Please choose a date.", "Sila pilih tarikh."));
    const row = { title: title.trim(), kind, event_date: d, child_id: child || null, details: details.trim() || null };
    void run(() => (initial ? edit("events", initial.id, row) : add("events", row)), onClose);
  }
  return (
    <form onSubmit={submit} noValidate>
      <Field label={L("Title", "Tajuk")}><input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder={L("e.g. Sports Day", "cth. Hari Sukan")} /></Field>
      <div className="pl-f">
        <span>{L("Type", "Jenis")}</span>
        <div className="pl-chips" role="radiogroup" aria-label={L("Type", "Jenis")}>
          {EVENT_KINDS.map((k) => <button key={k.id} type="button" role="radio" aria-checked={kind === k.id} aria-pressed={kind === k.id} onClick={() => setKind(k.id)}>{L(k.en, k.ms)}</button>)}
        </div>
      </div>
      <Field label={L("Date", "Tarikh")}><input type="date" value={d} onChange={(e) => setD(e.target.value)} /></Field>
      {profile?.role === "parent" && data.children.length > 0 && (
        <Field label={L("For (optional)", "Untuk (pilihan)")}>
          <select value={child} onChange={(e) => setChild(e.target.value)}>
            <option value="">{L("All children", "Semua anak")}</option>
            {data.children.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
        </Field>
      )}
      <Field label={L("Details (optional)", "Butiran (pilihan)")}><textarea rows={3} maxLength={500} value={details} onChange={(e) => setDetails(e.target.value)} /></Field>
      <FormFooter busy={busy} error={error} onDelete={initial ? () => void run(() => remove("events", initial.id), onClose) : undefined} />
    </form>
  );
}

interface Item { id: string; type: "event" | "exam" | "task"; title: string; sub: string; color: string; ev?: PEvent }

export default function CalendarPage() {
  const { L, lang } = useLang();
  const { profile } = useAuth();
  const { data } = usePlanner();
  const navigate = useNavigate();
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(todayKey());
  const [editing, setEditing] = useState<PEvent | "new" | null>(null);
  useOpenOnNew(() => setEditing("new"));
  const student = profile?.role !== "parent";

  const byDay = useMemo(() => {
    const map = new Map<string, Item[]>();
    const push = (k: string, it: Item) => map.set(k, [...(map.get(k) ?? []), it]);
    for (const e of data.events) {
      const kind = EVENT_KINDS.find((x) => x.id === e.kind)!;
      const kid = e.child_id ? data.children.find((c) => c.id === e.child_id)?.full_name : null;
      push(e.event_date, { id: e.id, type: "event", title: e.title, sub: [L(kind.en, kind.ms), kid].filter(Boolean).join(" · "), color: kind.color, ev: e });
    }
    if (student) {
      for (const x of data.exams) push(x.exam_date, { id: x.id, type: "exam", title: x.title, sub: [L("Exam", "Peperiksaan"), x.start_time && hhmm(x.start_time)].filter(Boolean).join(" · "), color: "#EF4444" });
      for (const t of data.tasks) if (!t.done) push(t.due_date, { id: t.id, type: "task", title: t.title, sub: L("Homework due", "Kerja sekolah akhir"), color: "#F59E0B" });
    }
    return map;
  }, [data, student, L]);

  const first = new Date(cursor.y, cursor.m, 1);
  const lead = isoWeekday(first) - 1;
  const count = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: Array<string | null> = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => toKey(new Date(cursor.y, cursor.m, i + 1)))];
  const shift = (n: number) => {
    const d = new Date(cursor.y, cursor.m + n, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
    setSelected(toKey(d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() ? now : d));
  };
  const monthLabel = first.toLocaleDateString(lang === "ms" ? "ms-MY" : "en-GB", { month: "long", year: "numeric" });
  const items = byDay.get(selected) ?? [];
  const icon = { event: PartyPopper, exam: FileText, task: ClipboardList };

  return (
    <PageShell>
      <PageHeader title={L("Calendar", "Kalendar")} onAdd={() => setEditing("new")} addLabel={L("Add event", "Tambah acara")} />
      <LoadGate>
        <div className="pl-card">
          <div className="pl-mon">
            <button type="button" onClick={() => shift(-1)} aria-label={L("Previous month", "Bulan sebelumnya")}><ChevronLeft size={22} aria-hidden="true" /></button>
            <b aria-live="polite">{monthLabel}</b>
            <button type="button" onClick={() => shift(1)} aria-label={L("Next month", "Bulan seterusnya")}><ChevronRight size={22} aria-hidden="true" /></button>
          </div>
          <div className="pl-cal" role="grid">
            {WEEKDAYS.map((w) => <span key={w.n} className="h" aria-hidden="true">{(lang === "ms" ? w.msShort : w.enShort).slice(0, 3)}</span>)}
            {cells.map((k, i) => {
              if (!k) return <span key={`b${i}`} />;
              const its = byDay.get(k) ?? [];
              const dots = [...new Set(its.map((x) => x.color))].slice(0, 3);
              return (
                <button key={k} type="button" className={`${k === todayKey() ? "now " : ""}${k === selected ? "sel" : ""}`} aria-pressed={k === selected} aria-label={fmtDate(k, lang, { weekday: "long", day: "numeric", month: "long" }) + (its.length ? ` — ${its.length}` : "")} onClick={() => setSelected(k)}>
                  {Number(k.slice(8))}
                  <span className="dots">{dots.map((c) => <i key={c} style={{ background: c }} />)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <h2 className="pl-h2">{fmtDate(selected, lang, { weekday: "long", day: "numeric", month: "long" })}</h2>
        {items.length === 0 ? (
          <Empty icon={CalendarDays} title={L("Nothing planned", "Tiada perancangan")}>
            <button type="button" className="pl-btn pl-pri" onClick={() => setEditing("new")}>{L("Add an event", "Tambah acara")}</button>
          </Empty>
        ) : (
          items.map((it) => {
            const Icon = icon[it.type];
            return (
              <button key={`${it.type}${it.id}`} type="button" className="pl-row" onClick={() => (it.ev ? setEditing(it.ev) : navigate(it.type === "exam" ? "/exams" : "/tasks"))}>
                <span className="pl-ic" style={{ background: tint(it.color), color: it.color }}><Icon size={22} aria-hidden="true" /></span>
                <span className="pl-tx"><b>{it.title}</b><small>{it.sub}</small></span>
                <ChevronRight size={18} aria-hidden="true" className="pl-cv" />
              </button>
            );
          })
        )}
      </LoadGate>
      <Sheet open={editing !== null} onClose={() => setEditing(null)} title={editing && editing !== "new" ? L("Edit event", "Ubah acara") : L("New event", "Acara baharu")}>
        {editing !== null && <EventForm initial={editing === "new" ? null : editing} date={selected} onClose={() => setEditing(null)} />}
      </Sheet>
    </PageShell>
  );
}
