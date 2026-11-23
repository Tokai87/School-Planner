import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { AppIcon } from "@/components/auth/AppIcon";
import { LangToggle } from "@/components/ui/LangToggle";
import { useLang } from "@/hooks/useLang";

/** Shared light shell for onboarding and edit-profile screens: top bar (back/app icon, language, step). */
export function ObShell({ step, backTo, children }: { step?: 1 | 2; backTo?: string; children: ReactNode }) {
  const { L } = useLang();
  const navigate = useNavigate();
  return (
    <div className="ob">
      <div className="mx-auto max-w-md">
        <div className="obt">
          {backTo ? (
            <button type="button" className="ib" aria-label={L("Back", "Kembali")} onClick={() => navigate(backTo)}>
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
          ) : (
            <span className="ami"><AppIcon size={40} /></span>
          )}
          <LangToggle />
          <span className="pill sp">{step ? L(`Step ${step} of 2`, `Langkah ${step} / 2`) : ""}</span>
        </div>
        {children}
      </div>
    </div>
  );
}
