import { useState } from "react";
import {
  Backpack, BookOpen, CalendarCheck, CalendarDays, ChevronDown, ClipboardCheck, ClipboardList, FileText, Globe, ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { AppIcon } from "@/components/auth/AppIcon";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { SchoolSilhouette } from "@/components/auth/SchoolSilhouette";
import { signInWithGoogle } from "@/services/authService";
import { logError, toFriendlyMessage } from "@/lib/errors";
import { useLang } from "@/hooks/useLang";
import type { Lang } from "@/lib/lang";
import kids from "@/assets/kids.webp";

const COPY = {
  en: {
    name: "English",
    intro: "Manage your timetable, homework, exams and school activities in one place.",
    cta: "Continue with Google",
    connecting: "Connecting to Google…",
    safe: "Safe. Secure. Your data is protected.",
    terms: ["By continuing, you agree to our ", "Terms of Service", " and ", "Privacy Policy"],
    features: [
      ["Timetable", "Your daily classes at a glance"],
      ["Homework", "Stay on top of your assignments"],
      ["Exams", "Prepare well and achieve your best"],
      ["Calendar", "Never miss important dates"],
      ["School Bag", "Pack smart for tomorrow"],
    ],
  },
  ms: {
    name: "Bahasa Melayu",
    intro: "Urus jadual, kerja sekolah, peperiksaan dan aktiviti sekolah di satu tempat.",
    cta: "Teruskan dengan Google",
    connecting: "Menyambung ke Google…",
    safe: "Selamat. Data anda dilindungi.",
    terms: ["Dengan meneruskan, anda bersetuju dengan ", "Syarat Perkhidmatan", " dan ", "Dasar Privasi"],
    features: [
      ["Jadual", "Kelas harian anda sekilas pandang"],
      ["Kerja Sekolah", "Sentiasa peka dengan tugasan anda"],
      ["Peperiksaan", "Bersedia dan capai yang terbaik"],
      ["Kalendar", "Jangan terlepas tarikh penting"],
      ["Beg Sekolah", "Sediakan beg untuk esok"],
    ],
  },
} as const;

const FEATURE_ICONS: Array<{ Icon: LucideIcon; color: string }> = [
  { Icon: CalendarDays, color: "#4C7BEA" },
  { Icon: ClipboardCheck, color: "#2FA66A" },
  { Icon: BookOpen, color: "#7C5CE0" },
  { Icon: CalendarCheck, color: "#F2A900" },
  { Icon: Backpack, color: "#2FB59A" },
];

const FLOATING: Array<{ Icon: LucideIcon; color: string; pos: string; rot: number }> = [
  { Icon: CalendarDays, color: "#4C7BEA", pos: "left-[-4px] top-10", rot: -6 },
  { Icon: ClipboardList, color: "#7C5CE0", pos: "left-1 top-32", rot: 10 },
  { Icon: FileText, color: "#F2A900", pos: "right-[-2px] top-14", rot: 8 },
  { Icon: Backpack, color: "#2FB59A", pos: "right-0.5 top-36", rot: -6 },
];

export default function WelcomePage() {
  const { lang, setLang, L } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = COPY[lang];

  async function handleSignIn() {
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
    <div className="relative mx-auto min-h-dvh max-w-md overflow-hidden px-5 pb-10 pt-4" style={{ background: "linear-gradient(180deg,#F4F8FF,#FBFDFF)", color: "#14224E" }}>
      {/* decorative background shapes */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 h-48 w-64 rounded-br-[70%] bg-[#C4D9FA] opacity-80" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-14 top-[400px] h-64 w-28 rounded-r-full bg-[#FFE7A8] opacity-80" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 top-[520px] h-72 w-32 rounded-l-full bg-[#BDEBDD] opacity-80" />
      <div aria-hidden="true" className="pointer-events-none absolute left-[86%] top-[104px] h-7 w-7 rounded-full bg-[#C9BEF5]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-[22%] top-12 h-4 w-4 rounded-full bg-[#8DE3CB]" />

      <label className="absolute right-4 top-4 z-10 flex min-h-11 items-center gap-2 rounded-2xl bg-white px-3 shadow-[0_6px_20px_-10px_#14224E66]">
        <span className="sr-only">Language</span>
        <Globe size={22} aria-hidden="true" />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          className="min-h-11 cursor-pointer appearance-none bg-transparent pr-1 text-[15px] font-medium"
        >
          {(Object.keys(COPY) as Lang[]).map((l) => (
            <option key={l} value={l}>{COPY[l].name}</option>
          ))}
        </select>
        <ChevronDown size={18} aria-hidden="true" />
      </label>

      <header className="relative pt-16 text-center">
        <div className="flex justify-center drop-shadow-[0_12px_16px_#3B5BDB55]"><AppIcon /></div>
        <h1 className="mb-1 mt-3.5 text-[40px] font-bold leading-[1.1]">School Planner</h1>
        <p className="text-[19px] font-medium text-[#3B5BDB]">Your School Life, Organized.</p>
        <p className="mx-auto mt-3.5 max-w-[300px] text-[15.5px] leading-normal text-[#33415F]">{t.intro}</p>
      </header>

      <div className="relative mt-3.5 h-[286px]">
        {FLOATING.map(({ Icon, color, pos, rot }, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`absolute z-[2] grid h-14 w-14 place-items-center rounded-[18px] bg-white shadow-[0_8px_20px_-8px_#14224E66] ${pos}`}
            style={{ color, transform: `rotate(${rot}deg)` }}
          >
            <Icon size={30} />
          </span>
        ))}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-32" style={{ background: "radial-gradient(ellipse at 50% 100%,#CDEBD3,#CDEBD300 70%)" }} />
        <SchoolSilhouette className="absolute bottom-28 left-1/2 w-[250px] -translate-x-1/2" />
        <img src={kids} alt="Three smiling students holding books" className="absolute bottom-0 left-1/2 w-[262px] -translate-x-1/2" />
      </div>

      <ul className="relative z-[2] flex snap-x snap-mandatory overflow-x-auto rounded-3xl bg-white py-3.5 shadow-[0_10px_30px_-14px_#14224E66] [scrollbar-width:none]" aria-label="Features">
        {t.features.map(([title, desc], i) => {
          const { Icon, color } = FEATURE_ICONS[i];
          return (
            <li key={title} className="min-w-[100px] flex-1 snap-start border-r border-[#EDF1F9] px-2 text-center last:border-0">
              <Icon size={36} style={{ color }} className="mx-auto" aria-hidden="true" />
              <b className="mb-0.5 mt-1.5 block font-heading text-[14.5px] font-semibold">{title}</b>
              <small className="block text-xs leading-snug text-[#5A6784]">{desc}</small>
            </li>
          );
        })}
      </ul>

      {error && <div className="mt-4"><Alert>{error}</Alert></div>}

      <div className="mt-5">
        <GoogleButton onClick={handleSignIn} loading={loading} label={t.cta} loadingLabel={t.connecting} />
      </div>
      <p className="mb-2 mt-4 flex items-center justify-center gap-2 text-sm text-[#33415F]">
        <ShieldCheck size={22} className="text-[#2FB59A]" aria-hidden="true" /> {t.safe}
      </p>
      <p className="text-center text-[12.5px] leading-normal text-[#5A6784]">
        {t.terms[0]}<b className="font-semibold text-[#3B5BDB]">{t.terms[1]}</b>{t.terms[2]}<b className="font-semibold text-[#3B5BDB]">{t.terms[3]}</b>.
      </p>
    </div>
  );
}
