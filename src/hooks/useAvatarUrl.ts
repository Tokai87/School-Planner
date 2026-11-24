import { useEffect, useState } from "react";
import { getAvatarUrl } from "@/services/avatarService";
import { logError } from "@/lib/errors";

const REFRESH_MS = 50 * 60 * 1000; // signed URLs last 60 min; renew a bit earlier

/** Signed URL for a profile photo path, or null when there is no photo (or it could not be loaded). */
export function useAvatarUrl(path: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }
    let active = true;
    const load = () => {
      getAvatarUrl(path)
        .then((u) => {
          if (active) setUrl(u);
        })
        .catch((e) => {
          logError("avatar.signedUrl", e);
          if (active) setUrl(null);
        });
    };
    load();
    const timer = window.setInterval(load, REFRESH_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [path]);

  return url;
}
