import { useNavigate } from "react-router-dom";
import { Backpack, BookOpen, CalendarDays, Check, ClipboardList, FileText, StickyNote } from "lucide-react";
import { QuickAccess, Section, SectionTitle, Sq, StatTile, TopBar, Hero } from "@/components/dashboard/parts";
import FemaleDashboard from "./FemaleDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { usePlanner } from "@/hooks/usePlanner";
import { heroFor } from "@/lib/hero";
import { hhmm, subjectIcon, tint } from "@/lib/planner";
import { pendingTasks, todayRows, tomorrowSubjects, upcomingExams } from "@/lib/today";

export default function PrimaryDashboard() {
  const { profile } = useAuth();
  const { L, level, session } = useLang();
  const { data } = usePlanner();
  const navigate = useNavigate();
  if (!profile) return null;
  if (profile.gender === "female") return <FemaleDashboard />;
  const first = profile.full_name.split(" ")[0];
  const rows = todayRows(data);
  const bag = tomorrowSubjects(data);
  const none = data.timetable_entries.length === 0;

  return (
    <div className="dsh pri">
      <div className="hd">
        <TopBar left="settings" />
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
          <StatTile icon={CalendarDays} bg="#DDF0FD" ib="#3AA0E8" num={rows.length} label={L("Classes", "Kelas")} sub={L("Today", "Hari ini")} />
          <StatTile icon={BookOpen} bg="#DDF6E8" ib="#22A35A" num={data.subjects.length} label={L("Subjects", "Subjek")} sub={L("This Term", "Penggal ini")} />
          <StatTile icon={ClipboardList} bg="#FFE4EA" ib="#F0587A" num={pendingTasks(data).length} label={L("Homework", "Kerja Sekolah")} sub={L("Not done yet", "Belum siap")} />
          <StatTile icon={FileText} bg="#EDE5FF" ib="#7C5CE0" num={upcomingExams(data).length} label={L("Exams", "Peperiksaan")} sub={L("Coming up", "Akan datang")} />
        </div>
      </Section>

      <Section>
        <SectionTitle title={L("Today's Timetable", "Jadual Hari Ini")} action={L("Full", "Penuh")} to="/timetable" />
        <p className="sub">{L(`${session(profile.school_session)} Session`, `Sesi ${session(profile.school_session)}`)}</p>
        {rows.length === 0 ? (
          <button type="button" className="pr pr-empty" onClick={() => navigate(none ? (data.subjects.length ? "/timetable?new=1" : "/subjects") : "/timetable")}>
            {none ? L("No timetable yet. Tap to add your first class.", "Belum ada jadual. Ketik untuk tambah kelas pertama.") : L("No classes today. Enjoy your day!", "Tiada kelas hari ini. Selamat berehat!")}
          </button>
        ) : (
          rows.map(({ entry, subject, now }) => {
            const color = subject?.color ?? "#3AA0E8";
            return (
              <div key={entry.id} className="pr" style={{ background: tint(color, 0.14) }}>
                <Sq icon={subjectIcon(subject?.name ?? "")} bg={color} color="#fff" />
                <div className="tn">
                  <b>{subject?.name ?? "—"}</b>
                  <small>{hhmm(entry.start_time)} - {hhmm(entry.end_time)}{entry.room ? ` · ${L("Room", "Bilik")} ${entry.room}` : ""}</small>
                </div>
                {now && <span className="rc nw">{L("Now", "Kini")}</span>}
              </div>
            );
          })
        )}
      </Section>

      <Section>
        <SectionTitle title={L("Tomorrow's School Bag", "Beg Sekolah Esok")} />
        {bag.length === 0 ? (
          <p className="sub">{L("Nothing scheduled for tomorrow.", "Tiada kelas dijadualkan esok.")}</p>
        ) : (
          <>
            <div className="bagr">
              <span className="bagi" aria-hidden="true">🎒</span>
              <div className="chips">
                {bag.map((s) => (
                  <span key={s.id} className="chip"><Check size={16} aria-hidden="true" /> {s.name}</span>
                ))}
              </div>
            </div>
            <span className="bdg">{L("Don't forget!", "Jangan lupa!")}</span>
          </>
        )}
      </Section>

      <Section>
        <SectionTitle title={L("Quick Access", "Pintasan Pantas")} />
        <QuickAccess
          items={[
            { icon: ClipboardList, label: L("Homework", "Kerja Sekolah"), bg: "#DDF0FD", ib: "#3AA0E8", to: "/tasks" },
            { icon: FileText, label: L("Exams", "Peperiksaan"), bg: "#FFF1C2", ib: "#E8A400", to: "/exams" },
            { icon: CalendarDays, label: L("Calendar", "Kalendar"), bg: "#DDF6E8", ib: "#22A35A", to: "/calendar" },
            { icon: StickyNote, label: L("Notes", "Nota"), bg: "#E9E3FF", ib: "#7C5CE0", to: "/notes" },
          ]}
        />
      </Section>
    </div>
  );
}
