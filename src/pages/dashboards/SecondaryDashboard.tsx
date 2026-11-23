import { Backpack, BookOpen, Calculator, CalendarDays, ClipboardCheck, ClipboardList, FlaskConical, Globe, MessageSquare, Monitor, Star, type LucideIcon } from "lucide-react";
import { QuickAccess, Section, SectionTitle, Sq, StatTile, TopBar, cssVar } from "@/components/dashboard/parts";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import student from "@/assets/student.webp";

// NOTE: timetable, counts and countdown are SAMPLE data until the timetable/exam modules are built.
interface Row { icon: LucideIcon; bg: string; c: string; en: string; ms: string; teacher: string; from: string; to: string; roomEn: string; roomMs: string; rb: string; rc: string; dot: string }
const ROWS: Row[] = [
  { icon: Calculator, bg: "#E4EDFF", c: "#2F5BD9", en: "Mathematics", ms: "Matematik", teacher: "Mr. Lim", from: "8:00", to: "8:50", roomEn: "Room 2A", roomMs: "Bilik 2A", rb: "#DBEAFE", rc: "#2347C5", dot: "#3B82F6" },
  { icon: FlaskConical, bg: "#DDF1E9", c: "#1F8A6B", en: "Chemistry", ms: "Kimia", teacher: "Ms. Aisyah", from: "9:00", to: "9:50", roomEn: "Lab 1", roomMs: "Makmal 1", rb: "#DDF1E9", rc: "#15704F", dot: "#22C55E" },
  { icon: BookOpen, bg: "#ECE8FF", c: "#5B54C9", en: "English Language", ms: "Bahasa Inggeris", teacher: "Mr. Tan", from: "10:15", to: "11:05", roomEn: "Room 3B", roomMs: "Bilik 3B", rb: "#E9E3FF", rc: "#4B3FB4", dot: "#7C5CE0" },
  { icon: Globe, bg: "#FFF3CF", c: "#C98A0A", en: "History", ms: "Sejarah", teacher: "Mr. Rahman", from: "11:15", to: "12:05", roomEn: "Room 1C", roomMs: "Bilik 1C", rb: "#FFF1C2", rc: "#9A6A00", dot: "#F5B50A" },
  { icon: Monitor, bg: "#E4EDFF", c: "#2F5BD9", en: "Information Technology", ms: "Sains Komputer", teacher: "Mr. Hakim", from: "2:15", to: "3:05", roomEn: "Computer Lab", roomMs: "Makmal Komputer", rb: "#DBEAFE", rc: "#2347C5", dot: "#3B82F6" },
];

export default function SecondaryDashboard() {
  const { profile } = useAuth();
  const { lang, L } = useLang();
  if (!profile) return null;
  const first = profile.full_name.split(" ")[0];
  const date = new Date().toLocaleDateString(lang === "ms" ? "ms-MY" : "en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="dsh sec">
      <div className="hd">
        <TopBar left="menu" />
        <div className="hb">
          <div className="gt">
            <div className="g1">{L("Good Morning,", "Selamat Pagi,")}</div>
            <div className="g2">{first}!</div>
            <p>{L("Stay focused and make today count.", "Kekal fokus dan jadikan hari ini bermakna.")}</p>
          </div>
          <img className="hero" style={cssVar("--h", "250px")} src={student} alt="" />
        </div>
        <div className="dp"><CalendarDays size={20} aria-hidden="true" /> {date}</div>
      </div>

      <Section style={{ marginTop: 14 }}>
        <div className="sg">
          <StatTile icon={CalendarDays} bg="#EEF3FF" ib="#2F5BD9" num={5} label={L("Classes", "Kelas")} sub={L("Today", "Hari ini")} />
          <StatTile icon={BookOpen} bg="#EAF6F1" ib="#1F8A6B" num={8} label={L("Subjects", "Subjek")} sub={L("This Term", "Penggal ini")} />
          <StatTile icon={ClipboardList} bg="#F1EEFF" ib="#5B54C9" num={3} label={L("Tasks", "Tugasan")} sub={L("Due Today", "Akhir hari ini")} />
          <StatTile icon={Star} bg="#FFF6E3" ib="#C98A0A" num="82%" label={L("This Week", "Minggu ini")} sub={L("Progress", "Kemajuan")} />
        </div>
      </Section>

      <Section className="glass">
        <div className="cdw">
          <div>
            <h2>{L("Exam Countdown", "Kiraan Detik Peperiksaan")}</h2>
            <b className="cds">{L("Mathematics", "Matematik")}</b>
            <small>{L("Final Term Exam", "Peperiksaan Akhir")}</small>
          </div>
          <div className="ring" role="img" aria-label={L("6 days left", "Tinggal 6 hari")}>
            <span><div><b>6</b>{L("Days", "Hari")}</div></span>
          </div>
        </div>
      </Section>

      <Section>
        <SectionTitle title={L("Today's Timetable", "Jadual Hari Ini")} action={L("View Full Timetable", "Jadual Penuh")} />
        {ROWS.map((r) => (
          <div key={r.en} className="tr">
            <div className="tmm"><b>{r.from}</b>– {r.to}</div>
            <i className="td" style={{ background: r.dot }} />
            <Sq icon={r.icon} bg={r.bg} color={r.c} />
            <div className="tn">
              <b>{L(r.en, r.ms)}</b>
              <small>{r.teacher}</small>
            </div>
            <span className="rc" style={{ background: r.rb, color: r.rc }}>{L(r.roomEn, r.roomMs)}</span>
          </div>
        ))}
      </Section>

      <Section>
        <SectionTitle title={L("Quick Access", "Pintasan Pantas")} action={L("Edit", "Ubah")} />
        <QuickAccess
          items={[
            { icon: ClipboardList, label: L("Homework", "Kerja Sekolah"), bg: "#EEF3FF", ib: "#2F5BD9" },
            { icon: ClipboardCheck, label: L("Exams", "Peperiksaan"), bg: "#EAF6F1", ib: "#1F8A6B" },
            { icon: CalendarDays, label: L("Calendar", "Kalendar"), bg: "#F1EEFF", ib: "#5B54C9" },
            { icon: Backpack, label: L("School Bag", "Beg Sekolah"), bg: "#FFF6E3", ib: "#C98A0A" },
            { icon: MessageSquare, label: L("Announcements", "Pengumuman"), bg: "#EEF3FF", ib: "#2F5BD9" },
          ]}
        />
      </Section>
    </div>
  );
}
