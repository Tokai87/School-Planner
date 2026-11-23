export function AppIcon({ size = 78 }: { size?: number }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} role="img" aria-label="School Planner">
      <defs>
        <linearGradient id="sp-ag" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5B8DF7" />
          <stop offset="1" stopColor="#3B5BDB" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="22" fill="url(#sp-ag)" />
      <path d="M24 16h30a4 4 0 0 1 4 4v32a4 4 0 0 1-4 4H24z" fill="#fff" />
      <path d="M24 16v40" stroke="#C9D6FB" strokeWidth="3" />
      <rect x="24" y="52" width="36" height="6" rx="3" fill="#E1E9FF" />
      <circle cx="49" cy="38" r="10" fill="#3B5BDB" stroke="#fff" strokeWidth="3" />
      <path d="m44.5 38 3.5 3.5 6-7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 52v13l4-3 4 3V52z" fill="#FFC21A" />
    </svg>
  );
}
