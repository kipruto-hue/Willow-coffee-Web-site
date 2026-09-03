import { brand, footer, products } from '../content/site';
import { generalOrderLink } from '../lib/whatsapp';
import { LogoMark } from './LogoMark';
import { SectionLink } from './SectionLink';

/** Footer (master prompt §8, Act 5). */
export function Footer() {
  return (
    <footer className="footer on-dark">
      <div className="shell footer__grid">
        <div className="footer__brand">
          <LogoMark />
          <p className="footer__tagline">{brand.tagline}</p>
        </div>

        <div>
          <h2>{footer.quickLinksTitle}</h2>
          <ul>
            {footer.quickLinks.map((link) => (
              <li key={link.target}>
                <SectionLink target={link.target}>{link.label}</SectionLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>{footer.coffeesTitle}</h2>
          <ul>
            {products.map((item) => (
              <li key={item.id}>
                <SectionLink target="product">{item.name}</SectionLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>{footer.contactTitle}</h2>
          <ul>
            <li>{brand.location}</li>
            <li>
              <a href={`mailto:${brand.email}`}>{brand.email}</a>
            </li>
            <li>
              <a href={generalOrderLink()} target="_blank" rel="noopener noreferrer">
                {footer.whatsappLabel}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <p className="shell footer__legal">{brand.copyright}</p>
    </footer>
  );
}
