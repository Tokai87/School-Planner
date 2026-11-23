/** Soft pastel school building used behind the Welcome illustration. Decorative only. */
export function SchoolSilhouette({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 130" aria-hidden="true">
      <rect x="10" y="62" width="220" height="68" rx="4" fill="#C9DCF6" />
      <rect x="86" y="30" width="68" height="100" fill="#BDD3F3" />
      <path d="M78 32 120 8l42 24z" fill="#B3CCF0" />
      <circle cx="120" cy="42" r="8" fill="#E8F0FD" />
      <path d="M120 8V-6l14 5z" fill="#8FB1EC" />
      {[24, 48, 168, 192].map((x) => (
        <rect key={x} x={x} y="78" width="14" height="18" rx="3" fill="#E3ECFB" />
      ))}
      {[98, 112, 126, 140].map((x) => (
        <rect key={x} x={x} y="78" width="8" height="18" rx="2" fill="#E3ECFB" />
      ))}
    </svg>
  );
}
