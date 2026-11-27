import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, ChevronRight, CircleUser, Languages, Library, LogOut, Pencil, ShieldCheck, StickyNote, type LucideIcon } from "lucide-react";
import { PageHeader, PageShell } from "@/components/planner/ui";
import ParentLinkCard from "@/components/planner/ParentLinkCard";
import { LangToggle } from "@/components/ui/LangToggle";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { signOut } from "@/services/authService";
import { logError, toFriendlyMessage } from "@/lib/errors";

function LinkRow({ to, icon: Icon, label, sub }: { to: string; icon: LucideIcon; label: string; sub?: string }) {
  return (
    <Link to={to} className="pl-row">
      <span className="pl-ic" style={{ background: "var(--as)", color: "var(--a)" }}><Icon size={22} aria-hidden="true" /></span>
      <span className="pl-tx"><b>{label}</b>{sub && <small>{sub}</small>}</span>
      <ChevronRight size={18} aria-hidden="true" className="pl-cv" />
    </Link>
  );
}

export default function SettingsPage() {
  const { L } = useLang();
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const student = profile?.role !== "parent";

  async function handleSignOut() {
    setError(null);
    setBusy(true);
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (e) {
      logError("auth.signOut", e);
      setError(toFriendlyMessage(e, L("We couldn't sign you out. Please try again.", "Kami tidak dapat melog keluar anda. Sila cuba lagi.")));
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <PageHeader title={L("Settings", "Tetapan")} sub={user?.email ?? undefined} />

      <h2 className="pl-h2">{L("Language", "Bahasa")}</h2>
      <div className="pl-row" style={{ cursor: "default" }}>
        <span className="pl-ic" style={{ background: "var(--as)", color: "var(--a)" }}><Languages size={22} aria-hidden="true" /></span>
        <span className="pl-tx"><b>{L("App language", "Bahasa aplikasi")}</b><small>{L("English or Bahasa Melayu", "Bahasa Inggeris atau Bahasa Melayu")}</small></span>
        <LangToggle />
      </div>

      <h2 className="pl-h2">{L("Account", "Akaun")}</h2>
      <LinkRow to="/profile" icon={CircleUser} label={L("My profile", "Profil saya")} />
      <LinkRow to="/profile/edit" icon={Pencil} label={L("Edit profile", "Ubah profil")} />

      {student && (
        <>
          <h2 className="pl-h2">{L("Share with a parent", "Kongsi dengan ibu bapa")}</h2>
          <ParentLinkCard />
        </>
      )}

      <h2 className="pl-h2">{L("Shortcuts", "Pintasan")}</h2>
      {student && <LinkRow to="/subjects" icon={Library} label={L("Subjects", "Subjek")} />}
      {student && <LinkRow to="/notes" icon={StickyNote} label={L("Notes", "Nota")} />}
      <LinkRow to="/calendar" icon={CalendarDays} label={L("Calendar", "Kalendar")} />

      <h2 className="pl-h2">{L("About", "Tentang")}</h2>
      <div className="pl-card" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <ShieldCheck size={22} aria-hidden="true" style={{ color: "var(--a)", flex: "none", marginTop: 2 }} />
        <p className="pl-mut" style={{ margin: 0 }}>
          {L("Rancang+ v1.0. Your subjects, timetable, homework and notes are private to your account — nobody else can see them.", "Rancang+ v1.0. Subjek, jadual, kerja sekolah dan nota anda adalah peribadi kepada akaun anda — tiada orang lain boleh melihatnya.")}
        </p>
      </div>

      {error && <div style={{ marginTop: 14 }}><Alert>{error}</Alert></div>}
      <button type="button" className="pl-btn pl-gh pl-wide" style={{ marginTop: 16 }} onClick={handleSignOut} disabled={busy} aria-busy={busy}>
        {busy ? <Spinner /> : <LogOut size={18} aria-hidden="true" />} {L("Sign out", "Log keluar")}
      </button>
    </PageShell>
  );
}
