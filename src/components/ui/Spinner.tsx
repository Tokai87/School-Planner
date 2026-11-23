import { Loader2 } from "lucide-react";
import { useLang } from "@/hooks/useLang";

export function Spinner({ size = 20 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin" aria-hidden="true" />;
}

export function FullScreenLoader({ label }: { label?: string }) {
  const { L } = useLang();
  return (
    <div className="grid min-h-dvh place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3" style={{ color: "var(--muted)" }}>
        <Spinner size={32} />
        <p className="text-sm font-medium">{label ?? L("Loading…", "Memuatkan…")}</p>
      </div>
    </div>
  );
}
