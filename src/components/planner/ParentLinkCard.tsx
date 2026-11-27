import { useCallback, useEffect, useState } from "react";
import { Check, Copy, KeyRound, Link2Off } from "lucide-react";
import { useAction } from "@/components/planner/ui";
import { useLang } from "@/hooks/useLang";
import { createLinkCode, listLinkedParents, unlink, type LinkedParent } from "@/services/linkService";
import { fmtDate } from "@/lib/planner";

/** Student settings: share a one-time code with a parent, and see / remove linked parents. */
export default function ParentLinkCard() {
  const { L, lang } = useLang();
  const [parents, setParents] = useState<LinkedParent[]>([]);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const gen = useAction();
  const rm = useAction();

  const load = useCallback(async () => { try { setParents(await listLinkedParents()); } catch { /* shown empty */ } }, []);
  useEffect(() => { void load(); }, [load]);

  async function copy() {
    if (!code) return;
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ }
  }

  return (
    <div className="pl-card">
      <p className="pl-mut" style={{ margin: "0 0 12px" }}>
        {L("Let a parent follow your timetable, homework and exams. They can only view — never edit. Your notes stay private.", "Benarkan ibu bapa melihat jadual, kerja sekolah dan peperiksaan anda. Mereka hanya boleh melihat, bukan mengubah. Nota anda kekal peribadi.")}
      </p>

      {code && (
        <div className="pl-code" role="status">
          <span aria-label={L("Link code", "Kod pautan")}>{code}</span>
          <button type="button" className="pl-btn pl-gh" onClick={copy}>{copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />} {copied ? L("Copied", "Disalin") : L("Copy", "Salin")}</button>
          <small>{L("Give this to your parent. Valid for 24 hours, one use.", "Beri kod ini kepada ibu bapa. Sah 24 jam, sekali guna.")}</small>
        </div>
      )}
      {gen.error && <p className="pl-err" role="alert">{gen.error}</p>}
      <button type="button" className="pl-btn pl-pri pl-wide" disabled={gen.busy} onClick={() => void gen.run(async () => setCode(await createLinkCode()))}>
        <KeyRound size={18} aria-hidden="true" /> {code ? L("New code", "Kod baharu") : L("Create link code", "Cipta kod pautan")}
      </button>

      {parents.length > 0 && <h3 className="pl-h3">{L("Linked parents", "Ibu bapa berpaut")}</h3>}
      {parents.map((p) => (
        <div key={p.link_id} className="pl-lp">
          <span><b>{p.full_name}</b><small>{L("Since", "Sejak")} {fmtDate(p.linked_at.slice(0, 10), lang)}</small></span>
          {confirm === p.link_id ? (
            <button type="button" className="pl-btn pl-dng" disabled={rm.busy} onClick={() => void rm.run(async () => { await unlink(p.link_id); setConfirm(null); await load(); })}>{L("Confirm remove", "Sahkan buang")}</button>
          ) : (
            <button type="button" className="pl-btn pl-gh" onClick={() => setConfirm(p.link_id)}><Link2Off size={16} aria-hidden="true" /> {L("Remove", "Buang")}</button>
          )}
        </div>
      ))}
      {rm.error && <p className="pl-err" role="alert">{rm.error}</p>}
    </div>
  );
}
