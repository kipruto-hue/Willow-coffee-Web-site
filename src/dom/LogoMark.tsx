/**
 * PLACEHOLDER brand mark — see docs/ASSETS.md.
 *
 * The real Willow logo has not been supplied. This stands in with the shape the
 * brief describes (§6): a dark bean silhouette in --bean, cream willow branches
 * and a central S-curve trunk. It obeys every §2 logo rule — flat, upright,
 * unstretched, unshadowed, brand colours only — so nothing downstream has to be
 * rebuilt when the official SVG arrives: swap this component's innards, keep the
 * interface.
 *
 * `preserveAspectRatio` is left at its default so the mark can never be stretched
 * by a container, whatever a caller does with width/height.
 */
export function LogoMark({
  className,
  title = 'Willow Coffee',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      focusable="false"
    >
      {/* bean */}
      <ellipse cx="32" cy="34" rx="20" ry="25" fill="var(--bean)" />
      {/* central S-curve trunk */}
      <path
        d="M32 12c-6 8-6 13 0 21s6 13 0 21"
        fill="none"
        stroke="var(--cream)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* drooping willow branches */}
      <g fill="none" stroke="var(--cream)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M32 22c-5 1.5-8 4.5-9.5 8.5" />
        <path d="M32 30c-5.5 1.5-8.5 4.5-10 8.5" />
        <path d="M32 38c-5 1.5-7.5 4-9 7.5" />
        <path d="M32 26c5 1.5 8 4.5 9.5 8.5" />
        <path d="M32 34c5.5 1.5 8.5 4.5 10 8.5" />
      </g>
      <g fill="var(--cream)">
        <ellipse cx="22" cy="31" rx="2.6" ry="1.3" transform="rotate(35 22 31)" />
        <ellipse cx="21.5" cy="39" rx="2.6" ry="1.3" transform="rotate(35 21.5 39)" />
        <ellipse cx="22.8" cy="46" rx="2.4" ry="1.2" transform="rotate(35 22.8 46)" />
        <ellipse cx="42" cy="35" rx="2.6" ry="1.3" transform="rotate(-35 42 35)" />
        <ellipse cx="42.5" cy="43" rx="2.6" ry="1.3" transform="rotate(-35 42.5 43)" />
      </g>
    </svg>
  );
}
