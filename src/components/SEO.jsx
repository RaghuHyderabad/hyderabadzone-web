import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'HyderabadZone'
const SITE_URL  = 'https://www.hyderabadzone.com'
const DEFAULT_IMG = 'https://www.hyderabadzone.com/og-image.jpg'

export default function SEO({
  title,
  description,
  canonical,
  image,
  noindex = false,
  schema,
  breadcrumbs,
  type = 'website',
}) {
  const fullTitle = title
    ? `${title} | HyderabadZone`
    : 'HyderabadZone – Find Plots, Flats & Villas in Hyderabad'

  const metaDesc = description ||
    'Discover verified properties in Hyderabad. Plots, flats, villas & independent houses. Direct owner contact, zero brokerage.'

  const canonicalUrl = canonical
    ? `${SITE_URL}${canonical}`
    : SITE_URL

  const ogImage = image || DEFAULT_IMG

  // Breadcrumb schema
  const breadcrumbSchema = breadcrumbs ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.name,
      item: `${SITE_URL}${b.url}`,
    })),
  } : null

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, follow" />}

      {/* Open Graph */}
      <meta property="og:type"        content={type} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:url"         content={canonicalUrl} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image"       content={ogImage} />

      {/* Breadcrumb Schema */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* Custom Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  )
}
