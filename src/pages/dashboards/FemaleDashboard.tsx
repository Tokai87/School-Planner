import { useNavigate } from "react-router-dom";
import { Bell, CalendarDays, ChevronRight, ClipboardList, Flower2, Library, Settings, Sparkles, StickyNote, Umbrella, type LucideIcon } from "lucide-react";
import { LangToggle } from "@/components/ui/LangToggle";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { usePlanner } from "@/hooks/usePlanner";
import { heroFor } from "@/lib/hero";
import { hhmm, subjectIcon, tint } from "@/lib/planner";
import { hasAlerts, todayRows } from "@/lib/today";

export default function FemaleDashboard() {
  const { profile } = useAuth();
  const { lang, L } = useLang();
  const { data } = usePlanner();
  const navigate = useNavigate();
  if (!profile) return null;
  const secondary = profile.role === "secondary_student";
  const rows = todayRows(data);
  const first = profile.full_name.split(" ")[0];
  const hour = new Date().getHours();
  const hello = hour < 12 ? L("Good morning", "Selamat pagi") : hour < 15 ? L("Good afternoon", "Selamat tengah hari") : hour < 19 ? L("Good evening", "Selamat petang") : L("Good night", "Selamat malam");
  const date = new Date().toLocaleDateString(lang === "ms" ? "ms-MY" : "en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const hero = heroFor(profile.role, profile.gender);
  const Badge = secondary ? Sparkles : Flower2;

  const quick: Array<{ icon: LucideIcon; en: string; ms: string; bg: string; c: string; to: string }> = [
    { icon: Library, en: "Subjects", ms: "Subjek", bg: "#FFE3EC", c: "#E8508A", to: "/subjects" },
    secondary
      ? { icon: ClipboardList, en: "Tasks", ms: "Tugasan", bg: "#E4EBFF", c: "#4A6CE0", to: "/tasks" }
      : { icon: Umbrella, en: "Holidays", ms: "Cuti", bg: "#EBE0FB", c: "#8E63D6", to: "/calendar" },
    { icon: StickyNote, en: "Notes", ms: "Nota", bg: "#FFF1B8", c: "#D99A00", to: "/notes" },
    { icon: Settings, en: "Settings", ms: "Tetapan", bg: "#D1F2E6", c: "#1E9E7A", to: "/settings" },
  ];

  return (
    <div className={`dsh fd ${secondary ? "sec" : "pri"}`}>
      <div className="fd-top">
        <LangToggle />
        <button type="button" className="fd-bell" aria-label={L("Notifications", "Notifikasi")} onClick={() => navigate("/alerts")}>
          <Bell size={22} aria-hidden="true" />
          {hasAlerts(data, true) && <i className="rd" />}
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
        {rows.length === 0 ? (
          <p className="fd-empty">{data.timetable_entries.length === 0 ? L("No timetable yet. Add your classes to see them here.", "Belum ada jadual. Tambah kelas anda untuk lihat di sini.") : L("No classes today. Enjoy your day!", "Tiada kelas hari ini. Selamat berehat!")}</p>
        ) : (
          <ul className="fd-list">
            {rows.map(({ entry, subject, now }) => {
              const color = subject?.color ?? "#E8508A";
              const Icon = subjectIcon(subject?.name ?? "");
              return (
                <li key={entry.id}>
                  <button type="button" className="fd-row" onClick={() => navigate("/timetable")}>
                    <span className="fd-time">{hhmm(entry.start_time)}</span>
                    <span className="fd-ico" style={{ background: tint(color), color }}><Icon size={20} aria-hidden="true" /></span>
                    <b>{subject?.name ?? "—"}{now && <em className="fd-now">{L("Now", "Kini")}</em>}</b>
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <button type="button" className="fd-cta" onClick={() => navigate(data.timetable_entries.length ? "/timetable" : data.subjects.length ? "/timetable?new=1" : "/subjects")}>
          {data.timetable_entries.length === 0 ? L("Add Your Timetable", "Tambah Jadual Anda") : L("View Full Timetable", "Lihat Jadual Penuh")}
        </button>
      </section>

      <div className="fd-quick">
        {quick.map(({ icon: Icon, en, ms, bg, c, to }) => (
          <button key={en} type="button" onClick={() => navigate(to)}>
            <span style={{ background: bg, color: c }}><Icon size={26} aria-hidden="true" /></span>
            {L(en, ms)}
          </button>
        ))}
      </div>
    </div>
  );
}
