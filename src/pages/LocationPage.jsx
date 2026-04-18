import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { MapPin, TrendingUp, Loader2 } from 'lucide-react'
import { locationsApi } from '../api/index'
import SEO from '../components/SEO'
import PropertyCard from '../components/ui/PropertyCard'

const TYPES = [
  { label: 'Open Plots',         type: 'plots',              icon: '🌿', desc: 'HMDA, DTCP approved plots' },
  { label: 'Flats',              type: 'flats',              icon: '🏢', desc: '1BHK, 2BHK, 3BHK apartments' },
  { label: 'Villas',             type: 'villas',             icon: '🏡', desc: 'Luxury independent villas' },
  { label: 'Independent Houses', type: 'independent-houses', icon: '🏠', desc: 'Individual houses & plots' },
]

export default function LocationPage() {
  const { locationSlug } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['location', locationSlug],
    queryFn:  () => locationsApi.get(locationSlug),
  })

  if (isLoading) return (
    <div className="flex justify-center py-24">
      <Loader2 className="w-8 h-8 text-brand animate-spin" />
    </div>
  )

  if (!data?.location) return (
    <div className="text-center py-24">
      <div className="text-5xl mb-4">🏘️</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Location not found</h1>
      <p className="text-gray-500 mb-6">We couldn't find this location in Hyderabad.</p>
      <Link to="/" className="btn-brand">Go Home</Link>
    </div>
  )

  const loc = data.location

  const schema = loc ? {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: loc.name + ', Hyderabad',
    address: { '@type': 'PostalAddress', addressLocality: loc.name, addressRegion: 'Telangana', addressCountry: 'IN' },
  } : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {loc && (
        <SEO
          title={`${loc.name} Properties for Sale | Plots, Villas & Flats`}
          description={`Explore properties in ${loc.name}, Hyderabad. Find plots, villas, and flats with latest prices. Direct owner contact, zero brokerage.`}
          canonical={`/${locationSlug}`}
          schema={schema}
          breadcrumbs={[{ name: 'Home', url: '/' }, { name: loc.name, url: `/${locationSlug}` }]}
        />
      )}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-brand">Home</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{loc.name}</span>
      </div>

      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-brand" />
          <span className="text-sm text-gray-500">{loc.zone} Hyderabad</span>
          {loc.is_featured && (
            <span className="flex items-center gap-1 text-orange-500 text-sm font-medium">
              <TrendingUp className="w-4 h-4" /> Emerging Zone
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Properties in {loc.name}, Hyderabad
        </h1>
        <p className="text-gray-500 max-w-2xl">
          Browse verified plots, flats, villas and independent houses in {loc.name}.
          Direct owner contact · Zero brokerage · Admin verified listings.
        </p>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">What are you looking for?</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {TYPES.map(t => (
          <Link key={t.type} to={`/${locationSlug}/${t.type}`}
            className="card p-6 text-center hover:border-brand hover:shadow-lg transition group">
            <div className="text-4xl mb-3">{t.icon}</div>
            <div className="font-semibold text-gray-900 mb-1 group-hover:text-brand">{t.label}</div>
            <div className="text-xs text-gray-400">{t.desc}</div>
          </Link>
        ))}
      </div>

      {data?.properties?.data?.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">All Properties in {loc.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data.properties.data.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </div>
      )}

      <div className="mt-12 bg-surface rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">About {loc.name}, Hyderabad</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          {loc.name} is a {loc.is_featured ? 'rapidly growing emerging zone' : 'well-established locality'} in the {loc.zone} zone of Hyderabad.
          Find the best residential properties including plots, flats, villas and independent houses in {loc.name} at competitive prices.
          All listings are verified by our admin team for authenticity.
        </p>
      </div>
    </div>
  )
}
