import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { AppRoutes } from "@/routes/AppRoutes";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Alert } from "@/components/ui/Alert";

function MissingConfig() {
  return (
    <div className="theme-primary grid min-h-dvh place-items-center px-5">
      <div className="card w-full max-w-md space-y-3 p-6">
        <h1 className="text-xl font-bold">Setup needed</h1>
        <Alert>
          Supabase isn't configured. Copy <code>.env.example</code> to <code>.env</code>, set{" "}
          <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, then restart the dev server.
        </Alert>
      </div>
    </div>
  );
}

export default function App() {
  if (!isSupabaseConfigured) return <MissingConfig />;
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <OfflineBanner />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}
