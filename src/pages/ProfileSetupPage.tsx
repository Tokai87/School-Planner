import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { useRoleMeta } from "@/hooks/useRoleMeta";
import { schemaFor } from "@/schemas/profileSchema";
import { dashboardPathFor, genderClassFor } from "@/lib/roles";
import { heroFor } from "@/lib/hero";
import { logError, toFriendlyMessage } from "@/lib/errors";
import { GENDERS, PRIMARY_LEVELS, SECONDARY_LEVELS, SESSIONS, type Gender, type ProfileInput, type Role, type SchoolSession } from "@/types/database";
import type { CSSProperties } from "react";

interface FormValues {
  full_name: string;
  gender: string;
  school_name: string;
  school_level: string;
  class_name: string;
  school_session: string;
  phone_number: string;
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="f">
      <label htmlFor={id} className="lbl">{label}</label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs" style={{ color: "var(--muted)" }}>{hint}</p>}
      <div id={`${id}-error`} className="fe" role="alert">{error}</div>
    </div>
  );
}

function toInput(role: Role, v: FormValues): ProfileInput {
  const t = (s: string) => s.trim();
  if (role === "parent") {
    return { role, full_name: t(v.full_name), gender: v.gender as Gender, phone_number: t(v.phone_number) || null, school_name: null, class_name: null, school_level: null, school_session: null };
  }
  return {
    role, full_name: t(v.full_name), gender: v.gender as Gender, school_name: t(v.school_name), class_name: t(v.class_name),
    school_level: v.school_level, school_session: v.school_session as SchoolSession, phone_number: null,
  };
}

