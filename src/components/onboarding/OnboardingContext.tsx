import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { Role } from "@/types/database";

interface OnboardingState {
  role: Role | null;
  setRole: (r: Role) => void;
}

const KEY = "sp.onboarding.role";
const VALID: Role[] = ["primary_student", "secondary_student", "parent"];

function readStored(): Role | null {
  try {
    const v = sessionStorage.getItem(KEY) as Role | null;
    return v && VALID.includes(v) ? v : null;
  } catch {
    return null;
  }
}

// Default value lets pages outside the provider (e.g. edit profile) call useOnboarding safely.
const OnboardingContext = createContext<OnboardingState>({ role: null, setRole: () => {} });

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(readStored);
  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    try {
      sessionStorage.setItem(KEY, r); // only the non-sensitive category choice, so a refresh doesn't lose it
    } catch {
      /* storage unavailable — in-memory state still works */
    }
  }, []);
  return <OnboardingContext.Provider value={{ role, setRole }}>{children}</OnboardingContext.Provider>;
}

export const useOnboarding = () => useContext(OnboardingContext);
