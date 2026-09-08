/**
 * The connective thread between sections: a centred vertical line and a small
 * arrow that carries the eye down through the story. Decorative, so hidden from
 * assistive tech; the real navigation is the nav and the section links.
 */
export function StoryThread() {
  return (
    <div className="story-thread" aria-hidden="true">
      <span className="story-thread__line" />
      <span className="story-thread__arrow" />
    </div>
  );
}
