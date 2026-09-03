import { SiteContent } from '../SiteContent';

/**
 * The lite path (§10, and the file §4 asks for by name).
 *
 * A complete, no-WebGL version of the site: same copy, same products, same CTAs,
 * brand art as CSS. It is served to the `low` tier, to `prefers-reduced-motion`
 * (decision D3), when WebGL fails to initialise, and to a device the frame meter
 * demotes mid-session.
 *
 * It is `SiteContent` and nothing else — see the reasoning there. The lite path
 * is not a reduced copy of the site; it is the site, without the decoration.
 * Nothing in this module's import graph reaches `three`, which is what keeps the
 * 3D chunk off the wire entirely for these visitors (§9).
 */
export function LiteApp() {
  return <SiteContent />;
}
