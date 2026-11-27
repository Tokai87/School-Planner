import { useNavigate } from "react-router-dom";
import { BookOpen, CalendarDays, ClipboardCheck, ClipboardList, GraduationCap, Library, Star, StickyNote } from "lucide-react";
import { QuickAccess, Section, SectionTitle, Sq, StatTile, TopBar, Hero } from "@/components/dashboard/parts";
import FemaleDashboard from "./FemaleDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { usePlanner } from "@/hooks/usePlanner";
import { heroFor } from "@/lib/hero";
import { daysUntil, hhmm, subjectIcon, tint } from "@/lib/planner";
import { dueTodayTasks, todayRows, upcomingExams, weekProgress } from "@/lib/today";

export default function SecondaryDashboard() {
  const { profile } = useAuth();
  const { lang, L } = useLang();
  const { data } = usePlanner();
  const navigate = useNavigate();
  if (!profile) return null;
  if (profile.gender === "female") return <FemaleDashboard />;
  const first = profile.full_name.split(" ")[0];
  const date = new Date().toLocaleDateString(lang === "ms" ? "ms-MY" : "en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const hour = new Date().getHours();
  const hello = hour < 12 ? L("Good Morning,", "Selamat Pagi,") : hour < 15 ? L("Good Afternoon,", "Selamat Tengah Hari,") : hour < 19 ? L("Good Evening,", "Selamat Petang,") : L("Good Night,", "Selamat Malam,");
  const rows = todayRows(data);
  const next = upcomingExams(data)[0];
  const left = next ? daysUntil(next.exam_date) : 0;
  const nextSubject = next && data.subjects.find((s) => s.id === next.subject_id);
  const progress = weekProgress(data);
  const none = data.timetable_entries.length === 0;

  return (
    <div className="dsh sec">
      <div className="hd">
        <TopBar left="settings" />
        <div className="hb">
          <div className="gt">
            <div className="g1">{hello}</div>
            <div className="g2">{first}!</div>
            <p>{L("Stay focused and make today count.", "Kekal fokus dan jadikan hari ini bermakna.")}</p>
          </div>
          <Hero src={heroFor(profile.role, profile.gender)} height="250px" icon={GraduationCap} />
        </div>
        <div className="dp"><CalendarDays size={20} aria-hidden="true" /> {date}</div>
      </div>

      <Section style={{ marginTop: 14 }}>
        <div className="sg">
          <StatTile icon={CalendarDays} bg="#EEF3FF" ib="#2F5BD9" num={rows.length} label={L("Classes", "Kelas")} sub={L("Today", "Hari ini")} />
          <StatTile icon={BookOpen} bg="#EAF6F1" ib="#1F8A6B" num={data.subjects.length} label={L("Subjects", "Subjek")} sub={L("This Term", "Penggal ini")} />
          <StatTile icon={ClipboardList} bg="#F1EEFF" ib="#5B54C9" num={dueTodayTasks(data).length} label={L("Tasks", "Tugasan")} sub={L("Due Today", "Akhir hari ini")} />
          <StatTile icon={Star} bg="#FFF6E3" ib="#C98A0A" num={progress === null ? "–" : `${progress}%`} label={L("This Week", "Minggu ini")} sub={L("Progress", "Kemajuan")} />
        </div>
      </Section>

      <Section className="glass">
        {next ? (
          <button type="button" className="cdw cdw-btn" onClick={() => navigate("/exams")}>
            <div>
              <h2>{L("Exam Countdown", "Kiraan Detik Peperiksaan")}</h2>
              <b className="cds">{nextSubject?.name ?? next.title}</b>
              <small>{next.title}</small>
            </div>
            <div className="ring" role="img" aria-label={L(`${left} days left`, `Tinggal ${left} hari`)}>
              <span><div><b>{left}</b>{left === 1 ? L("Day", "Hari") : L("Days", "Hari")}</div></span>
            </div>
          </button>
        ) : (
          <button type="button" className="cdw cdw-btn" onClick={() => navigate("/exams?new=1")}>
            <div>
              <h2>{L("Exam Countdown", "Kiraan Detik Peperiksaan")}</h2>
              <b className="cds">{L("No exams yet", "Tiada peperiksaan lagi")}</b>
              <small>{L("Tap to add one", "Ketik untuk tambah")}</small>
            </div>
          </button>
        )}
      </Section>

      <Section>
        <SectionTitle title={L("Today's Timetable", "Jadual Hari Ini")} action={L("View Full Timetable", "Jadual Penuh")} to="/timetable" />
        {rows.length === 0 ? (
          <button type="button" className="tr tr-empty" onClick={() => navigate(none ? (data.subjects.length ? "/timetable?new=1" : "/subjects") : "/timetable")}>
            {none ? L("No timetable yet. Tap to add your first class.", "Belum ada jadual. Ketik untuk tambah kelas pertama.") : L("No classes today. Enjoy your day!", "Tiada kelas hari ini. Selamat berehat!")}
          </button>
        ) : (
          rows.map(({ entry, subject, now }) => {
            const color = subject?.color ?? "#3B82F6";
            return (
              <div key={entry.id} className="tr">
                <div className="tmm"><b>{hhmm(entry.start_time)}</b>– {hhmm(entry.end_time)}</div>
                <i className="td" style={{ background: color }} />
                <Sq icon={subjectIcon(subject?.name ?? "")} bg={tint(color)} color={color} />
                <div className="tn">
                  <b>{subject?.name ?? "—"}</b>
                  {subject?.teacher && <small>{subject.teacher}</small>}
                </div>
                {now ? <span className="rc nw">{L("Now", "Kini")}</span> : entry.room ? <span className="rc" style={{ background: tint(color), color }}>{entry.room}</span> : null}
              </div>
            );
          })
        )}
      </Section>

      <Section>
        <SectionTitle title={L("Quick Access", "Pintasan Pantas")} />
        <QuickAccess
          items={[
            { icon: ClipboardList, label: L("Homework", "Kerja Sekolah"), bg: "#EEF3FF", ib: "#2F5BD9", to: "/tasks" },
            { icon: ClipboardCheck, label: L("Exams", "Peperiksaan"), bg: "#EAF6F1", ib: "#1F8A6B", to: "/exams" },
            { icon: CalendarDays, label: L("Calendar", "Kalendar"), bg: "#F1EEFF", ib: "#5B54C9", to: "/calendar" },
            { icon: Library, label: L("Subjects", "Subjek"), bg: "#FFF6E3", ib: "#C98A0A", to: "/subjects" },
            { icon: StickyNote, label: L("Notes", "Nota"), bg: "#EEF3FF", ib: "#2F5BD9", to: "/notes" },
          ]}
        />
      </Section>
    </div>
  );
}
