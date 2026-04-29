import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { MapPin, TrendingUp, Loader2, ShieldCheck, Users, BadgeCheck } from 'lucide-react'
import { propertiesApi, locationsApi } from '../api/index'
import PropertyCard from '../components/ui/PropertyCard'
import SEO, { buildLocationTypeSEO } from '../components/SEO'

const TYPE_MAP = {
  'plots':               'plot',
  'flats':               'flat',
  'villas':              'villa',
  'independent-houses':  'house',
}

const TYPE_LABELS = {
  'plots':               'Open Plots',
  'flats':               'Flats & Apartments',
  'villas':              'Villas',
  'independent-houses':  'Independent Houses',
}

const TrustBadge = () => (
  <div className="inline-flex flex-wrap items-center gap-x-4 gap-y-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-2.5 mt-3">
    <span className="flex items-center gap-1.5 text-green-700 text-sm font-medium">
      <Users className="w-4 h-4" /> Direct Owner Contact
    </span>
    <span className="text-green-300 hidden sm:inline">|</span>
    <span className="flex items-center gap-1.5 text-green-700 text-sm font-medium">
      <ShieldCheck className="w-4 h-4" /> Zero Brokerage
    </span>
    <span className="text-green-300 hidden sm:inline">|</span>
    <span className="flex items-center gap-1.5 text-green-700 text-sm font-medium">
      <BadgeCheck className="w-4 h-4" /> Admin Verified Listings
    </span>
  </div>
)

export default function LocationTypePage() {
  const { locationSlug, propertyType } = useParams()
  const dbType = TYPE_MAP[propertyType]

  const { data: locData } = useQuery({
    queryKey: ['location', locationSlug],
    queryFn:  () => locationsApi.get(locationSlug),
  })

  const { data: propsData, isLoading: propsLoading } = useQuery({
    queryKey: ['properties', locationSlug, propertyType],
    queryFn:  () => propertiesApi.list({ location_slug: locationSlug, type: dbType, per_page: 12 }),
    enabled:  !!dbType,
  })

  if (!dbType) return (
    <div className="text-center py-24">
      <div className="text-5xl mb-4">❌</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Page not found</h1>
      <p className="text-gray-500 mb-6">Invalid property type.</p>
      <Link to="/" className="btn-brand">Go Home</Link>
    </div>
  )

  const loc        = locData?.location
  const properties = propsData?.data ?? []
  const typeLabel  = TYPE_LABELS[propertyType]
  const total      = propsData?.pagination?.total ?? properties.length

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" style={{minHeight:"100vh"}}>
      <SEO {...buildLocationTypeSEO(loc, locationSlug, propertyType, typeLabel)} />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-brand">Home</Link>
        <span>/</span>
        <Link to={`/${locationSlug}`} className="hover:text-brand capitalize">{loc?.name ?? locationSlug}</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{typeLabel}</span>
      </div>

      {/* Hero Header */}
      <div className="mb-8">
        {loc && (
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-brand" />
            <span className="text-sm text-gray-500">{loc.zone} Hyderabad</span>
            {loc.is_featured && (
              <span className="flex items-center gap-1 text-orange-500 text-sm">
                <TrendingUp className="w-3.5 h-3.5" /> Emerging Zone
              </span>
            )}
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {typeLabel} in {loc?.name ?? locationSlug}, Hyderabad
        </h1>
        <p className="text-gray-500 text-sm">
          Buy verified {typeLabel.toLowerCase()} in {loc?.name ?? locationSlug} — direct from owners.
        </p>

        {/* ✅ Trust Badge */}
        <TrustBadge />
      </div>

      {/* Property Type Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(TYPE_LABELS).map(([slug, label]) => (
          <Link key={slug} to={`/${locationSlug}/${slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition
              ${slug === propertyType
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-gray-600 border-gray-200 hover:border-brand'}`}>
            {label}
          </Link>
        ))}
      </div>

      {/* Properties Grid */}
      {propsLoading ? (
        <div className="flex justify-center py-16" style={{minHeight:"40vh"}}>
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🏘️</div>
          <p className="font-medium text-gray-700">No {typeLabel.toLowerCase()} listed in {loc?.name} yet.</p>
          <p className="text-sm mt-1 mb-5">Check back soon or browse other areas.</p>
          <TrustBadge />
          <div className="mt-6">
            <Link to={`/${locationSlug}`} className="btn-outline">
              ← Back to {loc?.name}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-800">{total}</span> {typeLabel.toLowerCase()} found in {loc?.name}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {properties.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </>
      )}

      {/* SEO Content */}
      <div className="mt-12 bg-surface rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          {typeLabel} in {loc?.name} — Buying Guide
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Looking to buy {typeLabel.toLowerCase()} in {loc?.name}, Hyderabad?
          HyderabadZone lists only verified properties with direct owner contact.
          No brokers, no commissions — just straightforward property buying in {loc?.name}.
          Browse our listings and WhatsApp the owner directly for site visits and negotiations.
        </p>
      </div>
    </div>
  )
}
