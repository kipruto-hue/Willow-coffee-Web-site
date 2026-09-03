import type { FormEvent } from 'react';
import { brand, contactSubjects } from '../content/site';
import { generalOrderLink } from '../lib/whatsapp';

/**
 * Contact (master prompt §8, Act 5).
 *
 * There is no backend in this stack and none is warranted, so the form posts to
 * a static-host form endpoint. Until Erick picks the host (build plan D5) the
 * action falls back to a `mailto:` compose — which works today, with no service
 * to sign up for, and degrades to the visitor's own mail client rather than to
 * a silently dropped submission.
 *
 * A form that appears to send and does not is worse than no form.
 */
const FORM_ENDPOINT: string | undefined = undefined; // set once the host is chosen

/**
 * Browsers handle `<form action="mailto:">` inconsistently and some drop it
 * silently, so the fallback composes the message itself and hands it to the
 * visitor's mail client. The visitor can see what is being sent, and nothing is
 * lost to a POST that goes nowhere.
 */
function composeMailto(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const get = (key: string) => String(data.get(key) ?? '').trim();

  const subjectValue = get('subject');
  const subjectLabel =
    contactSubjects.find((s) => s.value === subjectValue)?.label ?? 'Enquiry';

  const body = [
    `Name: ${get('name')}`,
    `Email: ${get('email')}`,
    get('phone') ? `Phone: ${get('phone')}` : null,
    '',
    get('message'),
  ]
    .filter((line) => line !== null)
    .join('\n');

  window.location.href = `mailto:${brand.email}?subject=${encodeURIComponent(
    `${subjectLabel} — willowscoffee.co.ke`,
  )}&body=${encodeURIComponent(body)}`;
}

export function Contact() {
  const usingMailto = !FORM_ENDPOINT;

  return (
    <section id="contact" className="act contact on-dark" aria-labelledby="contact-title">
      <div className="shell">
        <p className="eyebrow">Contact</p>
        <h2 id="contact-title" className="h-act" style={{ marginBlockStart: 'var(--space-s)' }}>
          talk to us
        </h2>

        <div className="contact__grid">
          <form
            action={FORM_ENDPOINT ?? `mailto:${brand.email}`}
            method="post"
            onSubmit={usingMailto ? composeMailto : undefined}
          >
            <div className="field">
              <label htmlFor="contact-name">Name</label>
              <input id="contact-name" name="name" type="text" autoComplete="name" required />
            </div>

            <div className="field">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="contact-phone">Phone (optional)</label>
              <input id="contact-phone" name="phone" type="tel" autoComplete="tel" />
            </div>

            <div className="field">
              <label htmlFor="contact-subject">Subject</label>
              <select id="contact-subject" name="subject" defaultValue="order">
                {contactSubjects.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="contact-message">Message</label>
              <textarea id="contact-message" name="message" required />
            </div>

            <button type="submit" className="btn btn--ghost">
              send enquiry
            </button>
          </form>

          <aside className="contact__aside">
            <dl>
              <div>
                <dt>Where we are</dt>
                <dd>{brand.location}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${brand.email}`}>{brand.email}</a>
                </dd>
              </div>
              <div>
                <dt>WhatsApp</dt>
                <dd>
                  <a href={generalOrderLink()} target="_blank" rel="noopener noreferrer">
                    order on whatsapp
                  </a>
                </dd>
              </div>
            </dl>

            <iframe
              className="contact__map"
              title="Willow Coffee — Nandi Hills, Rift Valley, Kenya"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.openstreetmap.org/export/embed.html?bbox=34.98%2C0.03%2C35.24%2C0.20&layer=mapnik&marker=0.1046%2C35.1756"
            />
          </aside>
        </div>
      </div>
    </section>
  );
}
