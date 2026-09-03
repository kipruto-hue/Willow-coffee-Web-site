import { Color } from 'three';

/**
 * The brand palette, read once out of CSS so `tokens.css` stays the single
 * source of truth even for the 3D scene (§6). Nothing in `src/canvas/` hardcodes
 * a colour.
 */
export interface BrandColors {
  marigold: Color;
  amberOrange: Color;
  amberYellow: Color;
  amberDeep: Color;
  bean: Color;
  beanSoft: Color;
  cream: Color;
  tan: Color;
  willowGreen: Color;
  maroon: Color;
}

const FALLBACK: Record<keyof BrandColors, string> = {
  marigold: '#FAAF40',
  amberOrange: '#DD7310',
  amberYellow: '#F1C82D',
  amberDeep: '#B4560A',
  bean: '#371101',
  beanSoft: '#4B2F23',
  cream: '#F7F0DA',
  tan: '#A58B50',
  willowGreen: '#6E7B2E',
  maroon: '#6E1E1A',
};

const CSS_NAME: Record<keyof BrandColors, string> = {
  marigold: '--marigold',
  amberOrange: '--amber-orange',
  amberYellow: '--amber-yellow',
  amberDeep: '--amber-deep',
  bean: '--bean',
  beanSoft: '--bean-soft',
  cream: '--cream',
  tan: '--tan',
  willowGreen: '--willow-green',
  maroon: '--maroon',
};

let cached: BrandColors | null = null;

export function brandColors(): BrandColors {
  if (cached) return cached;
  const style = typeof window === 'undefined' ? null : getComputedStyle(document.documentElement);
  const entries = Object.entries(CSS_NAME).map(([key, cssName]) => {
    const value = style?.getPropertyValue(cssName).trim();
    return [key, new Color(value || FALLBACK[key as keyof BrandColors])] as const;
  });
  cached = Object.fromEntries(entries) as unknown as BrandColors;
  return cached;
}
