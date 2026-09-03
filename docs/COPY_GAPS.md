# COPY GAPS

Master prompt §2 forbids inventing data and §12.9 requires §8's copy verbatim. §8 covers
the substance completely — every headline, product, credential, and testimonial. What it
does not cover is a handful of small structural strings the page needs to be a page.

Rather than write brand voice on Willow's behalf, they are listed here for Erick to supply
or approve. None of them makes a claim about the coffee.

| Where | String in the build now | Status |
|---|---|---|
| Testimonials block heading | `Testimonials` | Hidden visually, present for screen readers and document outline. Needs a real heading if the block should have a visible one. |
| Contact section eyebrow | `Contact` | Placeholder. |
| Contact section heading | `talk to us` | Placeholder, written to match the lowercase house style. |
| Contact submit button | `send enquiry` | Placeholder. |
| Footer column headings | `quick links`, `our coffees`, `contact` | Taken from the §8 footer description, which names the columns but not their exact headings. |
| Preloader label | `brewing…` / `welcome` | Placeholder. |
| Nav order button | `order on whatsapp` | Taken verbatim from the §8 footer, reused in the nav and sticky CTA. |
| Origin media caption | `north rift · nandi hills · kitale` | Placeholder label on the fallback panel; disappears when the real harvest sequence lands. |

**Expansions, not inventions:** the three §8 packaging blurbs are given as a title plus a
parenthetical. Their bodies in `src/content/site.ts` carry **only** that supplied detail —
no new claims. If fuller blurbs are wanted, the brand supplies the words.