function ProfileForm({ role, mode }: { role: Role; mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { saveProfile } = useProfile();
  const { lang, L, level, session } = useLang();
  const meta = useRoleMeta()(role);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const googleName = (user?.user_metadata?.full_name as string | undefined) ?? "";
  const schema = useMemo(() => schemaFor(role, lang), [role, lang]);

  // The schema includes the `role` literal; inject it so validation doesn't depend on a form input.
  const resolver = useMemo(
    () =>
      ((values, context, options) =>
        (zodResolver(schema) as unknown as Resolver<FormValues>)({ ...values, role } as FormValues, context, options)) as Resolver<FormValues>,
    [schema, role],
  );

  const {
    register, handleSubmit, trigger, watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver,
    mode: "onTouched",
    defaultValues: {
      full_name: profile?.full_name ?? googleName, // prefill from Google; never invent school/class
      gender: profile?.gender ?? "",
      school_name: profile?.school_name ?? "",
      school_level: profile?.school_level ?? "",
      class_name: profile?.class_name ?? "",
      school_session: profile?.school_session ?? "",
      phone_number: profile?.phone_number ?? "",
    },
  });

  // Re-validate when the language changes so visible messages switch language too.
  useEffect(() => {
    if (Object.keys(errors).length > 0) void trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const gender = watch("gender"); // live theme preview while choosing
  const levels = role === "primary_student" ? PRIMARY_LEVELS : SECONDARY_LEVELS;
  const isStudent = role !== "parent";
  const dest = mode === "edit" ? "/profile" : dashboardPathFor(role);

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    try {
      await saveProfile(toInput(role, values));
      setSaved(true);
      window.setTimeout(async () => {
        await refreshProfile();
        navigate(dest, { replace: true });
      }, 1000);
    } catch (e) {
      logError("profile.save", e);
      setSubmitError(toFriendlyMessage(e, L("We couldn't save your profile. Please try again.", "Kami tidak dapat menyimpan profil anda. Sila cuba lagi.")));
    }
  }

  if (saved) {
    return (
      <div className="card sux text-center" role="status">
        <span className="sck"><Check size={34} aria-hidden="true" /></span>
        <h1>{mode === "edit" ? L("Profile updated", "Profil dikemas kini") : L("You're all set!", "Semuanya siap!")}</h1>
        <p style={{ color: "var(--muted)" }}>{L("Taking you there now…", "Membawa anda ke sana…")}</p>
      </div>
    );
  }

  const invalid = (k: keyof FormValues) => (errors[k] ? "true" : undefined);
  const describe = (k: keyof FormValues) => (errors[k] ? `${k}-error` : undefined);

  return (
    <>
      <h1 className="oh">{mode === "edit" ? L("Edit your profile", "Ubah profil anda") : L("Tell us about you", "Beritahu kami tentang anda")}</h1>
      <p className="op">
        {isStudent ? L("This helps us set up your school planner.", "Ini membantu kami menyediakan perancang sekolah anda.") : L("Set up your parent / guardian account.", "Sediakan akaun ibu bapa / penjaga anda.")}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={`card fm ${genderClassFor(gender === "female" ? "female" : "male")}`}>
        {submitError && <div className="f"><Alert>{submitError}</Alert></div>}

        <div className="f">
          <span className="lbl">{L("User category", "Kategori pengguna")}</span>
          <div className="rsel" style={{ "--s": meta.soft } as CSSProperties}>
            <span className="cir cs">
              {(() => {
                const art = gender === "female" && isStudent ? heroFor(role, "female") : null;
                if (gender === "female" && isStudent && !art) return <b className="av-i" style={{ fontSize: 20 }} aria-hidden="true">♀</b>;
                return <img className={art ? "face" : undefined} src={art ?? meta.img} alt="" />;
              })()}
            </span>
            <b>{meta.title}</b>
          </div>
        </div>

        <Field id="full_name" label={L("Full name", "Nama penuh")} error={errors.full_name?.message}>
          <input id="full_name" className="in" autoComplete="name" aria-invalid={invalid("full_name")} aria-describedby={describe("full_name")} {...register("full_name")} />
        </Field>

        <fieldset className="f" style={{ border: 0, padding: 0 }}>
          <legend className="lbl">{L("Gender", "Jantina")}</legend>
          <div className="seg two">
            {GENDERS.map((g) => (
              <label key={g} style={{ margin: 0 }}>
                <input type="radio" value={g} {...register("gender")} />
                <span>{g === "male" ? L("Boy / Male", "Lelaki") : L("Girl / Female", "Perempuan")}</span>
              </label>
            ))}
          </div>
          <p className="mt-1.5 text-xs" style={{ color: "var(--muted)" }}>{L("This sets your app colour theme.", "Ini menentukan tema warna app anda.")}</p>
          <div className="fe" role="alert">{errors.gender?.message}</div>
        </fieldset>

        {isStudent && (
          <>
            <Field id="school_name" label={L("School name", "Nama sekolah")} error={errors.school_name?.message}>
              <input id="school_name" className="in" placeholder={L("e.g. SK Taman Sinar", "cth. SK Taman Sinar")} aria-invalid={invalid("school_name")} aria-describedby={describe("school_name")} {...register("school_name")} />
            </Field>

            <div className="row2">
              <Field id="school_level" label={role === "primary_student" ? L("School year", "Tahun") : L("Form", "Tingkatan")} error={errors.school_level?.message}>
                <select id="school_level" className="in" aria-invalid={invalid("school_level")} aria-describedby={describe("school_level")} {...register("school_level")}>
                  <option value="">{L("Select…", "Pilih…")}</option>
                  {levels.map((l) => <option key={l} value={l}>{level(l)}</option>)}
                </select>
              </Field>
              <Field id="class_name" label={L("Class name", "Nama kelas")} error={errors.class_name?.message}>
                <input id="class_name" className="in" placeholder={L("e.g. 3 Cemerlang", "cth. 3 Cemerlang")} aria-invalid={invalid("class_name")} aria-describedby={describe("class_name")} {...register("class_name")} />
              </Field>
            </div>

            <fieldset className="f" style={{ border: 0, padding: 0 }}>
              <legend className="lbl">{L("School session", "Sesi persekolahan")}</legend>
              <div className="seg">
                {SESSIONS.map((s) => (
                  <label key={s} style={{ margin: 0 }}>
                    <input type="radio" value={s} {...register("school_session")} />
                    <span>{session(s)}</span>
                  </label>
                ))}
              </div>
              <div className="fe" role="alert">{errors.school_session?.message}</div>
            </fieldset>
          </>
        )}

        {!isStudent && (
          <Field id="phone_number" label={L("Phone number (optional)", "Nombor telefon (pilihan)")} hint={L("Malaysian mobile, e.g. 012-345 6789", "Telefon bimbit Malaysia, cth. 012-345 6789")} error={errors.phone_number?.message}>
            <input id="phone_number" type="tel" inputMode="tel" autoComplete="tel" className="in" placeholder="012-345 6789" aria-invalid={invalid("phone_number")} aria-describedby={describe("phone_number")} {...register("phone_number")} />
          </Field>
        )}

        <button type="submit" className="cta" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting && <Spinner />}
          {isSubmitting ? L("Saving…", "Menyimpan…") : mode === "edit" ? L("Save changes", "Simpan perubahan") : L("Finish setup", "Selesai")}
        </button>
      </form>
    </>
  );
}

export default function ProfileSetupPage({ mode = "create" }: { mode?: "create" | "edit" }) {
  const { profile } = useAuth();
  const { role: chosen } = useOnboarding();
  const role = mode === "edit" ? profile?.role ?? null : chosen;
  if (!role) return <Navigate to="/onboarding/role" replace />;
  return <ProfileForm role={role} mode={mode} />;
}
