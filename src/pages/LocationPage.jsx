// src/pages/LocationPage.jsx
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { MapPin, TrendingUp, Loader2 } from 'lucide-react'
import { locationsApi } from '../api/index'
import PropertyCard from '../components/ui/PropertyCard'
import SearchBar from '../components/search/SearchBar'

export default function LocationPage() {
  const { locationSlug, type } = useParams()
  const slug = locationSlug || ''

  const { data, isLoading } = useQuery({
    queryKey: ['location', slug],
    queryFn:  () => locationsApi.get(slug),
    enabled:  !!slug,
  })

  const loc        = data?.location
  const properties = data?.properties?.data ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {loc && (
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{loc.zone} Hyderabad</span>
            {loc.is_featured && (
              <span className="flex items-center gap-1 text-orange-500 font-medium">
                <TrendingUp className="w-3.5 h-3.5" /> Emerging Growth Zone
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Properties in {loc.name}
          </h1>
          <p className="text-gray-500">
            Browse verified flats, plots, villas and houses in {loc.name}, Hyderabad.
            Direct owner contact · Zero brokerage.
          </p>
          <div className="mt-4 max-w-xl">
            <SearchBar defaultValue={`Properties in ${loc.name}`} />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🏘️</div>
          <p className="font-medium">No active listings in {loc?.name} yet.</p>
          <p className="text-sm mt-1">Check back soon or browse nearby areas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {properties.map(p => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
    </div>
  )
}
