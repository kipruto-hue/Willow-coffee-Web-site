/**
 * The real Willow Coffee bean mark.
 *
 * Taken from the brand's existing site (p14fh7evs4g1-d.space-z.ai/logo.png),
 * 256×341 RGBA. Its silhouette samples to exactly #371101 — the `--bean` token
 * in tokens.css is confirmed correct against a real brand asset.
 *
 * Note: the willow strokes in the artwork are pure #FFFFFF, not `--cream`
 * (#F7F0DA). The mark ships exactly as supplied — §2 forbids recolouring the
 * logo, so the discrepancy is recorded in docs/ASSETS.md rather than "fixed".
 *
 * Intrinsic width/height are declared so the aspect ratio is fixed by the
 * markup: no container can stretch it, whatever a caller does with CSS (§2,
 * logo integrity). A vector version should replace this PNG before launch.
 */
export function LogoMark({
  className,
  title = 'Willow Coffee',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <img
      className={className}
      src="/brand/willow-logo.png"
      alt={title}
      width={256}
      height={341}
      decoding="async"
    />
  );
}
