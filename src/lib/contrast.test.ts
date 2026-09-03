import { describe, expect, it } from 'vitest';
import { AA_LARGE, AA_NORMAL, contrastRatio, type Hex } from './contrast';

/**
 * Every text-on-background pairing the site actually uses (§10: "All text meets
 * WCAG AA contrast... Verify every pairing").
 *
 * This audit found two real failures rather than confirming a hunch: cream body
 * text on raw `--willow-green` (4.06:1) and on raw `--amber-deep` (4.31:1), both
 * under the 4.5:1 floor. The Journey gradient stops were deepened toward
 * `--bean` in response — see the note in tokens.css. `--bean` on `--amber-deep`
 * also only clears the *large text* threshold, so that end of the hero gradient
 * carries display type and never body copy.
 *
 * The brief asserts `--bean` on `--marigold` passes. It does, at 7.9:1.
 */
const T = {
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
  // Deepened gradient stops — see the note in tokens.css.
  journeyTop: '#5E5B20',
  journeyMid: '#8E4107',
  stepCard: '#43280B',
} satisfies Record<string, Hex>;

const normalText: [string, Hex, Hex][] = [
  ['bean on marigold (quality act, §10 names this one)', T.bean, T.marigold],
  ['bean on amber-yellow (hero, top of gradient)', T.bean, T.amberYellow],
  ['bean on amber-orange (hero, mid gradient)', T.bean, T.amberOrange],
  ['bean on cream (origin, testimonials)', T.bean, T.cream],
  ['bean-soft on cream (secondary copy)', T.beanSoft, T.cream],
  ['cream on bean (contact, footer)', T.cream, T.bean],
  ['cream on maroon (journey step 04)', T.cream, T.maroon],
  ['cream on journey-top (journey entry)', T.cream, T.journeyTop],
  ['cream on journey-mid (journey mid)', T.cream, T.journeyMid],
  ['cream on the journey step card', T.cream, T.stepCard],
  ['bean on tan (alt premium surface)', T.bean, T.tan],
];

const largeText: [string, Hex, Hex][] = [
  ['bean on amber-deep (hero display type only)', T.bean, T.amberDeep],
];

describe('WCAG AA contrast', () => {
  it.each(normalText)('%s meets AA for body text', (_label, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it.each(largeText)('%s meets AA for large text', (_label, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(AA_LARGE);
  });

  it('computes known reference values correctly', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });
});
