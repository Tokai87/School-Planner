/** Rancang+ calendar mark (blue calendar with a yellow "done" badge) used on the Welcome and role screens. */
export function BrandMark({ size = 56 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <rect x="4" y="12" width="50" height="44" rx="10" fill="#fff" stroke="#2563EB" strokeWidth="5" />
      <path d="M4 25v-3a10 10 0 0 1 10-10h30a10 10 0 0 1 10 10v3z" fill="#2563EB" />
      <rect x="16" y="4" width="6" height="14" rx="3" fill="#1E40AF" />
      <rect x="36" y="4" width="6" height="14" rx="3" fill="#1E40AF" />
      {[14, 26, 38].map((x) => <rect key={`a${x}`} x={x} y="31" width="7" height="7" rx="2" fill="#3B82F6" />)}
      {[14, 26].map((x) => <rect key={`b${x}`} x={x} y="43" width="7" height="7" rx="2" fill="#93BBF8" />)}
      <circle cx="50" cy="47" r="13" fill="#FBBF24" stroke="#fff" strokeWidth="3" />
      <path d="M43.5 47.5l4.5 4.5 8-9" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Brand mark + "Rancang+" wordmark (yellow plus). */
export function Wordmark({ size = 52 }: { size?: number }) {
  return (
    <span className="wm-row" style={{ ["--wm" as string]: `${Math.round(size * 0.68)}px` }}>
      <BrandMark size={size} />
      <span className="wm" aria-label="Rancang+">Rancang<i>+</i></span>
    </span>
  );
}
