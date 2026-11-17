// A flat, hand-drawn style picture used instead of stock photos.
// Four palettes; the post id picks one, so every article looks a little different.
const PALETTES = [
  { bg: '#fde6cf', a: '#f48024', b: '#2c5877', c: '#232629' },
  { bg: '#d9e9f6', a: '#2c5877', b: '#f48024', c: '#232629' },
  { bg: '#e3f2e0', a: '#f48024', b: '#2c5877', c: '#232629' },
  { bg: '#f6dfeb', a: '#232629', b: '#2c5877', c: '#f48024' },
];

// `variant` is any number; `width`/`height` default to the 260x136 thumbnail size.
export default function Illustration({ variant = 0, width = 260, height = 136, label = '' }) {
  const p = PALETTES[Math.abs(variant) % PALETTES.length];
  const v = Math.abs(variant) % 3;
  // Each variant places the same shapes differently, so the feed does not look copied.
  const shapes = [
    <circle key="s1" cx="78" cy="68" r="30" fill={p.a} />,
    <rect key="s2" x="118" y="44" width="56" height="48" rx="8" fill={p.c} />,
    <rect key="s3" x="30" y="50" width="70" height="36" rx="6" fill={p.b} />,
  ];
  const alt = [
    <rect key="t1" x="44" y="82" width="26" height="36" fill={p.c} />,
    <rect key="t2" x="78" y="60" width="26" height="58" fill={p.a} />,
    <rect key="t3" x="112" y="38" width="26" height="80" fill={p.b} />,
  ];
  return (
    <svg
      className="illustration"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      preserveAspectRatio="xMidYMid slice"
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : 'true'}
    >
      <rect width={width} height={height} fill={p.bg} />
      {v === 2 ? alt : shapes}
    </svg>
  );
}
