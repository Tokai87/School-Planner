import { createContext, useContext } from "react";
import type { Lang } from "@/lib/lang";

export interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Pick the English or Malay string. */
  L: (en: string, ms: string) => string;
  level: (s: string | null | undefined) => string;
  session: (s: string | null | undefined) => string;
}

export const LangContext = createContext<LangContextValue | null>(null);

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LanguageProvider>");
  return ctx;
}
