import { useState } from "react";
import { ChevronRight, ShieldCheck, User } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { LangToggle } from "@/components/ui/LangToggle";
import { Spinner } from "@/components/ui/Spinner";
import { Wordmark } from "@/components/brand/BrandMark";
import { SchoolScene, Tree } from "@/components/brand/SchoolScene";
import { EventsIcon, ExamIcon, HomeworkIcon, TimetableIcon } from "@/components/brand/FeatureIcons";
import { signInWithGoogle } from "@/services/authService";
import { logError, toFriendlyMessage } from "@/lib/errors";
import { useLang } from "@/hooks/useLang";
import kids from "@/assets/hero-welcome.webp";

const COPY = {
  en: {
    tagline: "Plan today, achieve more tomorrow.",
    google: "Sign in with Google",
    connecting: "Connecting to Google…",
    signIn: "Sign in",
    noAccount: "Don't have an account?",
    signUp: "Sign up now",
    safe: "Safe. Secure. Your data is protected.",
    terms: ["By continuing, you agree to our ", "Terms of Service", " and ", "Privacy Policy"],
    features: [
      ["Timetable", "See your class schedule"],
      ["Homework", "Check your assignments"],
      ["Exams", "Know your exam dates"],
      ["Calendar", "See important events"],
    ],
  },
  ms: {
    tagline: "Rancang hari ini, capai lebih esok.",
    google: "Log Masuk dengan Google",
    connecting: "Menyambung ke Google…",
    signIn: "Log Masuk",
    noAccount: "Belum mempunyai akaun?",
    signUp: "Daftar Sekarang",
    safe: "Selamat. Data anda dilindungi.",
    terms: ["Dengan meneruskan, anda bersetuju dengan ", "Syarat Perkhidmatan", " dan ", "Dasar Privasi"],
    features: [
      ["Jadual Waktu", "Lihat jadual kelas anda"],
      ["Kerja Sekolah", "Semak tugasan anda"],
      ["Peperiksaan", "Ketahui jadual peperiksaan"],
      ["Kalendar", "Lihat acara penting"],
    ],
  },
} as const;

const FEATURES = [
  { Icon: TimetableIcon, cls: "f-blue" },
  { Icon: HomeworkIcon, cls: "f-purple" },
  { Icon: ExamIcon, cls: "f-green" },
  { Icon: EventsIcon, cls: "f-yellow" },
];

function GoogleG() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

export default function WelcomePage() {
  const { lang, L } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = COPY[lang];

  // Rancang+ uses Google only: the same flow signs existing users in and creates an account for new ones.
  async function handleSignIn() {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle(); // browser is redirected to Google on success
    } catch (e) {
      logError("auth.signInWithOAuth", e);
      setError(toFriendlyMessage(e, L("We couldn't start Google sign-in. Please try again.", "Kami tidak dapat memulakan log masuk Google. Sila cuba lagi.")));
      setLoading(false);
    }
  }

  return (
    <div className="wl">
      <section className="wl-hero">
        <span aria-hidden="true" className="wl-cloud c1" />
        <span aria-hidden="true" className="wl-cloud c2" />
        <span aria-hidden="true" className="wl-cloud c3" />
        <Tree className="wl-tree tl" />
        <Tree className="wl-tree tr" />
        <SchoolScene className="wl-school" />
        <div className="wl-top">
          <Wordmark size={46} />
          <LangToggle />
        </div>
        <p className="wl-tag">
          {t.tagline}
          <svg viewBox="0 0 160 10" aria-hidden="true"><path d="M3 7C40 2 100 1 157 4" fill="none" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" /></svg>
        </p>
        <img className="wl-kids" src={kids} alt={L("A smiling boy and girl in school uniform giving thumbs up", "Seorang budak lelaki dan perempuan berpakaian seragam sekolah menunjukkan isyarat bagus")} />
      </section>

      <ul className="wl-feat" aria-label={L("Features", "Ciri-ciri")}>
        {FEATURES.map(({ Icon, cls }, i) => (
          <li key={cls} className={cls}>
            <Icon />
            <span className="ft">
              <b>{t.features[i][0]}</b>
              <small>{t.features[i][1]}</small>
            </span>
            <span className="fc" aria-hidden="true"><ChevronRight size={15} /></span>
            <svg className="fw" viewBox="0 0 200 30" preserveAspectRatio="none" aria-hidden="true"><path d="M0 18C40 4 70 4 110 16s60 8 90-4v18H0z" /></svg>
          </li>
        ))}
      </ul>

      <div className="wl-act">
        {error && <div className="wl-err"><Alert>{error}</Alert></div>}
        <button type="button" className="wl-g" onClick={handleSignIn} disabled={loading} aria-busy={loading}>
          <span className="gi">{loading ? <span style={{ color: "#1D4ED8" }}><Spinner /></span> : <GoogleG />}</span>
          {loading ? t.connecting : t.google}
        </button>
        <button type="button" className="wl-o" onClick={handleSignIn} disabled={loading}>
          <User size={22} aria-hidden="true" /> {t.signIn}
        </button>
        <p className="wl-su">
          {t.noAccount}{" "}
          <button type="button" onClick={handleSignIn} disabled={loading}>{t.signUp} <ChevronRight size={16} aria-hidden="true" /></button>
        </p>
        <p className="wl-safe"><ShieldCheck size={17} aria-hidden="true" /> {t.safe}</p>
        <p className="wl-terms">
          {t.terms[0]}<b>{t.terms[1]}</b>{t.terms[2]}<b>{t.terms[3]}</b>.
        </p>
      </div>

      <svg className="wl-wave" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 30C70 8 130 8 200 30s130 22 200 0v50H0z" fill="#BFDBFE" />
        <path d="M0 46C80 24 140 28 210 48s120 14 190-4v36H0z" fill="#3B82F6" />
        <path d="M0 62C90 44 150 50 220 64s120 8 180-6v22H0z" fill="#1D4ED8" />
      </svg>
    </div>
  );
}
