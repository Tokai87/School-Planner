import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { Alert } from "@/components/ui/Alert";
import { FullScreenLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { getPostAuthPath } from "@/lib/roles";

/** Reads OAuth error params from the query string or hash (Supabase/Google can use either). */
function readOAuthError(): "cancelled" | "failed" | null {
  const q = new URLSearchParams(window.location.search);
  const h = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const err = q.get("error") ?? h.get("error");
  if (!err) return null;
  const code = q.get("error_code") ?? h.get("error_code");
  console.error("[auth.callback]", { error: err, code }); // no tokens/descriptions logged
  return err === "access_denied" ? "cancelled" : "failed";
}

function CallbackError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { L } = useLang();
  return (
    <div className="theme-primary grid min-h-dvh place-items-center px-5">
      <div className="card w-full max-w-md space-y-4 p-6">
        <h1 className="text-xl font-bold">{L("Couldn't sign you in", "Tidak dapat melog masuk")}</h1>
        <Alert>{message}</Alert>
        {onRetry && <button className="btn btn-primary w-full" onClick={onRetry}>{L("Try again", "Cuba lagi")}</button>}
        <Link to="/" replace className="btn btn-ghost w-full">{L("Back to sign in", "Kembali ke log masuk")}</Link>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  const { loading, ready, user, profile, profileStatus, retryProfile } = useAuth();
  const { L } = useLang();
  // Captured once on first render, before Supabase cleans the URL.
  const oauthError = useMemo(readOAuthError, []);

  if (oauthError === "cancelled") return <CallbackError message={L("Sign-in was cancelled. You can try again whenever you're ready.", "Log masuk dibatalkan. Anda boleh cuba lagi bila-bila masa.")} />;
  if (oauthError) return <CallbackError message={L("Google sign-in didn't complete. Please try again.", "Log masuk Google tidak selesai. Sila cuba lagi.")} />;
  if (loading) return <FullScreenLoader label={L("Signing you in…", "Sedang melog masuk…")} />;
  if (!user) return <CallbackError message={L("Your sign-in link is invalid or has expired. Please sign in again.", "Pautan log masuk anda tidak sah atau telah tamat tempoh. Sila log masuk semula.")} />;
  if (profileStatus === "error") {
    return <CallbackError message={L("We signed you in but couldn't load your profile.", "Anda telah log masuk tetapi profil tidak dapat dimuatkan.")} onRetry={() => void retryProfile()} />;
  }
  if (!ready) return <FullScreenLoader label={L("Checking your profile…", "Menyemak profil anda…")} />;

  // `replace` keeps /auth/callback out of history, so Back can't create a redirect loop.
  return <Navigate to={getPostAuthPath(profile)} replace />;
}
