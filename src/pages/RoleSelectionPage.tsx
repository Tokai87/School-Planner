import { useNavigate } from "react-router-dom";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { RoleCard } from "@/components/onboarding/RoleCard";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { SchoolScene } from "@/components/brand/SchoolScene";
import { useLang } from "@/hooks/useLang";
import type { Role } from "@/types/database";
import kids from "@/assets/hero-welcome.webp";

const ROLES: Role[] = ["primary_student", "secondary_student", "parent"];

export default function RoleSelectionPage() {
  const { role, setRole } = useOnboarding();
  const { L } = useLang();
  const navigate = useNavigate();

  return (
    <>
      <div className="rh">
        <h1 className="oh">{L("Who is using Rancang+?", "Siapa yang menggunakan Rancang+?")}</h1>
        <p className="op">{L("Choose the option that fits you best.", "Pilih yang paling sesuai dengan anda.")}</p>
        <svg className="ul" viewBox="0 0 120 10" aria-hidden="true"><path d="M3 7C30 2 80 2 117 5" fill="none" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" /></svg>
        <SchoolScene className="rs" />
        <img className="rk" src={kids} alt="" />
      </div>

      <div role="radiogroup" aria-label={L("User category", "Kategori pengguna")} className="rg">
        {ROLES.map((r) => (
          <RoleCard key={r} role={r} selected={role === r} onSelect={() => setRole(r)} />
        ))}
      </div>

      <p className="note">
        <ShieldCheck size={18} aria-hidden="true" />
        {L("Younger children can use Rancang+ through a parent account.", "Kanak-kanak yang lebih muda boleh menggunakan Rancang+ melalui akaun ibu bapa.")}
      </p>

      <button type="button" className="cta" disabled={!role} onClick={() => navigate("/onboarding/profile")}>
        {L("Next", "Seterusnya")} <ChevronRight size={22} aria-hidden="true" />
      </button>
      <div style={{ height: 40 }} aria-hidden="true" />
    </>
  );
}
