/**
 * WCAG 2.1 relative luminance and contrast ratio.
 *
 * §10 requires AA on every text pairing and specifically says to *verify* each
 * one. A checklist item that says "verify contrast" gets ticked by eye and is
 * wrong six weeks later; a function gets asserted in CI (see contrast.test.ts).
 */

export type Hex = `#${string}`;

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: Hex): number {
  const n = parseInt(hex.slice(1), 16);
  const r = channel((n >> 16) & 255);
  const g = channel((n >> 8) & 255);
  const b = channel(n & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** 1 (identical) to 21 (black on white). */
export function contrastRatio(a: Hex, b: Hex): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** AA: 4.5 for body text, 3.0 for large text (>=24px, or >=18.66px bold). */
export const AA_NORMAL = 4.5;
export const AA_LARGE = 3;
