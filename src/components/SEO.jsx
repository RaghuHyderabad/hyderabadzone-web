import { Helmet } from 'react-helmet-async'

const SITE_NAME   = 'HyderabadZone'
const SITE_URL    = 'https://www.hyderabadzone.com'
const DEFAULT_IMG = 'https://www.hyderabadzone.com/og-image.jpg'

// ── Helper: truncate to max chars ──────────────────────────
const trunc = (str, max) => str?.length > max ? str.slice(0, max - 3) + '...' : str

export default function SEO({
  title,
  description,
  canonical,
  image,
  noindex  = false,
  schema,
  breadcrumbs,
  type     = 'website',
  keywords,
}) {
  // Title ≤ 70 chars
  const fullTitle = trunc(
    title ? `${title} | HyderabadZone` : 'HyderabadZone – Find Plots, Flats & Villas in Hyderabad',
    70
  )

  // Description ≤ 160 chars
  const metaDesc = trunc(
    description ||
    'Discover verified properties in Hyderabad. Plots, flats, villas & independent houses. Direct owner contact, zero brokerage.',
    160
  )

  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : SITE_URL
  const ogImage      = image || DEFAULT_IMG

  // Breadcrumb schema
  const breadcrumbSchema = breadcrumbs ? {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: breadcrumbs.map((b, i) => ({
      '@type':   'ListItem',
      position:  i + 1,
      name:      b.name,
      item:      `${SITE_URL}${b.url}`,
    })),
  } : null

  // Organization schema — always included
  const orgSchema = {
    '@context':  'https://schema.org',
    '@type':     'Organization',
    name:        'HyderabadZone',
    url:         SITE_URL,
    logo:        `${SITE_URL}/logo.png`,
    description: 'Hyderabad real estate platform. Direct owner contact, zero brokerage.',
    areaServed:  'Hyderabad, Telangana, India',
  }

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical"    href={canonicalUrl} />

      {/* Indexing */}
      {noindex
        ? <meta name="robots" content="noindex, follow" />
        : <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      }

      {/* Keywords */}
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph */}
      <meta property="og:type"         content={type} />
      <meta property="og:title"        content={fullTitle} />
      <meta property="og:description"  content={metaDesc} />
      <meta property="og:url"          content={canonicalUrl} />
      <meta property="og:image"        content={ogImage} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name"    content={SITE_NAME} />
      <meta property="og:locale"       content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image"       content={ogImage} />
      <meta name="twitter:site"        content="@hyderabadzone" />

      {/* Geo Tags */}
      <meta name="geo.region"   content="IN-TG" />
      <meta name="geo.placename" content="Hyderabad" />
      <meta name="geo.position" content="17.3850;78.4867" />
      <meta name="ICBM"         content="17.3850, 78.4867" />

      {/* Schemas */}
      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>

      {breadcrumbSchema && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      )}

      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  )
}

// ── Utility: Property page SEO ────────────────────────────
export function buildPropertySEO(p) {
  if (!p) return {}
  const loc    = p.location?.name || 'Hyderabad'
  const price  = p.formatted_price || ''
  const isSold = p.status === 'sold'

  // Title: 2BHK Flat for Sale in BN Reddy Nagar | ₹80L
  const parts = []
  if (p.bedrooms) parts.push(`${p.bedrooms}BHK`)
  parts.push(p.type?.charAt(0).toUpperCase() + p.type?.slice(1) || 'Property')
  parts.push(isSold ? `Sold in ${loc}` : `for Sale in ${loc}`)
  if (price) parts.push(`| ${price}`)
  const title = parts.join(' ')

  const size = p.area ? `${p.area} ${p.area_unit}` : ''
  const desc  = `Buy ${p.type} in ${loc}, Hyderabad for ${price}. ${size ? size + '. ' : ''}${p.facing ? p.facing + ' facing. ' : ''}Direct owner contact. No brokerage.`

  const keywords = [
    `${p.type} in ${loc}`,
    `${p.type} for sale in ${loc}`,
    `property in ${loc} Hyderabad`,
    p.bedrooms ? `${p.bedrooms}bhk flat in ${loc}` : '',
    `plots in ${loc}`,
  ].filter(Boolean).join(', ')

  const schema = {
    '@context': 'https://schema.org',
    '@type':    'RealEstateListing',
    name:        p.title,
    description: p.description || desc,
    url:         `https://www.hyderabadzone.com/property/${p.slug}`,
    image:        p.thumbnail || '',
    offers: {
      '@type':        'Offer',
      price:           p.price,
      priceCurrency:  'INR',
      availability:   isSold
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock',
    },
    address: {
      '@type':         'PostalAddress',
      addressLocality: loc,
      addressRegion:   'Telangana',
      addressCountry:  'IN',
    },
    seller: { '@type': 'Person', name: p.owner?.name || 'Owner' },
  }

  return {
    title,
    description:  desc,
    canonical:    `/property/${p.slug}`,
    image:         p.thumbnail,
    noindex:       p.status === 'expired',
    keywords,
    schema,
    type:         'article',
    breadcrumbs: [
      { name: 'Home',   url: '/' },
      { name: loc,      url: `/${p.location?.slug}` },
      { name: p.title,  url: `/property/${p.slug}` },
    ],
  }
}

// ── Utility: Location page SEO ────────────────────────────
export function buildLocationSEO(loc, slug) {
  const name = loc?.name || slug
  return {
    title:       `${name} Properties for Sale | Plots, Flats & Villas`,
    description: `Explore properties in ${name}, Hyderabad. Find plots, flats, and villas with latest prices. Direct owner contact, zero brokerage.`,
    canonical:   `/${slug}`,
    keywords:    `properties in ${name}, plots in ${name}, flats in ${name}, villas in ${name}, property in ${name} Hyderabad`,
    schema: {
      '@context': 'https://schema.org',
      '@type':    'Place',
      name:       `${name}, Hyderabad`,
      address: {
        '@type':         'PostalAddress',
        addressLocality: name,
        addressRegion:   'Telangana',
        addressCountry:  'IN',
      },
    },
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name,         url: `/${slug}` },
    ],
  }
}

// ── Utility: Location + Type page SEO ─────────────────────
export function buildLocationTypeSEO(loc, slug, propertyType, typeLabel) {
  const name = loc?.name || slug
  return {
    title:       `${typeLabel} in ${name} Hyderabad for Sale | Prices`,
    description: `Discover ${typeLabel.toLowerCase()} in ${name}, Hyderabad. Compare prices and investment opportunities. Direct owner contact, zero brokerage.`,
    canonical:   `/${slug}/${propertyType}`,
    keywords:    `${typeLabel.toLowerCase()} in ${name}, ${typeLabel.toLowerCase()} for sale in ${name}, property in ${name} Hyderabad`,
    breadcrumbs: [
      { name: 'Home',    url: '/' },
      { name,            url: `/${slug}` },
      { name: typeLabel, url: `/${slug}/${propertyType}` },
    ],
  }
}
