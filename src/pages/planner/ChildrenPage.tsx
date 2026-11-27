import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Link2, Users } from "lucide-react";
import { Empty, Field, FormFooter, LoadGate, PageHeader, PageShell, Sheet, useAction, useOpenOnNew } from "@/components/planner/ui";
import { useLang } from "@/hooks/useLang";
import { usePlanner } from "@/hooks/usePlanner";
import { useLinkedChildren } from "@/hooks/useLinkedChildren";
import { linkErrorMessage, redeemLinkCode } from "@/services/linkService";
import { pendingTasks } from "@/lib/today";
import { asPlanner } from "@/services/linkService";
import { PRIMARY_LEVELS, SECONDARY_LEVELS } from "@/types/database";
import type { Child } from "@/lib/planner";

export const childColor = (c: Pick<Child, "gender">) => (c.gender === "female" ? "#D6336C" : "#2F6FE4");

export function ChildForm({ initial, onClose }: { initial: Child | null; onClose: () => void }) {
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

function LinkForm({ onClose, onLinked }: { onClose: () => void; onLinked: () => void }) {
  const { L } = useLang();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (code.replace(/[^A-Za-z0-9]/g, "").length < 10) return setError(L("Enter the 10-character code from your child's Settings.", "Masukkan kod 10 aksara daripada Tetapan anak anda."));
    setBusy(true); setError(null);
    try { setDone(await redeemLinkCode(code)); onLinked(); } catch (err) { setError(linkErrorMessage(err, L)); } finally { setBusy(false); }
  }
  if (done) {
    return (
      <div>
        <p className="pl-ok" role="status">{L(`Linked to ${done}.`, `Berjaya dipautkan kepada ${done}.`)}</p>
        <button type="button" className="pl-btn pl-pri pl-wide" onClick={onClose}>{L("Done", "Selesai")}</button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} noValidate>
      <p className="pl-mut" style={{ marginTop: 0 }}>{L("Ask your child to open Settings → Share with a parent → Create link code, then type it here.", "Minta anak anda buka Tetapan → Kongsi dengan ibu bapa → Cipta kod pautan, kemudian taip di sini.")}</p>
      <Field label={L("Link code", "Kod pautan")}>
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={11} placeholder="XXXXX-XXXXX" autoCapitalize="characters" autoComplete="off" spellCheck={false} className="pl-codein" />
      </Field>
      {error && <p className="pl-err" role="alert">{error}</p>}
      <button type="submit" className="pl-btn pl-pri pl-wide" disabled={busy} aria-busy={busy}>{L("Link account", "Pautkan akaun")}</button>
    </form>
  );
}

export default function ChildrenPage() {
  const { L, level } = useLang();
  const { data } = usePlanner();
  const navigate = useNavigate();
  const linked = useLinkedChildren();
  const [linking, setLinking] = useState(false);
  const [editing, setEditing] = useState<Child | "new" | null>(null);
  useOpenOnNew(() => setEditing("new"));
  return (
    <PageShell>
      <PageHeader title={L("My Children", "Anak-anak Saya")} sub={data.children.length + linked.kids.length ? L(`${data.children.length + linked.kids.length} children`, `${data.children.length + linked.kids.length} anak`) : undefined} onAdd={() => setEditing("new")} addLabel={L("Add child", "Tambah anak")} />
      <LoadGate>
        <button type="button" className="pl-btn pl-gh pl-wide" onClick={() => setLinking(true)}>
          <Link2 size={18} aria-hidden="true" /> {L("Link your child's account", "Pautkan akaun anak anda")}
        </button>

        {linked.kids.length > 0 && <h2 className="pl-h2">{L("Linked accounts", "Akaun berpaut")}</h2>}
        {linked.kids.map(({ info, snap }) => {
          const todo = pendingTasks(asPlanner(snap)).length;
          return (
            <button key={info.link_id} type="button" className="pl-row" onClick={() => navigate(`/children/linked/${info.child_id}`)}>
              <span className="pl-av" style={{ background: childColor(info) }}>{info.full_name.trim().charAt(0).toUpperCase()}</span>
              <span className="pl-tx"><b>{info.full_name}</b><small>{[info.school_level && level(info.school_level), info.class_name, L(`${todo} homework to do`, `${todo} kerja sekolah belum siap`)].filter(Boolean).join(" · ")}</small></span>
              <ChevronRight size={18} aria-hidden="true" className="pl-cv" />
            </button>
          );
        })}

        {data.children.length === 0 && linked.kids.length === 0 ? (
          <Empty icon={Users} title={L("Add your children", "Tambah anak-anak anda")} text={L("Link your child's account to follow their timetable and homework, or add them by hand to keep their school details and tag events.", "Pautkan akaun anak untuk ikuti jadual dan kerja sekolah mereka, atau tambah secara manual untuk simpan butiran sekolah dan tandakan acara.")}>
            <button type="button" className="pl-btn pl-pri" onClick={() => setEditing("new")}>{L("Add a child manually", "Tambah anak secara manual")}</button>
          </Empty>
        ) : data.children.length > 0 && (
          <>
            {linked.kids.length > 0 && <h2 className="pl-h2">{L("Added by hand", "Ditambah secara manual")}</h2>}
            {data.children.map((c) => (
              <button key={c.id} type="button" className="pl-row" onClick={() => navigate(`/children/${c.id}`)}>
                <span className="pl-av" style={{ background: childColor(c) }}>{c.full_name.trim().charAt(0).toUpperCase()}</span>
                <span className="pl-tx"><b>{c.full_name}</b><small>{[c.school_level && level(c.school_level), c.class_name, c.school_name].filter(Boolean).join(" · ") || L("No school details yet", "Belum ada butiran sekolah")}</small></span>
                <ChevronRight size={18} aria-hidden="true" className="pl-cv" />
              </button>
            ))}
          </>
        )}
      </LoadGate>
      <Sheet open={editing !== null} onClose={() => setEditing(null)} title={editing && editing !== "new" ? L("Edit child", "Ubah butiran anak") : L("New child", "Anak baharu")}>
        {editing !== null && <ChildForm initial={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      </Sheet>
      <Sheet open={linking} onClose={() => setLinking(false)} title={L("Link your child's account", "Pautkan akaun anak anda")}>
        {linking && <LinkForm onClose={() => setLinking(false)} onLinked={() => void linked.reload()} />}
      </Sheet>
    </PageShell>
  );
}
