import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { LangContext } from "@/hooks/useLang";
import { currentLang, levelLabel, pick, sessionLabel, storeLang, type Lang } from "@/lib/lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(currentLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    storeLang(l);
    setLangState(l);
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      L: (en: string, ms: string) => pick(lang, en, ms),
      level: (s: string | null | undefined) => levelLabel(lang, s),
      session: (s: string | null | undefined) => sessionLabel(lang, s),
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
