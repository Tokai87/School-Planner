import { useLang } from "@/hooks/useLang";
import type { Role } from "@/types/database";
import boy from "@/assets/boy.webp";
import student from "@/assets/student.webp";
import couple from "@/assets/couple.webp";
import avPrimary from "@/assets/role-primary.webp";
import avSecondary from "@/assets/role-secondary.webp";
import avParent from "@/assets/role-parent.webp";

export interface RoleMeta {
  title: string;
  desc: string;
  img: string;
  /** Round avatar for the role-selection card. */
  avatar: string;
  /** Short level label shown as a pill (students only). */
  level?: string;
  /** One-line tagline for the role-selection card. */
  tagline: string;
  color: string;
  soft: string;
  /** CSS class for the dashboard/profile personality. */
  mode: "pri" | "sec" | "par";
}

/** Localised title/description, character image and colours for each user category. */
export function useRoleMeta(): (role: Role) => RoleMeta {
  const { L } = useLang();
  return (role) => {
    if (role === "primary_student")
      return { title: L("Primary Student", "Murid Sekolah Rendah"), desc: L("For Year 1–6 students.", "Untuk murid Tahun 1–6."), img: boy, avatar: avPrimary, level: L("Year 1 – Year 6", "Tahun 1 – Tahun 6"), tagline: L("Bright and colourful", "Ceria dan berwarna"), color: "#2B8CCB", soft: "#E6F4FD", mode: "pri" };
    if (role === "secondary_student")
      return { title: L("Secondary Student", "Pelajar Menengah"), desc: L("For Form 1–5 students.", "Untuk pelajar Tingkatan 1–5."), img: student, avatar: avSecondary, level: L("Form 1 – Form 5", "Tingkatan 1 – Tingkatan 5"), tagline: L("Focused and achieving", "Fokus dan berprestasi"), color: "#172554", soft: "#DBEAFE", mode: "sec" };
    return {
      title: L("Parent / Guardian", "Ibu Bapa / Penjaga"),
      desc: L("Manage and monitor your children's school activities.", "Urus dan pantau aktiviti sekolah anak anda."),
      img: couple, avatar: avParent, tagline: L("Keep track of your child's school life", "Pantau kehidupan sekolah anak anda"), color: "#2563EB", soft: "#EDE9FE", mode: "par",
    };
  };
}
