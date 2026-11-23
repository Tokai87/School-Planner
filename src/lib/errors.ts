import { currentLang, pick } from "@/lib/lang";

/** Map any thrown value to a message that is safe to show to a user (follows the saved UI language). */
export function toFriendlyMessage(err: unknown, fallback: string): string {
  const lang = currentLang();
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return pick(lang, "You appear to be offline. Check your connection and try again.", "Anda nampaknya di luar talian. Semak sambungan anda dan cuba lagi.");
  }
  const e = err as { message?: string; code?: string } | null;
  if (e?.message && /failed to fetch|networkerror|network request failed|load failed/i.test(e.message)) {
    return pick(lang, "We couldn't reach the server. Check your connection and try again.", "Kami tidak dapat menghubungi pelayan. Semak sambungan anda dan cuba lagi.");
  }
  if (e?.code === "23505") return pick(lang, "A profile already exists for this account.", "Profil sudah wujud untuk akaun ini.");
  if (e?.code === "42501") return pick(lang, "You don't have permission to do that.", "Anda tidak mempunyai kebenaran untuk berbuat demikian.");
  return fallback;
}

/** Developer log. Only logs message/code/status — never tokens, sessions or request bodies. */
export function logError(scope: string, err: unknown): void {
  const e = err as { message?: string; code?: string; status?: number } | null;
  console.error(`[${scope}]`, { message: e?.message, code: e?.code, status: e?.status });
}
