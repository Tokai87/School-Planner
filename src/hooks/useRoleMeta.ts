import { useLang } from "@/hooks/useLang";
import type { Role } from "@/types/database";
import boy from "@/assets/boy.webp";
import student from "@/assets/student.webp";
import couple from "@/assets/couple.webp";

export interface RoleMeta {
  title: string;
  desc: string;
  img: string;
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
      return { title: L("Primary Student", "Murid Sekolah Rendah"), desc: L("For Year 1–6 students.", "Untuk murid Tahun 1–6."), img: boy, color: "#2B8CCB", soft: "#E6F4FD", mode: "pri" };
    if (role === "secondary_student")
      return { title: L("Secondary Student", "Pelajar Menengah"), desc: L("For Form 1–5 students.", "Untuk pelajar Tingkatan 1–5."), img: student, color: "#172554", soft: "#DBEAFE", mode: "sec" };
    return {
      title: L("Parent / Guardian", "Ibu Bapa / Penjaga"),
      desc: L("Manage and monitor your children's school activities.", "Urus dan pantau aktiviti sekolah anak anda."),
      img: couple, color: "#2563EB", soft: "#EDE9FE", mode: "par",
    };
  };
}
