import { useState } from "react";
import { Bell, BookOpen, CalendarDays, ChevronRight, ClipboardCheck, ClipboardList, CreditCard, Megaphone, MessageSquare, Percent, Star, User, type LucideIcon } from "lucide-react";
import { QuickAccess, Section, SectionTitle, Sq, StatTile, TopBar, cssVar } from "@/components/dashboard/parts";
import { useLang } from "@/hooks/useLang";
import couple from "@/assets/couple.webp";
import aiman from "@/assets/aiman.webp";
import danish from "@/assets/danish.webp";

// NOTE: children, counts and events are SAMPLE data. Real child profiles come with the parent-child management phase.
interface Kid { name: string; img: string; levelEn: string; cls: string; school: string; plEn: string; plMs: string; classes: number; tasks: number; progress: number; bg: string; pb: string; pc: string }
const KIDS: Kid[] = [
  { name: "Aiman Hakimi", img: aiman, levelEn: "Year 3", cls: "Cemerlang", school: "SK Taman Sinar", plEn: "Primary Student", plMs: "Murid Sekolah Rendah", classes: 3, tasks: 1, progress: 88, bg: "#EAF2FF", pb: "#DBEAFE", pc: "#2347C5" },
  { name: "Danish Hakim", img: danish, levelEn: "Form 2", cls: "Bestari", school: "SMK Sejahtera", plEn: "Secondary Student", plMs: "Pelajar Menengah", classes: 2, tasks: 2, progress: 76, bg: "#F0EBFF", pb: "#E4DCFB", pc: "#5B3FC4" },
];

interface Upcoming { who: 0 | 1 | 2; day: string; icon: LucideIcon; bg: string; c: string; en: string; ms: string; name: string; sub: [string, string] }
const UPCOMING: Upcoming[] = [
  { who: 0, day: "21", icon: BookOpen, bg: "#E4EDFF", c: "#2F6FE4", en: "Parent-Teacher Meeting", ms: "Mesyuarat Ibu Bapa-Guru", name: "Aiman Hakimi", sub: ["SK Taman Sinar • 10:00 AM", "SK Taman Sinar • 10:00 pagi"] },
  { who: 1, day: "23", icon: ClipboardList, bg: "#EDE7FF", c: "#7C5CE0", en: "Science Project Due", ms: "Projek Sains Perlu Dihantar", name: "Danish Hakim", sub: ["SMK Sejahtera • All Day", "SMK Sejahtera • Sepanjang Hari"] },
  { who: 2, day: "24", icon: Bell, bg: "#FFF3CF", c: "#E0A000", en: "Sports Day", ms: "Hari Sukan", name: "Aiman & Danish", sub: ["School Event • 8:00 AM", "Acara Sekolah • 8:00 pagi"] },
];

type Filter = "all" | 0 | 1;

