import { useState, type FormEvent } from "react";
import { ChevronRight, Library, Sparkles } from "lucide-react";
import { Empty, Field, FormFooter, LoadGate, PageHeader, PageShell, Sheet, Swatches, useAction, useOpenOnNew } from "@/components/planner/ui";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { usePlanner } from "@/hooks/usePlanner";
import { COLORS, starterSubjects, subjectIcon, tint, type Subject } from "@/lib/planner";

function SubjectForm({ initial, onClose }: { initial: Subject | null; onClose: () => void }) {
  const { L } = useLang();
  const { add, edit, remove, data } = usePlanner();
  const { busy, error, run, setError } = useAction();
  const [name, setName] = useState(initial?.name ?? "");
  const [teacher, setTeacher] = useState(initial?.teacher ?? "");
  const [color, setColor] = useState(initial?.color ?? COLORS[data.subjects.length % COLORS.length]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return setError(L("Please enter a subject name.", "Sila masukkan nama subjek."));
    const row = { name: n, teacher: teacher.trim() || null, color };
    void run(() => (initial ? edit("subjects", initial.id, row) : add("subjects", row)), onClose);
  }
  return (
    <form onSubmit={submit} noValidate>
      <Field label={L("Subject name", "Nama subjek")}><input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder={L("e.g. Mathematics", "cth. Matematik")} /></Field>
      <Field label={L("Teacher (optional)", "Guru (pilihan)")}><input value={teacher} maxLength={60} onChange={(e) => setTeacher(e.target.value)} placeholder={L("e.g. Cikgu Aisyah", "cth. Cikgu Aisyah")} /></Field>
      <Field label={L("Colour", "Warna")}><Swatches value={color} onChange={setColor} colors={COLORS} /></Field>
      <FormFooter busy={busy} error={error} onDelete={initial ? () => void run(() => remove("subjects", initial.id), onClose) : undefined} />
    </form>
  );
}

export default function SubjectsPage() {
  const { profile } = useAuth();
  const { L, lang } = useLang();
  const { data, addMany } = usePlanner();
  const [editing, setEditing] = useState<Subject | "new" | null>(null);
  const seed = useAction();
  useOpenOnNew(() => setEditing("new"));
  if (!profile) return null;

  const perWeek = (id: string) => data.timetable_entries.filter((e) => e.subject_id === id).length;
  const close = () => setEditing(null);
  const subjects = [...data.subjects].sort((a, b) => a.name.localeCompare(b.name, lang));

  return (
    <PageShell>
      <PageHeader title={L("Subjects", "Subjek")} sub={subjects.length ? L(`${subjects.length} subjects`, `${subjects.length} subjek`) : undefined} onAdd={() => setEditing("new")} addLabel={L("Add subject", "Tambah subjek")} />
      <LoadGate>
        {subjects.length === 0 ? (
          <Empty icon={Library} title={L("No subjects yet", "Belum ada subjek")} text={L("Add your subjects first — then you can build your timetable and link homework to them.", "Tambah subjek anda dahulu — kemudian anda boleh bina jadual dan kaitkan kerja sekolah.")}>
            <button type="button" className="pl-btn pl-pri" disabled={seed.busy} onClick={() => void seed.run(() => addMany("subjects", starterSubjects(profile.role, lang)))}>
              <Sparkles size={18} aria-hidden="true" /> {L("Add common subjects", "Tambah subjek biasa")}
            </button>
            <button type="button" className="pl-btn pl-gh" onClick={() => setEditing("new")}>{L("Add my own", "Tambah sendiri")}</button>
            {seed.error && <p className="pl-err" role="alert">{seed.error}</p>}
          </Empty>
        ) : (
          subjects.map((s) => {
            const Icon = subjectIcon(s.name);
            const n = perWeek(s.id);
            return (
              <button key={s.id} type="button" className="pl-row" onClick={() => setEditing(s)}>
                <span className="pl-ic" style={{ background: tint(s.color), color: s.color }}><Icon size={22} aria-hidden="true" /></span>
                <span className="pl-tx"><b>{s.name}</b><small>{[s.teacher, n ? L(`${n} ${n === 1 ? "class" : "classes"} / week`, `${n} kelas / minggu`) : L("Not in timetable", "Tiada dalam jadual")].filter(Boolean).join(" · ")}</small></span>
                <ChevronRight size={18} aria-hidden="true" className="pl-cv" />
              </button>
            );
          })
        )}
      </LoadGate>
      <Sheet open={editing !== null} onClose={close} title={editing && editing !== "new" ? L("Edit subject", "Ubah subjek") : L("New subject", "Subjek baharu")}>
        {editing !== null && <SubjectForm initial={editing === "new" ? null : editing} onClose={close} />}
      </Sheet>
    </PageShell>
  );
}
