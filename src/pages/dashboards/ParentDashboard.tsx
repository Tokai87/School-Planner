import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, CalendarDays, ChevronRight, ClipboardCheck, GraduationCap, Settings, Umbrella, Users, Bell, UserPlus, type LucideIcon } from "lucide-react";
import { QuickAccess, Section, SectionTitle, Sq, StatTile, TopBar, Hero } from "@/components/dashboard/parts";
import { childColor } from "@/pages/planner/ChildrenPage";
import { useLang } from "@/hooks/useLang";
import { heroFor } from "@/lib/hero";
import { useAuth } from "@/hooks/useAuth";
import { usePlanner } from "@/hooks/usePlanner";
import { daysUntil, EVENT_KINDS, fmtDate, fromKey, relativeDay, tint, todayKey } from "@/lib/planner";

const KIND_ICON: Record<string, LucideIcon> = { holiday: Umbrella, event: GraduationCap, meeting: BookOpen, other: Bell };

export default function ParentDashboard() {
  const { profile } = useAuth();
  const { L, lang, level } = useLang();
  const { data } = usePlanner();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("all");
  const kids = data.children;
  const selected = kids.find((k) => k.id === filter);
  const hour = new Date().getHours();
  const hello = hour < 12 ? L("Good Morning,", "Selamat Pagi,") : hour < 15 ? L("Good Afternoon,", "Selamat Tengah Hari,") : hour < 19 ? L("Good Evening,", "Selamat Petang,") : L("Good Night,", "Selamat Malam,");
  const today = todayKey();
  const upcoming = data.events
    .filter((e) => e.event_date >= today && (filter === "all" || !e.child_id || e.child_id === filter))
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
  const nextWeek = upcoming.filter((e) => daysUntil(e.event_date) <= 7).length;
  const holidays = upcoming.filter((e) => e.kind === "holiday").length;

  return (
    <div className="dsh par">
      <div className="hd">
        <div className="blob" />
        <TopBar left="settings" />
        <div className="hb">
          <div className="gt">
            <div className="g1">{hello}</div>
            <div className="g2">{L("Parent", "Ibu Bapa")} <span aria-hidden="true">👋</span></div>
            <p>{L("Stay informed and support your children's school journey.", "Sentiasa peka dan sokong perjalanan persekolahan anak anda.")}</p>
          </div>
          <Hero src={heroFor("parent", profile?.gender)} height="200px" icon={Users} />
        </div>
      </div>

      <Section className="up">
        <SectionTitle title={L("My Children", "Anak-anak Saya")} action={kids.length ? L("View All", "Lihat Semua") : undefined} to="/children" />
        {kids.length === 0 ? (
          <button type="button" className="kc kc-empty" onClick={() => navigate("/children?new=1")}>
            <UserPlus size={26} aria-hidden="true" />
            <b>{L("Add your first child", "Tambah anak pertama anda")}</b>
            <small>{L("Keep their school details and events in one place.", "Simpan butiran sekolah dan acara mereka di satu tempat.")}</small>
          </button>
        ) : (
          <>
            {kids.length > 1 && (
              <div className="fl" role="group" aria-label={L("Filter by child", "Tapis mengikut anak")}>
                <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>{L("All", "Semua")}</button>
                {kids.map((k) => (
                  <button key={k.id} type="button" aria-pressed={filter === k.id} onClick={() => setFilter(k.id)}>{k.full_name.split(" ")[0]}</button>
                ))}
              </div>
            )}
            {(selected ? [selected] : kids).map((k) => {
              const c = childColor(k);
              const evs = data.events.filter((e) => e.child_id === k.id && e.event_date >= today).length;
              return (
                <button key={k.id} type="button" className="kc kc-btn" style={{ background: tint(c, 0.1) }} onClick={() => navigate("/children")}>
                  <div className="kt">
                    <span className="kav kav-i" style={{ background: c }}>{k.full_name.trim().charAt(0).toUpperCase()}</span>
                    <div className="tn">
                      <b>{k.full_name}</b>
                      <div className="ks">{[k.school_level && level(k.school_level), k.class_name && `${L("Class", "Kelas")} ${k.class_name}`].filter(Boolean).join(" • ") || L("No class details", "Tiada butiran kelas")}</div>
                      {k.school_name && <div className="ks">{k.school_name}</div>}
                      <span className="pill" style={{ background: tint(c, 0.18), color: c }}>{L(`${evs} upcoming`, `${evs} akan datang`)}</span>
                    </div>
                    <ChevronRight size={20} aria-hidden="true" />
                  </div>
                </button>
              );
            })}
          </>
        )}
      </Section>

      <Section>
        <SectionTitle title={L("Overview", "Ringkasan")} />
        <div className="sg">
          <StatTile icon={Users} bg="#EAF2FF" ib="#2F6FE4" num={kids.length} label={L("Children", "Anak")} sub={L("Added", "Didaftarkan")} />
          <StatTile icon={CalendarDays} bg="#E8F8EF" ib="#22A35A" num={upcoming.length} label={L("Upcoming Events", "Acara Akan Datang")} sub={selected ? selected.full_name.split(" ")[0] : L("All children", "Semua anak")} />
          <StatTile icon={ClipboardCheck} bg="#F0EBFF" ib="#7C5CE0" num={nextWeek} label={L("This Week", "Minggu Ini")} sub={L("Next 7 days", "7 hari akan datang")} />
          <StatTile icon={Umbrella} bg="#FFF6E0" ib="#E8A400" num={holidays} label={L("Holidays", "Cuti")} sub={L("Coming up", "Akan datang")} />
        </div>
      </Section>

      <Section>
        <SectionTitle title={L("Upcoming", "Akan Datang")} action={L("View Calendar", "Lihat Kalendar")} to="/calendar" />
        {upcoming.length === 0 ? (
          <button type="button" className="li li-empty" onClick={() => navigate("/calendar?new=1")}>
            {L("Nothing coming up. Tap to add a school event or holiday.", "Tiada acara. Ketik untuk tambah acara sekolah atau cuti.")}
          </button>
        ) : (
          upcoming.slice(0, 4).map((e) => {
            const kind = EVENT_KINDS.find((k) => k.id === e.kind)!;
            const who = kids.find((k) => k.id === e.child_id);
            const d = fromKey(e.event_date);
            return (
              <button key={e.id} type="button" className="li li-btn" onClick={() => navigate("/calendar")}>
                <div className="db"><i>{d.toLocaleDateString(lang === "ms" ? "ms-MY" : "en-GB", { month: "short" }).toUpperCase()}</i><span>{d.getDate()}</span></div>
                <Sq icon={KIND_ICON[e.kind] ?? Bell} bg={tint(kind.color)} color={kind.color} />
                <div className="tn">
                  <b>{e.title}</b>
                  <small>{who ? who.full_name : L("All children", "Semua anak")}</small>
                  <small>{L(kind.en, kind.ms)} • {relativeDay(e.event_date, L)} • {fmtDate(e.event_date, lang)}</small>
                </div>
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            );
          })
        )}
      </Section>

      <Section>
        <SectionTitle title={L("Quick Access", "Pintasan Pantas")} />
        <QuickAccess
          items={[
            { icon: Users, label: L("Children", "Anak-anak"), bg: "#EAF2FF", ib: "#2F6FE4", to: "/children" },
            { icon: CalendarDays, label: L("Calendar", "Kalendar"), bg: "#E8F8EF", ib: "#22A35A", to: "/calendar" },
            { icon: Bell, label: L("Alerts", "Notifikasi"), bg: "#F0EBFF", ib: "#7C5CE0", to: "/alerts" },
            { icon: Settings, label: L("Settings", "Tetapan"), bg: "#FFF6E0", ib: "#E8A400", to: "/settings" },
          ]}
        />
      </Section>
    </div>
  );
}
