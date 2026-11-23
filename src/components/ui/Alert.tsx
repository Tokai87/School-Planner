import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

export function Alert({ kind = "error", children }: { kind?: "error" | "success"; children: ReactNode }) {
  const isError = kind === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <div
      role={isError ? "alert" : "status"}
      className="flex items-start gap-3 rounded-2xl px-4 py-3 text-sm"
      style={{
        background: isError ? "#FEF2F2" : "#ECFDF5",
        color: isError ? "#991B1B" : "#065F46",
        border: `1px solid ${isError ? "#FECACA" : "#A7F3D0"}`,
      }}
    >
      <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
