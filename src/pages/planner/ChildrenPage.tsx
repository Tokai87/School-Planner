import { useState, type FormEvent } from "react";
import { ChevronRight, Users } from "lucide-react";
import { Empty, Field, FormFooter, LoadGate, PageHeader, PageShell, Sheet, useAction, useOpenOnNew } from "@/components/planner/ui";
import { useLang } from "@/hooks/useLang";
import { usePlanner } from "@/hooks/usePlanner";
import { PRIMARY_LEVELS, SECONDARY_LEVELS } from "@/types/database";
import type { Child } from "@/lib/planner";

export const childColor = (c: Pick<Child, "gender">) => (c.gender === "female" ? "#D6336C" : "#2F6FE4");

function ChildForm({ initial, onClose }: { initial: Child | null; onClose: () => void }) {
  const { L, level } = useLang();
  const { add, edit, remove } = usePlanner();
  const { busy, error, run, setError } = useAction();
  const [name, setName] = useState(initial?.full_name ?? "");
  const [gender, setGender] = useState<"male" | "female" | "">(initial?.gender ?? "");
  const [lv, setLv] = useState(initial?.school_level ?? "");
  const [cls, setCls] = useState(initial?.class_name ?? "");
  const [school, setSchool] = useState(initial?.school_name ?? "");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError(L("Please enter your child's name.", "Sila masukkan nama anak anda."));
    const row = { full_name: name.trim(), gender: gender || null, school_level: lv || null, class_name: cls.trim() || null, school_name: school.trim() || null };
    void run(() => (initial ? edit("children", initial.id, row) : add("children", row)), onClose);
  }
  return (
    <form onSubmit={submit} noValidate>
      <Field label={L("Child's name", "Nama anak")}><input value={name} maxLength={80} onChange={(e) => setName(e.target.value)} /></Field>
      <div className="pl-f">
        <span>{L("Gender", "Jantina")}</span>
        <div className="pl-chips" role="radiogroup" aria-label={L("Gender", "Jantina")}>
          <button type="button" role="radio" aria-checked={gender === "male"} aria-pressed={gender === "male"} onClick={() => setGender("male")}>{L("Boy", "Lelaki")}</button>
          <button type="button" role="radio" aria-checked={gender === "female"} aria-pressed={gender === "female"} onClick={() => setGender("female")}>{L("Girl", "Perempuan")}</button>
        </div>
      </div>
      <div className="pl-2">
        <Field label={L("Year / Form", "Tahun / Tingkatan")}>
          <select value={lv} onChange={(e) => setLv(e.target.value)}>
            <option value="">—</option>
            {[...PRIMARY_LEVELS, ...SECONDARY_LEVELS].map((l) => <option key={l} value={l}>{level(l)}</option>)}
          </select>
        </Field>
        <Field label={L("Class", "Kelas")}><input value={cls} maxLength={40} onChange={(e) => setCls(e.target.value)} placeholder={L("e.g. 3 Cemerlang", "cth. 3 Cemerlang")} /></Field>
      </div>
      <Field label={L("School", "Sekolah")}><input value={school} maxLength={120} onChange={(e) => setSchool(e.target.value)} /></Field>
      <FormFooter busy={busy} error={error} onDelete={initial ? () => void run(() => remove("children", initial.id), onClose) : undefined} />
    </form>
  );
}

export default function ChildrenPage() {
  const { L, level } = useLang();
  const { data } = usePlanner();
  const [editing, setEditing] = useState<Child | "new" | null>(null);
  useOpenOnNew(() => setEditing("new"));
  return (
    <PageShell>
      <PageHeader title={L("My Children", "Anak-anak Saya")} sub={data.children.length ? L(`${data.children.length} children`, `${data.children.length} anak`) : undefined} onAdd={() => setEditing("new")} addLabel={L("Add child", "Tambah anak")} />
      <LoadGate>
        {data.children.length === 0 ? (
          <Empty icon={Users} title={L("Add your children", "Tambah anak-anak anda")} text={L("Keep their schools and classes in one place, and tag school events for each child.", "Simpan sekolah dan kelas mereka di satu tempat, dan tandakan acara sekolah untuk setiap anak.")}>
            <button type="button" className="pl-btn pl-pri" onClick={() => setEditing("new")}>{L("Add a child", "Tambah anak")}</button>
          </Empty>
        ) : (
          data.children.map((c) => (
            <button key={c.id} type="button" className="pl-row" onClick={() => setEditing(c)}>
              <span className="pl-av" style={{ background: childColor(c) }}>{c.full_name.trim().charAt(0).toUpperCase()}</span>
              <span className="pl-tx"><b>{c.full_name}</b><small>{[c.school_level && level(c.school_level), c.class_name, c.school_name].filter(Boolean).join(" · ") || L("No school details yet", "Belum ada butiran sekolah")}</small></span>
              <ChevronRight size={18} aria-hidden="true" className="pl-cv" />
            </button>
          ))
        )}
      </LoadGate>
      <Sheet open={editing !== null} onClose={() => setEditing(null)} title={editing && editing !== "new" ? L("Edit child", "Ubah butiran anak") : L("New child", "Anak baharu")}>
        {editing !== null && <ChildForm initial={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      </Sheet>
    </PageShell>
  );
}
