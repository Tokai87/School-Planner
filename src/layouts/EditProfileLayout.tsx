import { Outlet } from "react-router-dom";
import { ObShell } from "@/components/onboarding/ObShell";

export default function EditProfileLayout() {
  return (
    <ObShell backTo="/profile">
      <Outlet />
    </ObShell>
  );
}
