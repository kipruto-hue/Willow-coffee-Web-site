import { SectionLink } from './SectionLink';
import type { ActId } from '../content/types';

/**
 * A centered vertical guide at the foot of a section: a thin line with a falling
 * dot that draws the eye downward and, when clicked, scrolls to the next
 * section. The line is the visual cue; the whole thing is a real link.
 */
export function ScrollGuide({ target, label = 'scroll' }: { target: ActId; label?: string }) {
  return (
    <SectionLink target={target} className="scroll-guide" aria-label={`Continue to ${label}`}>
      <span className="scroll-guide__label">{label}</span>
      <span className="scroll-guide__line" aria-hidden="true">
        <span className="scroll-guide__dot" />
      </span>
    </SectionLink>
  );
}
