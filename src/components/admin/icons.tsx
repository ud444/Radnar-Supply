type P = { className?: string };
const base = "shrink-0";

export const Icon = {
  dashboard: ({ className = "" }: P) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={`${base} ${className}`}>
      <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
    </svg>
  ),
  bag: ({ className = "" }: P) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={`${base} ${className}`}>
      <path d="M6 7h12l-1.2 13H7.2L6 7Z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/>
    </svg>
  ),
  tag: ({ className = "" }: P) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={`${base} ${className}`}>
      <path d="M12 2H4v8l10 10 8-8L12 2z"/><circle cx="7.5" cy="6.5" r="1.2" fill="currentColor"/>
    </svg>
  ),
  layers: ({ className = "" }: P) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={`${base} ${className}`}>
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/>
    </svg>
  ),
  list: ({ className = "" }: P) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={`${base} ${className}`}>
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/>
    </svg>
  ),
  users: ({ className = "" }: P) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={`${base} ${className}`}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  settings: ({ className = "" }: P) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={`${base} ${className}`}>
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  search: ({ className = "" }: P) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={`${base} ${className}`}>
      <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
    </svg>
  ),
  plus: ({ className = "" }: P) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={`${base} ${className}`}>
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  arrowUp: ({ className = "" }: P) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={`${base} ${className}`}>
      <path d="m7 17 10-10M7 7h10v10"/>
    </svg>
  ),
  inbox: ({ className = "" }: P) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={`${base} ${className}`}>
      <path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5 4h14l2 9v6H3v-6L5 4Z"/>
    </svg>
  ),
  file: ({ className = "" }: P) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={`${base} ${className}`}>
      <path d="M14 2H6v20h12V6l-4-4Z"/><path d="M14 2v4h4"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>
    </svg>
  ),
  image: ({ className = "" }: P) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={`${base} ${className}`}>
      <rect x="3" y="4" width="18" height="16"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 16-5-5-7 7"/>
    </svg>
  ),
};

export function Sparkline({ values, color = "#FF4D00" }: { values: number[]; color?: string }) {
  if (values.length < 2) values = [0, 0];
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const w = 200; const h = 50;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(" ");
  const area = `0,${h} ${points} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12 mt-3" preserveAspectRatio="none">
      <polygon points={area} fill={color} opacity="0.12" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}
