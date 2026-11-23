import { useLang } from "@/hooks/useLang";

/** EN | BM switch. Styling comes from the `.lt` class (adapts to the surrounding mode). */
export function LangToggle() {
  const { lang, setLang, L } = useLang();
  return (
    <div className="lt" role="group" aria-label={L("Language", "Bahasa")}>
      <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>EN</button>
      <button type="button" aria-pressed={lang === "ms"} onClick={() => setLang("ms")}>BM</button>
    </div>
  );
}
