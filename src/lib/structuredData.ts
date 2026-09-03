import { brand, meta, products } from '../content/site';

/**
 * JSON-LD for Organization + the four Products (master prompt §11).
 *
 * No `offers` block: the brief gives no prices, and inventing them would be fake
 * data (§2) as well as a rich-result violation. Prices go in the moment the
 * brand supplies them.
 */
export function structuredData(siteUrl = 'https://willowscoffee.co.ke') {
  const organization = {
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: 'Willow Coffee Ltd',
    alternateName: brand.name,
    description: meta.description,
    email: brand.email,
    url: siteUrl,
    slogan: brand.tagline,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Nandi Hills',
      addressRegion: 'Rift Valley',
      addressCountry: 'KE',
    },
  };

  const productNodes = products.map((item) => ({
    '@type': 'Product',
    '@id': `${siteUrl}/#${item.id}`,
    name: item.name,
    description: item.description,
    category: item.badge === 'WHOLESALE' ? 'Wholesale coffee' : 'Specialty coffee',
    brand: { '@id': `${siteUrl}/#organization` },
    countryOfOrigin: 'KE',
    ...(item.notes ? { additionalProperty: item.notes.map(tastingNote) } : {}),
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [organization, ...productNodes],
  };
}

function tastingNote(note: string) {
  return { '@type': 'PropertyValue', name: 'Tasting note', value: note };
}
