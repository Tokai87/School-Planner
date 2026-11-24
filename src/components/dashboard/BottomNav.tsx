import { Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, CalendarDays, CircleUser, ClipboardList, FileText, House, Library, Plus, Users, type LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { dashboardPathFor } from "@/lib/roles";

interface Item { icon: LucideIcon; en: string; ms: string; to?: string }

/** Floating bottom navigation. Only Home and Profile are routable in this phase; other tabs are placeholders. */
export function BottomNav() {
  const { profile } = useAuth();
  const { L } = useLang();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (!profile) return null;

  const home = dashboardPathFor(profile.role);
  const femaleStudent = profile.gender === "female" && profile.role !== "parent";
  const items: Item[] = femaleStudent
    ? [
        { icon: House, en: "Home", ms: "Utama", to: home },
        { icon: CalendarDays, en: "Timetable", ms: "Jadual" },
        { icon: Library, en: "Subjects", ms: "Subjek" },
        { icon: CircleUser, en: "Account", ms: "Akaun", to: "/profile" },
      ]
    : profile.role === "parent"
      ? [
          { icon: House, en: "Dashboard", ms: "Utama", to: home },
          { icon: Users, en: "Children", ms: "Anak-anak" },
          { icon: CalendarDays, en: "Calendar", ms: "Kalendar" },
          { icon: Bell, en: "Alerts", ms: "Notifikasi" },
          { icon: CircleUser, en: "Profile", ms: "Profil", to: "/profile" },
        ]
      : [
          { icon: House, en: "Home", ms: "Utama", to: home },
          { icon: CalendarDays, en: "Timetable", ms: "Jadual" },
          { icon: ClipboardList, en: "Homework", ms: "Tugasan" },
          { icon: FileText, en: "Exams", ms: "Peperiksaan" },
          { icon: CircleUser, en: "Profile", ms: "Profil", to: "/profile" },
        ];

  return (
    <nav
      className={femaleStudent ? `nav fnav ${profile.role === "secondary_student" ? "sec" : "pri"}` : `nav${profile.role === "secondary_student" ? " dk" : ""}`}
      aria-label={L("Main navigation", "Navigasi utama")}
    >
      {items.map(({ icon: Icon, en, ms, to }, i) => {
        const active = to !== undefined && pathname === to;
        return (
          <Fragment key={en}>
            {femaleStudent && i === 2 && (
              <button type="button" className="fab" aria-label={L("Add", "Tambah")} aria-disabled="true" title={L("Coming soon", "Akan datang")}>
                <Plus size={30} aria-hidden="true" />
              </button>
            )}
          <button
            type="button"
            className={active ? "on" : undefined}
            aria-current={active ? "page" : undefined}
            aria-disabled={to ? undefined : true}
            title={to ? undefined : L("Coming soon", "Akan datang")}
            onClick={() => to && navigate(to)}
          >
            <Icon size={22} aria-hidden="true" />
            <span>{L(en, ms)}</span>
          </button>
          </Fragment>
        );
      })}
    </nav>
  );
}
