import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, Check, Plus, Trash2, X, type LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { usePlanner } from "@/hooks/usePlanner";
import { dashboardPathFor } from "@/lib/roles";
import { logError, toFriendlyMessage } from "@/lib/errors";
import { tint, type Subject } from "@/lib/planner";

/** Accent colour class for the current user (role + gender). */
export function useAccent(): string {
  const { profile } = useAuth();
  if (!profile) return "a-pri";
  if (profile.role === "parent") return "a-par";
  const sec = profile.role === "secondary_student";
  if (profile.gender === "female") return sec ? "a-fsec" : "a-fpri";
  return sec ? "a-sec" : "a-pri";
}

/** Wrapper every planner screen sits in: sets the accent colours and leaves room for the floating nav. */
export function PageShell({ children }: { children: ReactNode }) {
  const accent = useAccent();
  return <div className={`pl ${accent}`}>{children}</div>;
}

export function PageHeader({ title, sub, onAdd, addLabel, back }: { title: string; sub?: string; onAdd?: () => void; addLabel?: string; back?: string }) {
  const { profile } = useAuth();
  const { L } = useLang();
  return (
    <header className="pl-hd">
      <Link to={back ?? (profile ? dashboardPathFor(profile.role) : "/")} className="bk" aria-label={L("Back to home", "Kembali ke utama")}>
        <ChevronLeft size={22} aria-hidden="true" />
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1>{title}</h1>
        {sub && <small>{sub}</small>}
      </div>
      {onAdd && (
        <button type="button" className="pl-add" onClick={onAdd} aria-label={addLabel ?? L("Add", "Tambah")}>
          <Plus size={24} aria-hidden="true" />
        </button>
      )}
    </header>
  );
}

export function Empty({ icon: Icon, title, text, children }: { icon: LucideIcon; title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="pl-empty">
      <span className="ei"><Icon size={30} aria-hidden="true" /></span>
      <b>{title}</b>
      {text && <p>{text}</p>}
      {children && <div className="ea">{children}</div>}
    </div>
  );
}

export function LoadGate({ children }: { children: ReactNode }) {
  const { status, reload } = usePlanner();
  const { L } = useLang();
  if (status === "loading") return <div className="pl-load" role="status" aria-live="polite"><i />{L("Loading…", "Memuatkan…")}</div>;
  if (status === "error") {
    return (
      <div className="pl-empty">
        <b>{L("We couldn't load your planner.", "Kami tidak dapat memuatkan perancang anda.")}</b>
        <p>{L("Check your connection and try again.", "Semak sambungan anda dan cuba lagi.")}</p>
        <div className="ea"><button type="button" className="pl-btn" onClick={() => void reload()}>{L("Try again", "Cuba lagi")}</button></div>
      </div>
    );
  }
  return <>{children}</>;
}

/** Bottom sheet dialog. Esc and the backdrop close it; focus moves into it and returns afterwards. */
export function Sheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const { L } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const body = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => ref.current?.querySelector<HTMLElement>("input,select,textarea,button.pl-pri")?.focus(), 60);
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", key);
      document.body.style.overflow = body;
      prev?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="pl-ov" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pl-sh" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <header>
          <h2>{title}</h2>
          <button type="button" className="x" onClick={onClose} aria-label={L("Close", "Tutup")}><X size={22} aria-hidden="true" /></button>
        </header>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="pl-f">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

/** Runs an async save/delete with a busy flag and a friendly error. */
export function useAction() {
  const { L } = useLang();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(async (fn: () => Promise<unknown>, onDone?: () => void) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await fn();
      onDone?.();
    } catch (e) {
      logError("planner.save", e);
      setError(toFriendlyMessage(e, L("Something went wrong. Please try again.", "Sesuatu tidak kena. Sila cuba lagi.")));
    } finally {
      setBusy(false);
    }
  }, [busy, L]);
  return { busy, error, setError, run };
}

/** Save button, optional two-step delete and an inline error — the footer of every form. */
export function FormFooter({ busy, error, onDelete, saveLabel }: { busy: boolean; error: string | null; onDelete?: () => void; saveLabel?: string }) {
  const { L } = useLang();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="pl-ft">
      {error && <p className="pl-err" role="alert">{error}</p>}
      <button type="submit" className="pl-btn pl-pri" disabled={busy}>{busy ? L("Saving…", "Menyimpan…") : saveLabel ?? L("Save", "Simpan")}</button>
      {onDelete && (confirm ? (
        <div className="pl-cf">
          <span>{L("Delete this for good?", "Padam ini selama-lamanya?")}</span>
          <button type="button" className="pl-btn pl-dng" disabled={busy} onClick={onDelete}>{L("Yes, delete", "Ya, padam")}</button>
          <button type="button" className="pl-btn pl-gh" onClick={() => setConfirm(false)}>{L("Cancel", "Batal")}</button>
        </div>
      ) : (
        <button type="button" className="pl-btn pl-gh pl-del" onClick={() => setConfirm(true)}><Trash2 size={18} aria-hidden="true" /> {L("Delete", "Padam")}</button>
      ))}
    </div>
  );
}

export function Swatches({ value, onChange, colors }: { value: string; onChange: (c: string) => void; colors: string[] }) {
  const { L } = useLang();
  return (
    <div className="pl-sw" role="radiogroup" aria-label={L("Colour", "Warna")}>
      {colors.map((c) => (
        <button key={c} type="button" role="radio" aria-checked={value === c} aria-label={c} style={{ background: c }} onClick={() => onChange(c)}>
          {value === c && <Check size={18} aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
}

export function SubjectChip({ subject }: { subject: Subject | undefined | null }) {
  if (!subject) return null;
  return <span className="pl-chip" style={{ background: tint(subject.color, 0.16), color: subject.color }}>{subject.name}</span>;
}

export function SubjectSelect({ value, onChange, subjects, required }: { value: string; onChange: (v: string) => void; subjects: Subject[]; required?: boolean }) {
  const { L } = useLang();
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} required={required}>
      {!required && <option value="">{L("— No subject —", "— Tiada subjek —")}</option>}
      {required && <option value="" disabled>{L("Choose a subject…", "Pilih subjek…")}</option>}
      {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
  );
}

/** Opens a sheet when the page is reached with ?new=1 (used by the "+" menu), then clears the flag. */
export function useOpenOnNew(open: () => void) {
  const [params, setParams] = useSearchParams();
  const flag = params.get("new");
  useEffect(() => {
    if (!flag) return;
    open();
    const next = new URLSearchParams(params);
    next.delete("new");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flag]);
}

export const subjectMap = (subjects: Subject[]) => new Map(subjects.map((s) => [s.id, s]));
