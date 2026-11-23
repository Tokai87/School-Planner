import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="theme-primary min-h-dvh" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
