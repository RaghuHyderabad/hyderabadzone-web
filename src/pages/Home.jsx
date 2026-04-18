import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, TrendingUp, MapPin, Shield, Phone, Zap, ChevronDown, MessageCircle } from 'lucide-react'
import PropertyCard from '../components/ui/PropertyCard'
import { propertiesApi, locationsApi } from '../api/index'
import client from '../api/client'

const ZONES = [
  { name: 'East Hyderabad',    slug: 'east',    avg: '₹3,000/sq.ft', color: 'from-orange-500 to-orange-700',   img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80' },
  { name: 'West Hyderabad',    slug: 'west',    avg: '₹5,000/sq.ft', color: 'from-blue-500 to-blue-700',      img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80' },
  { name: 'North Hyderabad',   slug: 'north',   avg: '₹3,500/sq.ft', color: 'from-green-500 to-green-700',    img: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80' },
  { name: 'South Hyderabad',   slug: 'south',   avg: '₹3,000/sq.ft', color: 'from-red-500 to-red-700',        img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&q=80' },
  { name: 'Central Hyderabad', slug: 'central', avg: '₹6,000/sq.ft', color: 'from-purple-500 to-purple-700',  img: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&q=80' },
]

const TRENDING = [
  { title: 'Top 5 Areas in East Hyderabad 2026', tag: 'Hot Zone', slug: 'east', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80' },
  { title: 'Plots Near Pharma City',              tag: 'Investment',  slug: 'adibatla', img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80' },
  { title: 'High ROI Locations Near ORR',         tag: 'High ROI',    slug: 'tukkuguda', img: 'https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=600&q=80' },
]

const BUDGETS = ['Under ₹20L', '₹20L–40L', '₹40L–80L', '₹80L–1Cr', 'Above ₹1Cr']

export default function Home() {
  const navigate = useNavigate()
  const [zone, setZone]   = useState('')
  const [budget, setBudget] = useState('')
  const [propType, setPropType] = useState('plots')
  const [lead, setLead] = useState({ name: '', phone: '', budget: '', zone: '' })
  const [submitted, setSubmitted] = useState(false)

  const { data: recent } = useQuery({
    queryKey: ['recent-properties'],
    queryFn:  () => propertiesApi.list({ per_page: 8, sort: 'newest' }),
  })

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (zone)   params.set('q', zone)
    if (propType) params.set('type', propType === 'plots' ? 'plot' : 'flat')
    navigate(`/search?${params}`)
  }

  const submitLead = async () => {
    if (!lead.name || !lead.phone) { alert('Please enter name and phone'); return }
    try {
      await client.post('/api/leads', {
        property_id:  null,
        name:         lead.name,
        phone:        lead.phone,
        message:      `Budget: ${lead.budget}, Zone: ${lead.zone}`,
        source:       'callback',
      })
      setSubmitted(true)
    } catch { setSubmitted(true) }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[580px] flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a237e 0%, #283593 40%, #1565c0 100%)' }}>
        {/* Background image */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
              <Zap className="w-3 h-3" /> Smart Property Investment
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Find the Best<br />
              <span className="text-orange-400">Investment Plots</span><br />
              in Hyderabad by Zone
            </h1>
            <p className="text-blue-200 text-lg mb-8">
              Data-Driven Insights on East, West, North & South Hyderabad Growth Areas
            </p>

            {/* Search Box */}
            <div className="bg-white rounded-2xl p-4 shadow-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <select value={zone} onChange={e => setZone(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500">
                  <option value="">Select Zone</option>
                  {ZONES.map(z => <option key={z.slug} value={z.name}>{z.name}</option>)}
                </select>
                <select value={budget} onChange={e => setBudget(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500">
                  <option value="">Budget (₹)</option>
                  {BUDGETS.map(b => <option key={b}>{b}</option>)}
                </select>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3">
                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Type:</span>
                  {['plots', 'flats'].map(t => (
                    <button key={t} onClick={() => setPropType(t)}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold transition capitalize
                        ${propType === t ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-blue-600'}`}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleSearch}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                Get Best Options <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* WhatsApp CTA */}
            <a href="https://wa.me/919985435745?text=Hi, I need property consultation in Hyderabad"
              target="_blank" rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition">
              <MessageCircle className="w-5 h-5" /> Get Instant Plot Deals
            </a>
          </div>

          {/* Right side image */}
          <div className="hidden lg:block">
            <img src="https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80"
              alt="Hyderabad" className="rounded-3xl shadow-2xl w-full object-cover h-96 opacity-80" />
          </div>
        </div>
      </section>

      {/* ── EXPLORE BY ZONE ──────────────────────────────── */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Explore by Zone</h2>
          <p className="text-center text-gray-500 mb-8">Click a zone to see all properties and insights</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {ZONES.map(z => (
              <Link key={z.slug} to={`/search?q=${z.name}`}
                className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition group cursor-pointer">
                <img src={z.img} alt={z.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className={`absolute inset-0 bg-gradient-to-t ${z.color} opacity-70 group-hover:opacity-80 transition`} />
                <div className="absolute inset-0 p-3 flex flex-col justify-end">
                  <div className="text-white font-bold text-sm">{z.name}</div>
                  <div className="text-white/80 text-xs">Avg Price: {z.avg}</div>
                  <div className="mt-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-lg inline-flex items-center gap-1 w-fit">
                    View Insights <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT PROPERTIES ────────────────────────────── */}
      {recent?.data?.length > 0 && (
        <section className="py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Latest Listings</h2>
                <p className="text-gray-500 mt-1">Fresh properties across Hyderabad</p>
              </div>
              <Link to="/search" className="flex items-center gap-1 text-blue-600 font-semibold hover:underline">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {recent.data.slice(0, 8).map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── TRENDING INVESTMENT AREAS ─────────────────────── */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Trending Investment Areas</h2>
          <p className="text-center text-gray-500 mb-8">High growth zones with strong ROI potential</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRENDING.map(t => (
              <Link key={t.title} to={`/${t.slug}`}
                className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition group h-56">
                <img src={t.img} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />
                <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {t.tag}
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg leading-tight mb-2">{t.title}</h3>
                  <div className="flex items-center gap-1 text-orange-400 font-semibold text-sm">
                    Learn More <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FREE CONSULTATION FORM ────────────────────────── */}
      <section className="py-14 px-4 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Get Free Property Consultation!</h2>
          <p className="text-gray-500 mb-8">Our experts will call you back within 30 minutes</p>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-xl font-bold text-green-700 mb-1">Request Received!</h3>
              <p className="text-green-600">Our team will call you back shortly.</p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <input value={lead.name} onChange={e => setLead(l => ({...l, name: e.target.value}))}
                  placeholder="Your Name" className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                <input type="tel" maxLength={10} value={lead.phone} onChange={e => setLead(l => ({...l, phone: e.target.value.replace(/\D/g,'')}))}
                  placeholder="Phone Number" className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                <select value={lead.budget} onChange={e => setLead(l => ({...l, budget: e.target.value}))}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-700">
                  <option value="">Your Budget</option>
                  {BUDGETS.map(b => <option key={b}>{b}</option>)}
                </select>
                <select value={lead.zone} onChange={e => setLead(l => ({...l, zone: e.target.value}))}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-700">
                  <option value="">Preferred Zone</option>
                  {ZONES.map(z => <option key={z.slug}>{z.name}</option>)}
                </select>
              </div>
              <button onClick={submitLead}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-3 rounded-xl transition flex items-center gap-2 mx-auto">
                Request Callback <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── TRUST BADGES ─────────────────────────────────── */}
      <section className="py-14 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: '📊', title: 'Data-Driven Insights', desc: 'Real price trends and area growth data from local market experts' },
              { icon: '🏢', title: 'Local Area Experts', desc: 'Work directly with seasoned local real estate market experts' },
              { icon: '✅', title: 'Trusted & Verified Listings', desc: 'Real estate properties verified, certainly finest and genuineness' },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
