/**
 * Types for the single copy source (build plan decision D2).
 *
 * Every string the site shows lives in `site.ts`. Four consumers read it — the
 * WebGL path, the lite path, the build-time prerender, and the JSON-LD — so it
 * has exactly one definition. `copy.fidelity.test.ts` asserts the strings against
 * a fixture transcribed from master prompt §8; if they drift, the build fails.
 */

export type ActId = 'hero' | 'origin' | 'journey' | 'product' | 'quality';

export interface NavLink {
  /** Section id to scroll to, without the leading '#'. */
  readonly target: string;
  readonly label: string;
}

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly badge: 'RETAIL' | 'LIMITED' | 'WHOLESALE';
  /** Tasting notes. Absent on the unbranded wholesale bag, by design. */
  readonly notes?: readonly string[];
  readonly description: string;
  readonly weights: readonly string[];
  readonly grinds: readonly string[];
}

export interface JourneyStep {
  readonly number: string;
  readonly stage: string;
  readonly title: string;
  readonly body: string;
}

export interface Testimonial {
  readonly quote: string;
  readonly name: string;
  readonly role: string;
  readonly place: string;
}

export interface Credential {
  readonly title: string;
  readonly body: string;
}

export interface Sdg {
  readonly number: string;
  readonly label: string;
}

export interface PackagingBlurb {
  readonly title: string;
  readonly body: string;
}

export interface ContactSubject {
  readonly value: string;
  readonly label: string;
}
