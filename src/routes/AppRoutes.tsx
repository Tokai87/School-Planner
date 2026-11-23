import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import OnboardingLayout from "@/layouts/OnboardingLayout";
import EditProfileLayout from "@/layouts/EditProfileLayout";
import AppLayout from "@/layouts/AppLayout";
import WelcomePage from "@/pages/WelcomePage";
import RoleSelectionPage from "@/pages/RoleSelectionPage";
import ProfileSetupPage from "@/pages/ProfileSetupPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import ProfilePage from "@/pages/ProfilePage";
import PrimaryDashboard from "@/pages/dashboards/PrimaryDashboard";
import SecondaryDashboard from "@/pages/dashboards/SecondaryDashboard";
import ParentDashboard from "@/pages/dashboards/ParentDashboard";
import { PublicOnly, RequireAuth, RequireCompleteProfile, RequireIncompleteProfile, RoleGate } from "@/routes/guards";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicOnly />}>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<WelcomePage />} />
        </Route>
      </Route>
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Signed in */}
      <Route element={<RequireAuth />}>
        <Route element={<RequireIncompleteProfile />}>
          <Route path="/onboarding" element={<OnboardingLayout />}>
            <Route index element={<Navigate to="role" replace />} />
            <Route path="role" element={<RoleSelectionPage />} />
            <Route path="profile" element={<ProfileSetupPage />} />
          </Route>
        </Route>

        <Route element={<RequireCompleteProfile />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard/primary" element={<RoleGate role="primary_student"><PrimaryDashboard /></RoleGate>} />
            <Route path="/dashboard/secondary" element={<RoleGate role="secondary_student"><SecondaryDashboard /></RoleGate>} />
            <Route path="/dashboard/parent" element={<RoleGate role="parent"><ParentDashboard /></RoleGate>} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route element={<EditProfileLayout />}>
            <Route path="/profile/edit" element={<ProfileSetupPage mode="edit" />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
