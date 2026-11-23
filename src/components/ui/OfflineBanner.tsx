import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useLang } from "@/hooks/useLang";

export function OfflineBanner() {
  const { L } = useLang();
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  if (online) return null;
  return (
    <div role="status" className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-slate-800 px-4 py-2 text-sm text-white">
      <WifiOff size={18} aria-hidden="true" />
      {L("You're offline. Some things may not work until you reconnect.", "Anda di luar talian. Sesetengah fungsi mungkin tidak berfungsi sehingga anda bersambung semula.")}
    </div>
  );
}
