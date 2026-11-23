import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/dashboard/BottomNav";

/** Shell for signed-in, onboarded pages: page content + floating bottom navigation. */
export default function AppLayout() {
  return (
    <div className="mx-auto min-h-dvh max-w-md" style={{ background: "#F5F7FF" }}>
      <Outlet />
      <BottomNav />
    </div>
  );
}
