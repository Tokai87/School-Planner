import type { CSSProperties, ReactNode } from "react";
import { Bell, ChevronRight, Menu, Settings, type LucideIcon } from "lucide-react";
import { LangToggle } from "@/components/ui/LangToggle";
import { useLang } from "@/hooks/useLang";

export const cssVar = (name: string, value: string) => ({ [name]: value }) as CSSProperties;

export function TopBar({ left, bell = true }: { left: "menu" | "settings"; bell?: boolean }) {
  const { L } = useLang();
  const Left = left === "menu" ? Menu : Settings;
  return (
    <div className="tb">
      <button type="button" className="ib" aria-label={left === "menu" ? "Menu" : L("Settings", "Tetapan")}>
        <Left size={22} aria-hidden="true" />
      </button>
      <LangToggle />
      {bell ? (
        <button type="button" className="ib" aria-label={L("Notifications", "Notifikasi")}>
          <Bell size={22} aria-hidden="true" />
          <i className="rd" />
        </button>
      ) : (
        <span className="ib" style={{ visibility: "hidden" }} aria-hidden="true" />
      )}
    </div>
  );
}

export function Section({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <section className={`sc ${className}`.trim()} style={style}>{children}</section>;
}

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <div className="ttl">
      <h2>{title}</h2>
      {action && (
        <button type="button" className="lk">
          {action} <ChevronRight size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function Bubble({ icon: Icon, bg, size = 40 }: { icon: LucideIcon; bg: string; size?: number }) {
  return (
    <span className="bub" style={{ background: bg, width: size, height: size }}>
      <Icon size={Math.round(size * 0.55)} aria-hidden="true" />
    </span>
  );
}

export function Sq({ icon: Icon, bg, color }: { icon: LucideIcon; bg: string; color: string }) {
  return (
    <span className="sq" style={{ background: bg, color }}>
      <Icon size={24} aria-hidden="true" />
    </span>
  );
}

export function StatTile({ icon, bg, ib, num, label, sub }: { icon: LucideIcon; bg: string; ib: string; num: string | number; label: string; sub: string }) {
  return (
    <div className="st" style={{ background: bg }}>
      <div className="sr">
        <Bubble icon={icon} bg={ib} />
        <b>{num}</b>
      </div>
      <div className="sl">{label}</div>
      <div className="ss">{sub}</div>
    </div>
  );
}

export interface QuickItem { icon: LucideIcon; label: string; bg: string; ib: string }

export function QuickAccess({ items }: { items: QuickItem[] }) {
  return (
    <div className="qa">
      {items.map((q) => (
        <div key={q.label} style={{ background: q.bg }}>
          <Bubble icon={q.icon} bg={q.ib} size={44} />
          <span>{q.label}</span>
        </div>
      ))}
    </div>
  );
}
