/** Colourful school building with a clock tower, used behind the characters. Decorative only. */
export function SchoolScene({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 150" aria-hidden="true">
      <rect x="6" y="64" width="228" height="82" rx="4" fill="#F5E2B6" />
      <rect x="92" y="28" width="62" height="118" fill="#F9ECCB" />
      <path d="M84 32 123 6l39 26z" fill="#E88A6A" />
      <path d="M0 64 34 46h172l34 18z" fill="#EE9A78" />
      <circle cx="123" cy="46" r="13" fill="#fff" stroke="#3B6FD1" strokeWidth="3" />
      <path d="M123 38v8l6 3" fill="none" stroke="#14224E" strokeWidth="2.4" strokeLinecap="round" />
      {[20, 44, 170, 194].map((x) => <rect key={x} x={x} y="78" width="18" height="26" rx="3" fill="#5B93E6" />)}
      {[20, 44, 170, 194].map((x) => <rect key={`b${x}`} x={x} y="112" width="18" height="24" rx="3" fill="#5B93E6" />)}
      {[104, 126].map((x) => <rect key={x} x={x} y="78" width="14" height="22" rx="3" fill="#5B93E6" />)}
      <rect x="108" y="112" width="30" height="34" rx="4" fill="#C9743F" />
    </svg>
  );
}

export function Tree({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 110" aria-hidden="true">
      <rect x="35" y="66" width="10" height="44" rx="4" fill="#9A6A3E" />
      <circle cx="40" cy="30" r="26" fill="#5DB36B" />
      <circle cx="22" cy="52" r="20" fill="#6CC17A" />
      <circle cx="58" cy="52" r="20" fill="#4FA55E" />
    </svg>
  );
}
