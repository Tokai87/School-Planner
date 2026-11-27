import { useMemo, useState, type FormEvent } from "react";
import { StickyNote } from "lucide-react";
import { Empty, Field, FormFooter, LoadGate, PageHeader, PageShell, Sheet, SubjectChip, SubjectSelect, subjectMap, useAction, useOpenOnNew } from "@/components/planner/ui";
import { useLang } from "@/hooks/useLang";
import { usePlanner } from "@/hooks/usePlanner";
import type { Note } from "@/lib/planner";

function NoteForm({ initial, onClose }: { initial: Note | null; onClose: () => void }) {
  const { L } = useLang();
  const { data, add, edit, remove } = usePlanner();
  const { busy, error, run, setError } = useAction();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [subject, setSubject] = useState(initial?.subject_id ?? "");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError(L("Please give your note a title.", "Sila beri tajuk untuk nota anda."));
    const row = { title: title.trim(), body: body.trim() || null, subject_id: subject || null, updated_at: new Date().toISOString() };
    void run(() => (initial ? edit("notes", initial.id, row) : add("notes", row)), onClose);
  }
  return (
    <form onSubmit={submit} noValidate>
      <Field label={L("Title", "Tajuk")}><input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} /></Field>
      <Field label={L("Subject (optional)", "Subjek (pilihan)")}><SubjectSelect value={subject} onChange={setSubject} subjects={data.subjects} /></Field>
      <Field label={L("Note", "Nota")}><textarea rows={7} maxLength={5000} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
      <FormFooter busy={busy} error={error} onDelete={initial ? () => void run(() => remove("notes", initial.id), onClose) : undefined} />
    </form>
  );
}

export default function NotesPage() {
  const { L } = useLang();
  const { data } = usePlanner();
  const [editing, setEditing] = useState<Note | "new" | null>(null);
  const [q, setQ] = useState("");
  useOpenOnNew(() => setEditing("new"));
  const subj = useMemo(() => subjectMap(data.subjects), [data.subjects]);
  const notes = [...data.notes]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .filter((n) => !q.trim() || `${n.title} ${n.body ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <PageShell>
      <PageHeader title={L("Notes", "Nota")} onAdd={() => setEditing("new")} addLabel={L("Add note", "Tambah nota")} />
      <LoadGate>
        {data.notes.length > 0 && <input className="pl-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={L("Search notes…", "Cari nota…")} aria-label={L("Search notes", "Cari nota")} />}
        {data.notes.length === 0 ? (
          <Empty icon={StickyNote} title={L("No notes yet", "Belum ada nota")} text={L("Jot down reminders, things to bring, or what the teacher said.", "Catat peringatan, barang untuk dibawa, atau apa yang cikgu cakap.")}>
            <button type="button" className="pl-btn pl-pri" onClick={() => setEditing("new")}>{L("Write a note", "Tulis nota")}</button>
          </Empty>
        ) : notes.length === 0 ? (
          <p className="pl-mut">{L("No notes match your search.", "Tiada nota sepadan dengan carian anda.")}</p>
        ) : (
          notes.map((n) => (
            <button key={n.id} type="button" className="pl-row nt" onClick={() => setEditing(n)}>
              <span className="pl-tx">
                <b>{n.title}</b>
                {n.body && <small className="wrap">{n.body}</small>}
                {n.subject_id && <small><SubjectChip subject={subj.get(n.subject_id)} /></small>}
              </span>
            </button>
          ))
        )}
      </LoadGate>
      <Sheet open={editing !== null} onClose={() => setEditing(null)} title={editing && editing !== "new" ? L("Edit note", "Ubah nota") : L("New note", "Nota baharu")}>
        {editing !== null && <NoteForm initial={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      </Sheet>
    </PageShell>
  );
}
