import { z } from "zod";
import { PRIMARY_LEVELS, SECONDARY_LEVELS, SESSIONS, type Role } from "@/types/database";
import { pick, type Lang } from "@/lib/lang";

// Malaysian mobile: 01x-xxxxxxx(x), optionally with +6 / 6 prefix. Empty is allowed (optional field).
const MY_MOBILE = /^(\+?6)?01\d{8,9}$/;

/** Zod schema for the given category, with validation messages in the chosen language. */
export function schemaFor(role: Role, lang: Lang) {
  const m = (en: string, ms: string) => pick(lang, en, ms);
  const fullName = z.string().trim().min(2, m("Please enter your full name", "Sila masukkan nama penuh anda")).max(100, m("Name is too long", "Nama terlalu panjang"));
  const schoolName = z.string().trim().min(2, m("Please enter your school name", "Sila masukkan nama sekolah anda")).max(150, m("School name is too long", "Nama sekolah terlalu panjang"));
  const className = z.string().trim().min(1, m("Please enter your class name", "Sila masukkan nama kelas anda")).max(50, m("Class name is too long", "Nama kelas terlalu panjang"));
  const session = z.enum(SESSIONS, { message: m("Please select your school session", "Sila pilih sesi persekolahan anda") });

  if (role === "primary_student") {
    return z.object({
      role: z.literal("primary_student"),
      full_name: fullName,
      school_name: schoolName,
      school_level: z.enum(PRIMARY_LEVELS, { message: m("Please select your school year", "Sila pilih tahun anda") }),
      class_name: className,
      school_session: session,
    });
  }
  if (role === "secondary_student") {
    return z.object({
      role: z.literal("secondary_student"),
      full_name: fullName,
      school_name: schoolName,
      school_level: z.enum(SECONDARY_LEVELS, { message: m("Please select your form", "Sila pilih tingkatan anda") }),
      class_name: className,
      school_session: session,
    });
  }
  return z.object({
    role: z.literal("parent"),
    full_name: fullName,
    phone_number: z
      .string()
      .trim()
      .refine((v) => v === "" || MY_MOBILE.test(v.replace(/[\s-]/g, "")), m("Enter a valid Malaysian mobile number", "Masukkan nombor telefon bimbit Malaysia yang sah")),
  });
}
