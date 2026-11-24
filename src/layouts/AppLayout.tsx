import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { genderClassFor } from "@/lib/roles";

/** Shell for signed-in, onboarded pages: page content + floating bottom navigation. The gender class switches the colour theme. */
export default function AppLayout() {
  const { profile } = useAuth();
  return (
    <div className={`mx-auto min-h-dvh max-w-md ${genderClassFor(profile?.gender)}`} style={{ background: "#F5F7FF", padding: "20px 18px 0", overflowX: "clip" }}>
      <Outlet />
      <BottomNav />
    </div>
  );
}
