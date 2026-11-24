import { Bell, BookOpen, Calculator, CalendarDays, ChevronRight, ClipboardList, FlaskConical, Flower2, Landmark, Languages, Library, Settings, Sparkles, StickyNote, Umbrella, Atom, type LucideIcon } from "lucide-react";
import { LangToggle } from "@/components/ui/LangToggle";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { heroFor } from "@/lib/hero";

// NOTE: the timetable rows are SAMPLE data until the timetable module is built. Subjects / Holidays / Notes are placeholders too.
interface Row { icon: LucideIcon; en: string; ms: string; time: string; tone: string; bg: string }
const PRIMARY_ROWS: Row[] = [
  { icon: BookOpen, en: "Bahasa Melayu", ms: "Bahasa Melayu", time: "08:00", tone: "#E8508A", bg: "#FFE3EC" },
  { icon: Calculator, en: "Mathematics", ms: "Matematik", time: "09:00", tone: "#D99A00", bg: "#FFF1B8" },
  { icon: FlaskConical, en: "Science", ms: "Sains", time: "10:00", tone: "#1E9E7A", bg: "#D1F2E6" },
  { icon: Landmark, en: "Islamic Education", ms: "Pendidikan Islam", time: "11:00", tone: "#8E63D6", bg: "#EBE0FB" },
];
const SECONDARY_ROWS: Row[] = [
  { icon: Calculator, en: "Additional Mathematics", ms: "Matematik Tambahan", time: "08:00", tone: "#8E63D6", bg: "#EBE0FB" },
  { icon: Atom, en: "Physics", ms: "Fizik", time: "09:00", tone: "#3B7DD8", bg: "#DCE8FF" },
  { icon: FlaskConical, en: "Chemistry", ms: "Kimia", time: "10:00", tone: "#1E9E7A", bg: "#D1F2E6" },
  { icon: Languages, en: "English Language", ms: "Bahasa Inggeris", time: "11:00", tone: "#D6527E", bg: "#FFE0EA" },
];

export default function FemaleDashboard() {
  const { profile } = useAuth();
  const { lang, L } = useLang();
  if (!profile) return null;
  const secondary = profile.role === "secondary_student";
  const rows = secondary ? SECONDARY_ROWS : PRIMARY_ROWS;
  const first = profile.full_name.split(" ")[0];
  const hour = new Date().getHours();
  const hello = hour < 12 ? L("Good morning", "Selamat pagi") : hour < 15 ? L("Good afternoon", "Selamat tengah hari") : hour < 19 ? L("Good evening", "Selamat petang") : L("Good night", "Selamat malam");
  const date = new Date().toLocaleDateString(lang === "ms" ? "ms-MY" : "en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const hero = heroFor(profile.role, profile.gender);
  const Badge = secondary ? Sparkles : Flower2;
  const soon = L("Coming soon", "Akan datang");

  const quick: Array<{ icon: LucideIcon; en: string; ms: string; bg: string; c: string }> = [
    { icon: Library, en: "Subjects", ms: "Subjek", bg: "#FFE3EC", c: "#E8508A" },
    secondary
      ? { icon: ClipboardList, en: "Tasks", ms: "Tugasan", bg: "#E4EBFF", c: "#4A6CE0" }
      : { icon: Umbrella, en: "Holidays", ms: "Cuti", bg: "#EBE0FB", c: "#8E63D6" },
    { icon: StickyNote, en: "Notes", ms: "Nota", bg: "#FFF1B8", c: "#D99A00" },
    { icon: Settings, en: "Settings", ms: "Tetapan", bg: "#D1F2E6", c: "#1E9E7A" },
  ];

  return (
    <div className={`dsh fd ${secondary ? "sec" : "pri"}`}>
      <div className="fd-top">
        <LangToggle />
        <button type="button" className="fd-bell" aria-label={L("Notifications", "Notifikasi")}>
          <Bell size={22} aria-hidden="true" />
        </button>
      </div>

      <div className="fd-hello">
        <div>
          <h1>{L(`Hi, ${first}!`, `Hai, ${first}!`)} <span aria-hidden="true">{secondary ? "💜" : "🌸"}</span></h1>
          <p>{hello}</p>
          <p className="fd-school">{profile.school_name}</p>
        </div>
        {hero ? <img className="fd-hero" src={hero} alt="" /> : <div className="fd-fb" aria-hidden="true"><Badge size={54} strokeWidth={1.5} /></div>}
      </div>

      <section className="fd-card">
        <div className="fd-ct">
          <div>
            <h2>{L("Today's Timetable", "Jadual Hari Ini")}</h2>
            <small>{date}</small>
          </div>
          <span className="fd-ci" aria-hidden="true"><CalendarDays size={22} /></span>
        </div>
        <ul className="fd-list">
          {rows.map((r) => (
            <li key={r.en} className="fd-row">
              <span className="fd-time">{r.time}</span>
              <span className="fd-ico" style={{ background: r.bg, color: r.tone }}><r.icon size={20} aria-hidden="true" /></span>
              <b>{L(r.en, r.ms)}</b>
              <ChevronRight size={18} aria-hidden="true" />
            </li>
          ))}
        </ul>
        <button type="button" className="fd-cta" aria-disabled="true" title={soon}>{L("View Full Timetable", "Lihat Jadual Penuh")}</button>
      </section>

      <div className="fd-quick">
        {quick.map(({ icon: Icon, en, ms, bg, c }) => (
          <button key={en} type="button" aria-disabled="true" title={soon}>
            <span style={{ background: bg, color: c }}><Icon size={26} aria-hidden="true" /></span>
            {L(en, ms)}
          </button>
        ))}
      </div>
    </div>
  );
}
