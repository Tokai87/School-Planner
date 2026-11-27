import { useNavigate } from "react-router-dom";
import { CalendarDays, ClipboardList, FileText, Library, PartyPopper, StickyNote, type LucideIcon } from "lucide-react";
import { Sheet } from "@/components/planner/ui";
import { useLang } from "@/hooks/useLang";

const ITEMS: Array<{ to: string; icon: LucideIcon; en: string; ms: string; c: string }> = [
  { to: "/tasks", icon: ClipboardList, en: "Homework", ms: "Kerja sekolah", c: "#F59E0B" },
  { to: "/exams", icon: FileText, en: "Exam", ms: "Peperiksaan", c: "#EF4444" },
  { to: "/timetable", icon: CalendarDays, en: "Class", ms: "Kelas", c: "#3B82F6" },
  { to: "/notes", icon: StickyNote, en: "Note", ms: "Nota", c: "#8B5CF6" },
  { to: "/subjects", icon: Library, en: "Subject", ms: "Subjek", c: "#22A35A" },
  { to: "/calendar", icon: PartyPopper, en: "Event", ms: "Acara", c: "#EC4899" },
];

/** The "+" menu: pick what to add; the target screen opens its form straight away. */
export function AddMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { L } = useLang();
  const navigate = useNavigate();
  return (
    <Sheet open={open} onClose={onClose} title={L("Add new", "Tambah baharu")}>
      <div className="pl-add-grid">
        {ITEMS.map(({ to, icon: Icon, en, ms, c }) => (
          <button key={to} type="button" onClick={() => { onClose(); navigate(`${to}?new=1`); }}>
            <span style={{ background: `${c}26`, color: c }}><Icon size={26} aria-hidden="true" /></span>
            {L(en, ms)}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
