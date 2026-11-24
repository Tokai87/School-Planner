const cal = (c: string, d: string) => (
  <>
    <rect x="4" y="8" width="34" height="32" rx="7" fill="#fff" stroke={c} strokeWidth="3.5" />
    <path d="M4 18v-3a7 7 0 0 1 7-7h20a7 7 0 0 1 7 7v3z" fill={c} />
    <rect x="12" y="3" width="4.5" height="9" rx="2.2" fill={d} />
    <rect x="26" y="3" width="4.5" height="9" rx="2.2" fill={d} />
  </>
);

export function TimetableIcon() {
  return (
    <svg viewBox="0 0 52 52" width="52" height="52" aria-hidden="true">
      {cal("#3B82F6", "#1E40AF")}
      {[11, 19, 27].map((x) => [24, 31].map((y) => <rect key={`${x}${y}`} x={x} y={y} width="5" height="5" rx="1.5" fill="#60A5FA" />))}
      <circle cx="38" cy="38" r="11" fill="#1E3A8A" stroke="#fff" strokeWidth="2.5" />
      <path d="M38 31.5V38l4.5 2.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function HomeworkIcon() {
  return (
    <svg viewBox="0 0 52 52" width="52" height="52" aria-hidden="true">
      <rect x="7" y="8" width="30" height="38" rx="6" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="3.5" />
      <rect x="15" y="3" width="14" height="9" rx="4" fill="#8B5CF6" />
      <path d="M13 22h18M13 29h12" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
      <circle cx="37" cy="38" r="11" fill="#7C3AED" stroke="#fff" strokeWidth="2.5" />
      <path d="M31.5 38l4 4 7-8" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ExamIcon() {
  return (
    <svg viewBox="0 0 52 52" width="52" height="52" aria-hidden="true">
      <rect x="8" y="9" width="32" height="38" rx="5" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="2" transform="rotate(-8 24 28)" />
      <rect x="11" y="6" width="32" height="40" rx="5" fill="#fff" stroke="#60A5FA" strokeWidth="2.5" />
      <path d="M17 14h10M17 20h7" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
      <text x="27" y="40" textAnchor="middle" fontFamily="Poppins,sans-serif" fontWeight="800" fontSize="17" fill="#EF4444">A+</text>
    </svg>
  );
}

export function EventsIcon() {
  return (
    <svg viewBox="0 0 52 52" width="52" height="52" aria-hidden="true">
      {cal("#F97316", "#C2410C")}
      {[11, 19, 27].map((x) => [24, 31].map((y) => <rect key={`${x}${y}`} x={x} y={y} width="5" height="5" rx="1.5" fill="#FDBA74" />))}
      <path d="M39 26l3.4 7 7.6 1.1-5.5 5.4 1.3 7.6-6.8-3.6-6.8 3.6 1.3-7.6-5.5-5.4 7.6-1.1z" fill="#FBBF24" stroke="#fff" strokeWidth="2" strokeLinejoin="round" transform="translate(-2 -2) scale(.92)" />
    </svg>
  );
}
