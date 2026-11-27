import type { CSSProperties, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight, Menu, Settings, type LucideIcon } from "lucide-react";
import { LangToggle } from "@/components/ui/LangToggle";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { usePlanner } from "@/hooks/usePlanner";
import { hasAlerts } from "@/lib/today";

export const cssVar = (name: string, value: string) => ({ [name]: value }) as CSSProperties;

/** Character artwork for the dashboard header; falls back to an icon badge when no artwork exists for this user. */
export function Hero({ src, height, icon: Icon }: { src: string | null; height: string; icon: LucideIcon }) {
  if (src) return <img className="hero" style={cssVar("--h", height)} src={src} alt="" />;
  return (
    <div className="hero hero-fb" aria-hidden="true">
      <Icon size={76} strokeWidth={1.6} />
    </div>
  );
}

export function TopBar({ left, bell = true }: { left: "menu" | "settings"; bell?: boolean }) {
  const { L } = useLang();
  const Left = left === "menu" ? Menu : Settings;
  const navigate = useNavigate();
  const { data } = usePlanner();
  const { profile } = useAuth();
  const dot = hasAlerts(data, profile?.role !== "parent");
  return (
    <div className="tb">
      <button type="button" className="ib" aria-label={L("Settings", "Tetapan")} onClick={() => navigate("/settings")}>
        <Left size={22} aria-hidden="true" />
      </button>
      <LangToggle />
      {bell ? (
        <button type="button" className="ib" aria-label={L("Notifications", "Notifikasi")} onClick={() => navigate("/alerts")}>
          <Bell size={22} aria-hidden="true" />
          {dot && <i className="rd" />}
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

export function SectionTitle({ title, action, to }: { title: string; action?: string; to?: string }) {
  const navigate = useNavigate();
  return (
    <div className="ttl">
      <h2>{title}</h2>
      {action && to && (
        <button type="button" className="lk" onClick={() => navigate(to)}>
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

export interface QuickItem { icon: LucideIcon; label: string; bg: string; ib: string; to: string }

export function QuickAccess({ items }: { items: QuickItem[] }) {
  const navigate = useNavigate();
  return (
    <div className="qa">
      {items.map((q) => (
        <button key={q.label} type="button" style={{ background: q.bg }} onClick={() => navigate(q.to)}>
          <Bubble icon={q.icon} bg={q.ib} size={44} />
          <span>{q.label}</span>
        </button>
      ))}
    </div>
  );
}
