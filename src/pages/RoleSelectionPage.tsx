import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { RoleCard } from "@/components/onboarding/RoleCard";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { useLang } from "@/hooks/useLang";
import type { Role } from "@/types/database";

const ROLES: Role[] = ["primary_student", "secondary_student", "parent"];

export default function RoleSelectionPage() {
  const { role, setRole } = useOnboarding();
  const { L } = useLang();
  const navigate = useNavigate();

  return (
    <>
      <h1 className="oh">{L("Who is using School Planner?", "Siapa yang menggunakan School Planner?")}</h1>
      <p className="op">{L("Choose the option that fits you best.", "Pilih yang paling sesuai dengan anda.")}</p>

      <div role="radiogroup" aria-label={L("User category", "Kategori pengguna")} className="rg">
        {ROLES.map((r) => (
          <RoleCard key={r} role={r} selected={role === r} onSelect={() => setRole(r)} />
        ))}
      </div>

      <p className="note">
        <ShieldCheck size={18} aria-hidden="true" />
        {L("Younger children can use School Planner through a parent account.", "Kanak-kanak yang lebih muda boleh menggunakan School Planner melalui akaun ibu bapa.")}
      </p>

      <button type="button" className="cta" disabled={!role} onClick={() => navigate("/onboarding/profile")}>
        {L("Continue", "Teruskan")}
      </button>
    </>
  );
}
