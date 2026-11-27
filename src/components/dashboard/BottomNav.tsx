import { Fragment, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, CalendarDays, CircleUser, ClipboardList, FileText, House, Library, Plus, Users, type LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { AddMenu } from "@/components/planner/AddMenu";
import { dashboardPathFor } from "@/lib/roles";

interface Item { icon: LucideIcon; en: string; ms: string; to?: string }

/** Floating bottom navigation. */
export function BottomNav() {
  const { profile } = useAuth();
  const { L } = useLang();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [addOpen, setAddOpen] = useState(false);
  if (!profile) return null;

  const home = dashboardPathFor(profile.role);
  const femaleStudent = profile.gender === "female" && profile.role !== "parent";
  const items: Item[] = femaleStudent
    ? [
        { icon: House, en: "Home", ms: "Utama", to: home },
        { icon: CalendarDays, en: "Timetable", ms: "Jadual", to: "/timetable" },
        { icon: Library, en: "Subjects", ms: "Subjek", to: "/subjects" },
        { icon: CircleUser, en: "Account", ms: "Akaun", to: "/profile" },
      ]
    : profile.role === "parent"
      ? [
          { icon: House, en: "Dashboard", ms: "Utama", to: home },
          { icon: Users, en: "Children", ms: "Anak-anak", to: "/children" },
          { icon: CalendarDays, en: "Calendar", ms: "Kalendar", to: "/calendar" },
          { icon: Bell, en: "Alerts", ms: "Notifikasi", to: "/alerts" },
          { icon: CircleUser, en: "Profile", ms: "Profil", to: "/profile" },
        ]
      : [
          { icon: House, en: "Home", ms: "Utama", to: home },
          { icon: CalendarDays, en: "Timetable", ms: "Jadual", to: "/timetable" },
          { icon: ClipboardList, en: "Homework", ms: "Tugasan", to: "/tasks" },
          { icon: FileText, en: "Exams", ms: "Peperiksaan", to: "/exams" },
          { icon: CircleUser, en: "Profile", ms: "Profil", to: "/profile" },
        ];

  return (
    <>
    <nav
      className={femaleStudent ? `nav fnav ${profile.role === "secondary_student" ? "sec" : "pri"}` : `nav${profile.role === "secondary_student" ? " dk" : ""}`}
      aria-label={L("Main navigation", "Navigasi utama")}
    >
      {items.map(({ icon: Icon, en, ms, to }, i) => {
        const active = to !== undefined && (pathname === to || (to !== home && pathname.startsWith(`${to}/`)));
        return (
          <Fragment key={en}>
            {femaleStudent && i === 2 && (
              <button type="button" className="fab" aria-label={L("Add new", "Tambah baharu")} aria-haspopup="dialog" onClick={() => setAddOpen(true)}>
                <Plus size={30} aria-hidden="true" />
              </button>
            )}
          <button
            type="button"
            className={active ? "on" : undefined}
            aria-current={active ? "page" : undefined}
            onClick={() => navigate(to ?? home)}
          >
            <Icon size={22} aria-hidden="true" />
            <span>{L(en, ms)}</span>
          </button>
          </Fragment>
        );
      })}
    </nav>
      {femaleStudent && <AddMenu open={addOpen} onClose={() => setAddOpen(false)} />}
    </>
  );
}
