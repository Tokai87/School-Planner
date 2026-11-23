import { Check } from "lucide-react";
import { useRoleMeta } from "@/hooks/useRoleMeta";
import type { Role } from "@/types/database";
import type { CSSProperties } from "react";

export function RoleCard({ role, selected, onSelect }: { role: Role; selected: boolean; onSelect: () => void }) {
  const meta = useRoleMeta()(role);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className="rcard"
      style={{ "--c": meta.color, "--s": meta.soft } as CSSProperties}
    >
      <span className="cir"><img src={meta.img} alt="" /></span>
      <span className="rt">
        <b>{meta.title}</b>
        <small>{meta.desc}</small>
      </span>
      <span className="dot" aria-hidden="true">{selected && <Check size={16} />}</span>
    </button>
  );
}
