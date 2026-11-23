export type Lang = "en" | "ms";

const KEY = "sp.lang";

/** Read the saved UI language (non-sensitive preference). Safe outside React, e.g. in error helpers. */
export function currentLang(): Lang {
  try {
    return localStorage.getItem(KEY) === "ms" ? "ms" : "en";
  } catch {
    return "en";
  }
}

export function storeLang(l: Lang): void {
  try {
    localStorage.setItem(KEY, l);
  } catch {
    /* storage unavailable — language still works for this session */
  }
}

export const pick = (lang: Lang, en: string, ms: string): string => (lang === "ms" ? ms : en);

export function levelLabel(lang: Lang, s: string | null | undefined): string {
  if (!s) return "—";
  return lang === "ms" ? s.replace("Year", "Tahun").replace("Form", "Tingkatan") : s;
}

const SESSION_MS: Record<string, string> = { Morning: "Pagi", Afternoon: "Petang", "Full Day": "Sepanjang Hari" };
export function sessionLabel(lang: Lang, s: string | null | undefined): string {
  if (!s) return "—";
  return lang === "ms" ? (SESSION_MS[s] ?? s) : s;
}
