import { testimonials } from '../content/site';

/** Master prompt §8, Act 5: four testimonials, verbatim. */
export function Testimonials() {
  return (
    <section className="act testimonials" aria-labelledby="testimonials-title">
      <div className="shell">
        {/*
          §8 supplies the four quotes but no heading for the block. Rather than
          invent brand voice, the heading is present for structure and hidden
          visually. Ask Erick for the real one — see docs/COPY_GAPS.md.
        */}
        <h2 id="testimonials-title" className="visually-hidden">
          Testimonials
        </h2>

        <div className="testimonials__grid">
          {testimonials.map((t) => (
            <figure key={t.name} className="testimonial">
              <blockquote>
                <p>{t.quote}</p>
              </blockquote>
              <figcaption>
                <b>{t.name}</b>
                {` — ${t.role}, ${t.place}`}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
