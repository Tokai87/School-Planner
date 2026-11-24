import { Outlet, useLocation } from "react-router-dom";
import { ObShell } from "@/components/onboarding/ObShell";
import { OnboardingProvider } from "@/components/onboarding/OnboardingContext";

function Frame() {
  const { pathname } = useLocation();
  const onProfile = pathname.endsWith("/profile");
  return (
    <ObShell brand={!onProfile} step={onProfile ? 2 : 1} backTo={onProfile ? "/onboarding/role" : undefined}>
      <Outlet />
    </ObShell>
  );
}

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Frame />
    </OnboardingProvider>
  );
}
