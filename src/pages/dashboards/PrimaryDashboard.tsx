import { Backpack, BookOpen, Calculator, CalendarDays, Check, ClipboardList, FileText, FlaskConical, type LucideIcon } from "lucide-react";
import { QuickAccess, Section, SectionTitle, Sq, StatTile, TopBar, Hero } from "@/components/dashboard/parts";
import FemaleDashboard from "./FemaleDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { heroFor } from "@/lib/hero";

// NOTE: timetable, counts and bag contents are SAMPLE data until the timetable/homework modules are built.
interface Row { icon: LucideIcon; ib: string; bg: string; en: string; ms: string; from: string; to: string; ap: "AM" | "PM"; now?: boolean }
const ROWS: Row[] = [
  { icon: Calculator, ib: "#3AA0E8", bg: "#DDF0FD", en: "Mathematics", ms: "Matematik", from: "8:00", to: "9:00", ap: "AM" },
  { icon: FlaskConical, ib: "#22A35A", bg: "#DDF6E8", en: "Science", ms: "Sains", from: "9:00", to: "10:00", ap: "AM", now: true },
  { icon: FileText, ib: "#E8A400", bg: "#FFF1C2", en: "Bahasa Malaysia", ms: "Bahasa Malaysia", from: "10:15", to: "11:00", ap: "AM" },
  { icon: BookOpen, ib: "#7C5CE0", bg: "#E9E3FF", en: "English", ms: "Bahasa Inggeris", from: "11:15", to: "12:00", ap: "PM" },
];
const BAG: Array<[string, string]> = [["Mathematics", "Matematik"], ["Bahasa Malaysia", "Bahasa Malaysia"], ["Science", "Sains"], ["English", "Bahasa Inggeris"]];

export default function PrimaryDashboard() {
  const { profile } = useAuth();
  const { L, level, session } = useLang();
  if (!profile) return null;
  if (profile.gender === "female") return <FemaleDashboard />;
  const first = profile.full_name.split(" ")[0];
  const ap = (v: "AM" | "PM") => (v === "AM" ? L("AM", "pagi") : L("PM", "tengah hari"));

  return (
    <div className="dsh pri">
      <div className="hd">
        <TopBar left="settings" bell={false} />
        <div className="hb">
          <div className="gt">
            <div className="g2" style={{ color: "#0F2A6B", fontSize: "clamp(24px,7vw,28px)" }}>
              {L("Welcome Back,", "Selamat Kembali,")}<br />{first}!
            </div>
            <p style={{ color: "#0F2A6B", opacity: 1 }}>
              {profile.school_name}<br />{level(profile.school_level)} - {profile.class_name}
            </p>
          </div>
          <Hero src={heroFor(profile.role, profile.gender)} height="236px" icon={Backpack} />
        </div>
      </div>

      <Section className="up">
        <div className="sg">
          <StatTile icon={CalendarDays} bg="#DDF0FD" ib="#3AA0E8" num={5} label={L("Classes", "Kelas")} sub={L("Today", "Hari ini")} />
          <StatTile icon={BookOpen} bg="#DDF6E8" ib="#22A35A" num={8} label={L("Subjects", "Subjek")} sub={L("This Term", "Penggal ini")} />
          <StatTile icon={ClipboardList} bg="#FFE4EA" ib="#F0587A" num={2} label={L("Homework", "Kerja Sekolah")} sub={L("Not done yet", "Belum siap")} />
          <StatTile icon={FileText} bg="#EDE5FF" ib="#7C5CE0" num={1} label={L("Exams", "Peperiksaan")} sub={L("Coming up", "Akan datang")} />
        </div>
      </Section>

      <Section>
        <SectionTitle title={L("Today's Timetable", "Jadual Hari Ini")} />
        <p className="sub">
          {L(`${session(profile.school_session)} Session`, `Sesi ${session(profile.school_session)}`)} · 8:00 {ap("AM")} - 1:00 {ap("PM")}
        </p>
        {ROWS.map((r) => (
          <div key={r.en} className="pr" style={{ background: r.bg }}>
            <Sq icon={r.icon} bg={r.ib} color="#fff" />
            <div className="tn">
              <b>{L(r.en, r.ms)}</b>
              <small>{r.from} - {r.to} {ap(r.ap)} · {L("Room", "Bilik")} 3A</small>
            </div>
            {r.now && <span className="rc nw">{L("Now", "Kini")}</span>}
          </div>
        ))}
      </Section>

      <Section>
        <SectionTitle title={L("Tomorrow's School Bag", "Beg Sekolah Esok")} />
        <div className="bagr">
          <span className="bagi" aria-hidden="true">🎒</span>
          <div className="chips">
            {BAG.map(([en, ms]) => (
              <span key={en} className="chip"><Check size={16} aria-hidden="true" /> {L(en, ms)}</span>
            ))}
          </div>
        </div>
        <span className="bdg">{L("Don't forget!", "Jangan lupa!")}</span>
      </Section>

      <Section>
        <SectionTitle title={L("Quick Access", "Pintasan Pantas")} />
        <QuickAccess
          items={[
            { icon: ClipboardList, label: L("Homework", "Kerja Sekolah"), bg: "#DDF0FD", ib: "#3AA0E8" },
            { icon: FileText, label: L("Exams", "Peperiksaan"), bg: "#FFF1C2", ib: "#E8A400" },
            { icon: CalendarDays, label: L("Calendar", "Kalendar"), bg: "#DDF6E8", ib: "#22A35A" },
            { icon: Backpack, label: L("School Bag", "Beg Sekolah"), bg: "#E9E3FF", ib: "#7C5CE0" },
          ]}
        />
      </Section>
    </div>
  );
}
