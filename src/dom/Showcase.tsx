/**
 * Interstitial showcase between the origin story and the journey: the packaging
 * floating over a dark macro-beans backdrop, so the vibrant pouch and cup pop.
 * Decorative visual, so the packaging images are hidden from assistive tech; the
 * real product info lives in the Products section.
 *
 * Deliberately NOT wired to `useActProgress`. The draft registered this section
 * as the `product` act — but that hook is not a read, it WRITES shared state:
 * `setActProgress`, `setActNear`, and `setActiveAct`. Two sections claiming one
 * act id means scrolling through here would mark the product act active while
 * the visitor is nowhere near it — highlighting Products in the nav, cueing the
 * stage's product clip early, and (since 09b) hiding the sticky CTA on the wrong
 * screen. Nothing in this component reads act progress: the floats are CSS
 * animations, so the correct wiring is none.
 */
export function Showcase() {
  return (
    <section className="showcase" aria-label="Willow coffee packaging">
      <div className="showcase__bg" aria-hidden="true">
        <img src="/media/koffee.jpg" width={650} height={975} alt="" />
      </div>
      <div className="showcase__scrim" aria-hidden="true" />

      <div className="shell showcase__inner">
        <div className="showcase__copy">
          <p className="eyebrow showcase__eyebrow">100% arabica · small-batch roasted</p>
          <p className="showcase__line">grown with nature</p>
        </div>

        <div className="showcase__stage" aria-hidden="true">
          <img
            className="float float--pouch"
            src="/media/pouch.webp"
            width={1096}
            height={1039}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <img
            className="float float--cup"
            src="/media/cup.webp"
            width={717}
            height={569}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}