export default function ParentDashboard() {
  const { L, level } = useLang();
  const [filter, setFilter] = useState<Filter>("all");
  const selected = filter === "all" ? KIDS : [KIDS[filter]];
  const sum = (k: "classes" | "tasks") => selected.reduce((a, x) => a + x[k], 0);
  const avg = Math.round(selected.reduce((a, x) => a + x.progress, 0) / selected.length);
  const upcoming = UPCOMING.filter((u) => filter === "all" || u.who === filter || u.who === 2);
  const month = L("MAY", "MEI");

  return (
    <div className="dsh par">
      <div className="hd">
        <div className="blob" />
        <TopBar left="menu" />
        <div className="hb">
          <div className="gt">
            <div className="g1">{L("Good Morning,", "Selamat Pagi,")}</div>
            <div className="g2">{L("Parent", "Ibu Bapa")} <span aria-hidden="true">👋</span></div>
            <p>{L("Stay informed and support your children's school journey.", "Sentiasa peka dan sokong perjalanan persekolahan anak anda.")}</p>
          </div>
          <img className="hero" style={cssVar("--h", "200px")} src={couple} alt="" />
        </div>
      </div>

      <Section className="up">
        <SectionTitle title={L("My Children", "Anak-anak Saya")} action={L("View All", "Lihat Semua")} />
        <div className="fl" role="group" aria-label={L("Filter by child", "Tapis mengikut anak")}>
          <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>{L("All", "Semua")}</button>
          {KIDS.map((k, i) => (
            <button key={k.name} type="button" aria-pressed={filter === i} onClick={() => setFilter(i as 0 | 1)}>{k.name.split(" ")[0]}</button>
          ))}
        </div>
        {selected.map((k) => (
          <div key={k.name} className="kc" style={{ background: k.bg }}>
            <div className="kt">
              <img className="kav" src={k.img} alt="" />
              <div className="tn">
                <b>{k.name}</b>
                <span className="pl" style={{ background: k.pb, color: k.pc }}>{L(k.plEn, k.plMs)}</span>
                <div className="ks">{level(k.levelEn)} • {L("Class", "Kelas")} {k.cls}</div>
                <div className="ks">{k.school}</div>
              </div>
              <ChevronRight size={20} aria-hidden="true" />
            </div>
            <div className="km">
              <span><b>{k.classes}</b>{L("Classes today", "Kelas hari ini")}</span>
              <span><b>{k.tasks}</b>{L("Pending tasks", "Tugasan belum siap")}</span>
              <span><b>{k.progress}%</b>{L("Progress", "Kemajuan")}</span>
            </div>
            <div className="pb" aria-hidden="true"><i style={{ width: `${k.progress}%`, background: k.pc }} /></div>
          </div>
        ))}
      </Section>

      <Section>
        <SectionTitle title={L("Overview", "Ringkasan")} />
        <div className="sg">
          <StatTile icon={CalendarDays} bg="#EAF2FF" ib="#2F6FE4" num={sum("classes")} label={L("Today's Classes", "Kelas Hari Ini")} sub={filter === "all" ? L("Across 2 children", "Merentas 2 anak") : selected[0].name.split(" ")[0]} />
          <StatTile icon={ClipboardCheck} bg="#E8F8EF" ib="#22A35A" num={sum("tasks")} label={L("Pending Tasks", "Tugasan Belum Siap")} sub={L("Need attention", "Perlu perhatian")} />
          <StatTile icon={Megaphone} bg="#F0EBFF" ib="#7C5CE0" num={2} label={L("New Announcements", "Pengumuman Baharu")} sub={L("From school", "Daripada sekolah")} />
          <StatTile icon={Star} bg="#FFF6E0" ib="#E8A400" num={`${avg}%`} label={L("Overall Progress", "Kemajuan Keseluruhan")} sub={L("This week", "Minggu ini")} />
        </div>
      </Section>

      <Section>
        <SectionTitle title={L("Upcoming", "Akan Datang")} action={L("View Calendar", "Lihat Kalendar")} />
        {upcoming.map((u) => (
          <div key={u.en} className="li">
            <div className="db"><i>{month}</i><span>{u.day}</span></div>
            <Sq icon={u.icon} bg={u.bg} color={u.c} />
            <div className="tn">
              <b>{L(u.en, u.ms)}</b>
              <small>{u.name}</small>
              <small>{L(u.sub[0], u.sub[1])}</small>
            </div>
            <ChevronRight size={20} aria-hidden="true" />
          </div>
        ))}
      </Section>

      <Section>
        <SectionTitle title={L("Quick Access", "Pintasan Pantas")} />
        <QuickAccess
          items={[
            { icon: User, label: L("Attendance", "Kehadiran"), bg: "#EAF2FF", ib: "#2F6FE4" },
            { icon: ClipboardCheck, label: L("Homework", "Kerja Sekolah"), bg: "#E8F8EF", ib: "#22A35A" },
            { icon: Percent, label: L("Exam Results", "Keputusan Peperiksaan"), bg: "#F0EBFF", ib: "#7C5CE0" },
            { icon: CreditCard, label: L("Fees & Payments", "Yuran & Bayaran"), bg: "#FFF6E0", ib: "#E8A400" },
            { icon: MessageSquare, label: L("Messages", "Mesej"), bg: "#EAF2FF", ib: "#2F6FE4" },
          ]}
        />
      </Section>
    </div>
  );
}
