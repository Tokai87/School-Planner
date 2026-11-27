import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Alert } from "@/components/ui/Alert";
import { FullScreenLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { dashboardPathFor, getPostAuthPath } from "@/lib/roles";
import type { Role } from "@/types/database";

function ProfileLoadError() {
  const { retryProfile } = useAuth();
  const { L } = useLang();
  return (
    <div className="theme-primary grid min-h-dvh place-items-center px-5">
      <div className="card w-full max-w-md space-y-4 p-6">
        <Alert>{L("We couldn't load your profile. Please check your connection and try again.", "Kami tidak dapat memuatkan profil anda. Sila semak sambungan anda dan cuba lagi.")}</Alert>
        <button className="btn btn-primary w-full" onClick={() => void retryProfile()}>{L("Try again", "Cuba lagi")}</button>
      </div>
    </div>
  );
}

/** "/" — signed-in users are sent on to onboarding or their dashboard. */
export function PublicOnly() {
  const { ready, user, profile, profileStatus } = useAuth();
  const { pathname } = useLocation();
  if (!ready) return <FullScreenLoader />;
  if (user && profileStatus === "ready") {
    const target = getPostAuthPath(profile);
    if (target !== pathname) return <Navigate to={target} replace />;
  }
  if (user && profileStatus === "error") return <ProfileLoadError />;
  return <Outlet />;
}

/** Requires a signed-in user. */
export function RequireAuth() {
  const { ready, user, profileStatus } = useAuth();
  if (!ready) return <FullScreenLoader />;
  if (!user) return <Navigate to="/" replace />;
  if (profileStatus === "error") return <ProfileLoadError />;
  return <Outlet />;
}

/** Onboarding screens: users who already finished onboarding never see them again. */
export function RequireIncompleteProfile() {
  const { profile } = useAuth();
  if (profile?.onboarding_completed) return <Navigate to={getPostAuthPath(profile)} replace />;
  return <Outlet />;
}

/** App screens: incomplete profiles are redirected to onboarding. */
export function RequireCompleteProfile() {
  const { profile } = useAuth();
  if (!profile || !profile.onboarding_completed) return <Navigate to="/onboarding/role" replace />;
  return <Outlet />;
}

/** A dashboard is only visible to its own category; others are sent to theirs. */
export function RoleGate({ role, children }: { role: Role | "student"; children: ReactNode }) {
  const { profile } = useAuth();
  if (!profile) return null;
  const allowed = role === "student" ? profile.role !== "parent" : profile.role === role;
  if (!allowed) return <Navigate to={dashboardPathFor(profile.role)} replace />;
  return <>{children}</>;
}
