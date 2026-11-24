import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, LogOut, Pencil } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { AvatarUploader } from "@/components/ui/AvatarUploader";
import { LangToggle } from "@/components/ui/LangToggle";
import { Section, SectionTitle, cssVar } from "@/components/dashboard/parts";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { useRoleMeta } from "@/hooks/useRoleMeta";
import { signOut } from "@/services/authService";
import { dashboardPathFor } from "@/lib/roles";
import { heroFor } from "@/lib/hero";
import { logError, toFriendlyMessage } from "@/lib/errors";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="kv">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const { L, level, session } = useLang();
  const roleMeta = useRoleMeta();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile || !user) return null; // guards guarantee both
  const meta = roleMeta(profile.role);
  const isStudent = profile.role !== "parent";

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

  const googleName = (user.user_metadata?.full_name as string | undefined) ?? profile.full_name;

  return (
    <div className={`dsh ${meta.mode}`}>
      <div className="hd">
        <div className="tb">
          <Link to={dashboardPathFor(profile.role)} className="ib" aria-label={L("Back", "Kembali")}>
            <ChevronLeft size={22} aria-hidden="true" />
          </Link>
          <LangToggle />
          <span className="ib" style={{ visibility: "hidden" }} aria-hidden="true" />
        </div>
        <div className="pav">
          <AvatarUploader style={cssVar("--s", meta.soft)} fallback={<>
            {profile.gender === "female" && profile.role !== "parent" && !heroFor(profile.role, "female") ? (
              <b className="av-i" aria-hidden="true">{profile.full_name.trim().charAt(0).toUpperCase()}</b>
            ) : (
              (() => {
                const art = profile.role === "parent" ? null : heroFor(profile.role, profile.gender);
                const isGirlArt = profile.gender === "female" && art !== null;
                return <img className={isGirlArt ? "face" : undefined} src={art ?? meta.img} alt="" />;
              })()
            )}
          </>} />
          <h1>{profile.full_name}</h1>
          <span className="pl" style={{ background: meta.soft, color: meta.color }}>{meta.title}</span>
        </div>
      </div>

      <Section className="up">
        <SectionTitle title={L("Google account", "Akaun Google")} />
        <dl style={{ margin: 0 }}>
          <Row label={L("Name", "Nama")} value={googleName} />
          <Row label={L("Email", "E-mel")} value={user.email ?? "—"} />
        </dl>
      </Section>

      <Section>
        <SectionTitle title={L("Rancang+ profile", "Profil Rancang+")} />
        <dl style={{ margin: 0 }}>
          <Row label={L("Full name", "Nama penuh")} value={profile.full_name} />
          <Row label={L("Category", "Kategori")} value={meta.title} />
          <Row label={L("Gender", "Jantina")} value={profile.gender === "female" ? L("Female", "Perempuan") : profile.gender === "male" ? L("Male", "Lelaki") : "—"} />
          {isStudent ? (
            <>
              <Row label={L("School", "Sekolah")} value={profile.school_name ?? "—"} />
              <Row label={profile.role === "primary_student" ? L("School year", "Tahun") : L("Form", "Tingkatan")} value={level(profile.school_level)} />
              <Row label={L("Class", "Kelas")} value={profile.class_name ?? "—"} />
              <Row label={L("Session", "Sesi")} value={session(profile.school_session)} />
            </>
          ) : (
            <Row label={L("Phone", "Telefon")} value={profile.phone_number ?? L("Not provided", "Tidak diberikan")} />
          )}
        </dl>
      </Section>

      {error && <div style={{ padding: "0 14px 12px" }}><Alert>{error}</Alert></div>}

      <div style={{ display: "grid", gap: 10, padding: "0 14px" }}>
        <Link to="/profile/edit" className="cta">
          <Pencil size={20} aria-hidden="true" /> {L("Edit profile", "Ubah profil")}
        </Link>
        <button type="button" className="cta ghost" onClick={handleSignOut} disabled={busy} aria-busy={busy}>
          {busy ? <Spinner /> : <LogOut size={20} aria-hidden="true" />} {L("Sign out", "Log keluar")}
        </button>
      </div>
    </div>
  );
}
