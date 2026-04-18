// src/pages/Home.jsx
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, TrendingUp, MapPin, Shield, Zap, Phone } from 'lucide-react'
import SearchBar from '../components/search/SearchBar'
import PropertyCard from '../components/ui/PropertyCard'
import { propertiesApi, locationsApi } from '../api/index'

const PROPERTY_TYPES = [
  { label: 'Open Plots',  type: 'plot',  icon: '🌿', color: 'bg-green-50 text-green-700 border-green-200' },
  { label: 'Flats',       type: 'flat',  icon: '🏢', color: 'bg-blue-50 text-blue-700 border-blue-200'  },
  { label: 'Villas',      type: 'villa', icon: '🏡', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { label: 'Houses',      type: 'house', icon: '🏠', color: 'bg-orange-50 text-orange-700 border-orange-200' },
]

const BUDGET_CHIPS = [
  { label: 'Under ₹20L',  max: 2000000 },
  { label: '₹20–40L',     min: 2000000,  max: 4000000 },
  { label: '₹40–80L',     min: 4000000,  max: 8000000 },
  { label: '₹80L – 1Cr', min: 8000000,  max: 10000000 },
  { label: 'Above ₹1Cr',  min: 10000000 },
]

export default function Home() {
  const navigate = useNavigate()

  const { data: featured } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: propertiesApi.featured,
  })

  const { data: recent } = useQuery({
    queryKey: ['recent-properties'],
    queryFn: () => propertiesApi.list({ per_page: 12, sort: 'newest' }),
  })

  const { data: emergingLocations } = useQuery({
    queryKey: ['featured-locations'],
    queryFn: locationsApi.featured,
  })

  const handleBudget = ({ min, max }) => {
    const params = new URLSearchParams()
    if (min) params.set('min_price', min)
    if (max) params.set('max_price', max)
    navigate(`/search?${params}`)
  }

  return (
    <div>
      {/* ─── HERO ─── */}
      <section className="bg-gradient-to-br from-brand to-brand-light py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4" />
            Hyderabad's Smartest Property Platform
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Find the Right Property.<br />
            <span className="text-orange-300">Make the Right Decision.</span>
          </h1>
          <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
            120+ locations · Direct owner contact · No middlemen · Verified listings
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar large />
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {BUDGET_CHIPS.map(b => (
              <button
                key={b.label}
                onClick={() => handleBudget(b)}
                className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-full
                           border border-white/20 transition"
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROPERTY TYPES ─── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="section-title">What are you looking for?</h2>
          <p className="section-sub">Browse by property type</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PROPERTY_TYPES.map(t => (
            <Link
              key={t.type}
              to={`/search?type=${t.type}`}
              className={`card p-6 text-center border ${t.color} hover:shadow-lg transition`}
            >
              <div className="text-4xl mb-3">{t.icon}</div>
              <div className="font-semibold">{t.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── FEATURED LISTINGS ─── */}
      {featured?.data?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Featured Properties</h2>
              <p className="section-sub">Premium verified listings</p>
            </div>
            <Link to="/search?sort=rank" className="btn-outline text-sm flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {featured.data.slice(0, 6).map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </section>
      )}

      {/* ─── RECENT LISTINGS ─── */}
      {recent?.data?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Recent Properties</h2>
              <p className="section-sub">Latest listings across Hyderabad</p>
            </div>
            <Link to="/search?sort=newest" className="btn-outline text-sm flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {recent.data.slice(0, 12).map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </section>
      )}

      {/* ─── EMERGING ZONES ─── */}
      {emergingLocations?.data?.length > 0 && (
        <section className="bg-gradient-to-br from-orange-50 to-amber-50 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-cta-start" />
                  Emerging Growth Zones
                </h2>
                <p className="section-sub">High appreciation potential areas</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {emergingLocations.data.map(l => (
                <Link
                  key={l.id}
                  to={`/${l.slug}`}
                  className="card p-4 text-center hover:border-orange-200 hover:shadow-md transition group"
                >
                  <MapPin className="w-5 h-5 text-cta-start mx-auto mb-2 group-hover:scale-110 transition" />
                  <div className="font-medium text-sm text-gray-800">{l.name}</div>
                  {l.active_count > 0 && (
                    <div className="text-xs text-gray-400 mt-1">{l.active_count} listings</div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── WHY HYDERABADZONE ─── */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="section-title">Why HyderabadZone?</h2>
          <p className="section-sub">The smarter way to buy property in Hyderabad</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Phone className="w-6 h-6 text-wa" />, title: 'Direct Owner Contact', desc: 'WhatsApp the owner directly. No brokers, no commissions, no delays.' },
            { icon: <Shield className="w-6 h-6 text-brand" />, title: 'Verified Listings', desc: 'Every listing is manually reviewed by our team before going live.' },
            { icon: <TrendingUp className="w-6 h-6 text-cta-start" />, title: 'Investment Insights', desc: 'Price trends, area growth data, and expert location analysis.' },
          ].map(f => (
            <div key={f.title} className="card p-6">
              <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-cta-gradient rounded-3xl p-8 md:p-12 text-white text-center"
             style={{ backgroundImage: 'linear-gradient(135deg, #FF7A18, #FF4E00)' }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">List Your Property for ₹499</h2>
          <p className="text-orange-100 mb-6 max-w-lg mx-auto">
            Get 30 days of exposure · Direct WhatsApp leads · Admin verified listing
          </p>
          <Link to="/list-property" className="inline-flex items-center gap-2 bg-white text-cta-start
                                               font-bold px-8 py-3 rounded-xl hover:shadow-lg transition">
            List Your Property <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
