import { useRef, useState, type ChangeEvent, type CSSProperties, type ReactNode } from "react";
import { Camera, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { useLang } from "@/hooks/useLang";
import { AvatarError, removeAvatar, uploadAvatar } from "@/services/avatarService";
import { logError, toFriendlyMessage } from "@/lib/errors";

/** Round profile photo with a camera button. Shows `fallback` (the default artwork) until a photo is uploaded. */
export function AvatarUploader({ fallback, style }: { fallback: ReactNode; style?: CSSProperties }) {
  const { user, profile, refreshProfile } = useAuth();
  const { L } = useLang();
  const url = useAvatarUrl(profile?.avatar_path);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user || !profile) return null;

  const messageFor = (code: AvatarError["code"]) =>
    code === "too_large"
      ? L("That photo is too large (max 12 MB).", "Gambar itu terlalu besar (maks 12 MB).")
      : code === "not_image"
        ? L("Please choose an image file.", "Sila pilih fail gambar.")
        : L("We couldn't read that image. Try a JPG or PNG.", "Kami tidak dapat membaca gambar itu. Cuba JPG atau PNG.");

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be chosen again
    if (!file || !user || !profile) return;
    setError(null);
    setBusy(true);
    try {
      await uploadAvatar(user.id, file, profile.avatar_path);
      await refreshProfile();
    } catch (err) {
      logError("avatar.upload", err);
      setError(
        err instanceof AvatarError
          ? messageFor(err.code)
          : toFriendlyMessage(err, L("We couldn't upload your photo. Please try again.", "Kami tidak dapat memuat naik gambar anda. Sila cuba lagi.")),
      );
    } finally {
      setBusy(false);
    }
  }

  async function onRemove() {
    if (!user || !profile?.avatar_path) return;
    setError(null);
    setBusy(true);
    try {
      await removeAvatar(user.id, profile.avatar_path);
      await refreshProfile();
    } catch (err) {
      logError("avatar.remove", err);
      setError(toFriendlyMessage(err, L("We couldn't remove your photo. Please try again.", "Kami tidak dapat membuang gambar anda. Sila cuba lagi.")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="avw">
        <span className="av" style={style}>
          {url ? <img src={url} alt="" /> : fallback}
        </span>
        <button
          type="button"
          className="avcam"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-busy={busy}
          aria-label={L("Change profile photo", "Tukar gambar profil")}
        >
          {busy ? <Spinner /> : <Camera size={20} aria-hidden="true" />}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={onPick} />
      </div>
      {error && <div className="avmsg"><Alert>{error}</Alert></div>}
      {profile.avatar_path && (
        <button type="button" className="avrm" onClick={onRemove} disabled={busy}>
          <Trash2 size={16} aria-hidden="true" /> {L("Remove photo", "Buang gambar")}
        </button>
      )}
    </>
  );
}
