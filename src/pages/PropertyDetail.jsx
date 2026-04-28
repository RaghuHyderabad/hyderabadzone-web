// src/pages/PropertyDetail.jsx
import { useQuery, useMutation } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Eye, BadgeCheck, Zap, BedDouble, Maximize2,
         MessageSquare, Phone, PlayCircle, Loader2, Heart,
         Share2, ChevronLeft, ChevronRight, X, CheckCircle2,
         Droplets, Car, Shield, Wifi, Trees, Zap as Power } from 'lucide-react'
import { useState } from 'react'
import { propertiesApi, userApi } from '../api/index'
import { formatPrice, formatUnitPrice, calcEMI, formatEMI } from '../utils/index'
import SEO from '../components/SEO'
import PropertyCard from '../components/ui/PropertyCard'
import toast from 'react-hot-toast'

// Amenity icons map
const AMENITY_ICONS = {
  'Parking':       <Car className="w-4 h-4" />,
  '24/7 Water':    <Droplets className="w-4 h-4" />,
  'Security':      <Shield className="w-4 h-4" />,
  'Power Backup':  <Power className="w-4 h-4" />,
  'Park':          <Trees className="w-4 h-4" />,
  'Gym':           '🏋️',
  'Swimming Pool': '🏊',
  'Club House':    '🏛️',
  'Wifi':          <Wifi className="w-4 h-4" />,
}

const WA_ICON = <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>

export default function PropertyDetail() {
  const { slugId } = useParams()
  const [activeImg, setActiveImg]     = useState(0)
  const [fullscreen, setFullscreen]   = useState(false)
  const [leadForm, setLeadForm]       = useState({ name: '', phone: '', message: '' })
  const [emiRate, setEmiRate]         = useState(8.5)
  const [emiTenure, setEmiTenure]     = useState(20)
  const [saved, setSaved]             = useState(false)
  const [waPopup, setWaPopup]         = useState(false)
  const [waForm, setWaForm]           = useState({ name: '', phone: '' })
  const [waLoading, setWaLoading]     = useState(false)

  const parts      = slugId?.split('-') ?? []
  const lastPart   = parts[parts.length - 1]
  const propertyId = /^\d+$/.test(lastPart) ? lastPart : slugId

  const { data, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn:  () => propertiesApi.get(propertyId),
  })

  // Fetch similar properties
  const { data: similarData } = useQuery({
    queryKey: ['similar', data?.data?.location?.id, data?.data?.type],
    queryFn:  () => propertiesApi.list({
      location_id: data?.data?.location?.id,
      type:        data?.data?.type,
      per_page:    4,
    }),
    enabled: !!data?.data?.location?.id,
  })

  const leadMutation = useMutation({
    mutationFn: (d) => userApi.submitLead(d),
    onSuccess:  ()  => {
      toast.success('Enquiry sent! Owner will contact you shortly.')
      setLeadForm({ name: '', phone: '', message: '' })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit.'),
  })

  if (isLoading) return (
    <div className="flex justify-center py-24" style={{minHeight:'60vh'}}>
      <Loader2 className="w-8 h-8 text-brand animate-spin" />
    </div>
  )

  const p = data?.data
  if (!p) return <div className="text-center py-16 text-gray-400">Property not found.</div>

  const isSold    = p.status === 'sold'
  const isExpired = p.status === 'expired'
  const isActive  = p.status === 'active'

  const totalPrice = p.price_type === 'total'
    ? Number(p.price)
    : Number(p.price) * Number(p.area)
  const emi = calcEMI(totalPrice, emiRate, emiTenure)

  const seoTitle = p.area
    ? `${p.area}${p.area_unit} ${p.type} in ${p.location?.name} | ${p.formatted_price}`
    : `${p.type} in ${p.location?.name} | ${p.formatted_price}`

  const propertySchema = {
    '@context': 'https://schema.org',
    '@type':    'RealEstateListing',
    name:        p.title,
    description: p.description || p.title,
    url:         `https://www.hyderabadzone.com/property/${p.slug}`,
    image:        p.thumbnail || '',
    offers:      { '@type': 'Offer', price: p.price, priceCurrency: 'INR' },
    address: {
      '@type':          'PostalAddress',
      addressLocality:  p.location?.name,
      addressRegion:    'Telangana',
      addressCountry:   'IN',
    },
    seller: { '@type': 'Person', name: p.owner?.name },
  }

  const handleLead = () => {
    if (!leadForm.name || !leadForm.phone) {
      toast.error('Name and phone are required.')
      return
    }
    if (!/^[6-9]\d{9}$/.test(leadForm.phone)) {
      toast.error('Enter a valid 10-digit phone number.')
      return
    }
    leadMutation.mutate({ property_id: p.id, ...leadForm, source: 'form' })
  }

  const handleWaSubmit = async () => {
    if (!waForm.name.trim()) { toast.error('Please enter your name.'); return }
    if (!/^[6-9]\d{9}$/.test(waForm.phone)) { toast.error('Enter valid 10-digit phone number.'); return }
    setWaLoading(true)
    try {
      await userApi.submitLead({
        property_id: p.id,
        name:        waForm.name,
        phone:       waForm.phone,
        source:      'whatsapp',
        message:     'Contacted via WhatsApp',
      })
      await propertiesApi.trackWhatsapp(p.id).catch(() => {})
    } catch { /* Silent */ } finally { setWaLoading(false) }
    setWaPopup(false)
    setWaForm({ name: '', phone: '' })
    window.open(p.whatsapp_link, '_blank')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: p.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied!')
    }
  }

  const handleSave = () => {
    setSaved(s => !s)
    toast.success(saved ? 'Removed from saved' : '❤️ Saved to favourites')
  }

  const prevImg = () => setActiveImg(i => (i - 1 + (p.images?.length || 1)) % (p.images?.length || 1))
  const nextImg = () => setActiveImg(i => (i + 1) % (p.images?.length || 1))

  const similar = Array.isArray(similarData?.data) ? similarData.data.filter(s => s.id !== p.id).slice(0, 3) : []

  return (
    <>
      <SEO
        title={seoTitle}
        description={`Buy ${p.type} in ${p.location?.name}, Hyderabad for ${p.formatted_price}. ${p.area ? p.area + p.area_unit + '. ' : ''}Contact owner directly. Zero brokerage.`}
        canonical={`/property/${p.slug}`}
        image={p.thumbnail}
        noindex={isExpired}
        schema={propertySchema}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: p.location?.name, url: `/${p.location?.slug}` },
          { name: p.title, url: `/property/${p.slug}` },
        ]}
      />

      {/* ── FULLSCREEN IMAGE VIEWER ── */}
      {fullscreen && p.images?.length > 0 && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 z-10">
            <X className="w-6 h-6" />
          </button>
          <button onClick={prevImg}
            className="absolute left-4 text-white bg-black/50 rounded-full p-2 z-10">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <img src={p.images[activeImg]?.url} alt={p.title}
            className="max-w-full max-h-full object-contain" />
          <button onClick={nextImg}
            className="absolute right-4 text-white bg-black/50 rounded-full p-2 z-10">
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 text-white text-sm">
            {activeImg + 1} / {p.images.length}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6" style={{minHeight:'100vh'}}>

        {/* ── SOLD / EXPIRED BANNER ── */}
        {isSold && (
          <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <div className="bg-red-600 text-white font-bold text-sm px-4 py-2 rounded-xl tracking-widest flex-shrink-0">SOLD</div>
            <div>
              <p className="font-semibold text-red-700">This property has been sold</p>
              <p className="text-sm text-red-500">
                {p.sold_in_days ? `Sold in ${p.sold_in_days} days. ` : ''}
                Browse similar in <Link to={`/${p.location?.slug}`} className="underline font-medium">{p.location?.name}</Link>.
              </p>
            </div>
          </div>
        )}
        {isExpired && (
          <div className="bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <div className="bg-gray-500 text-white font-bold text-sm px-4 py-2 rounded-xl flex-shrink-0">EXPIRED</div>
            <div>
              <p className="font-semibold text-gray-700">This listing has expired</p>
              <p className="text-sm text-gray-500">Browse similar properties in <Link to={`/${p.location?.slug}`} className="underline">{p.location?.name}</Link>.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* IMAGE GALLERY */}
            <div className="card overflow-hidden">
              <div className="relative bg-gray-100 cursor-pointer" style={{aspectRatio:'16/9'}}
                onClick={() => p.images?.length > 0 && setFullscreen(true)}>
                {p.images?.length > 0 ? (
                  <img src={p.images[activeImg]?.url} alt={p.title}
                    className="w-full h-full object-cover"
                    loading="eager" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <Maximize2 className="w-16 h-16" />
                  </div>
                )}

                {/* SOLD stamp on image */}
                {isSold && (
                  <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                    <div className="bg-red-600 text-white font-bold text-4xl px-10 py-4 rounded-2xl rotate-[-15deg] shadow-xl tracking-widest">
                      SOLD
                    </div>
                  </div>
                )}

                {/* Nav arrows */}
                {p.images?.length > 1 && (
                  <>
                    <button onClick={e => { e.stopPropagation(); prevImg() }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition z-10">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); nextImg() }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition z-10">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2 z-10">
                  {p.is_featured && <span className="badge-featured flex items-center gap-1"><Zap className="w-3 h-3" /> Featured</span>}
                  {p.is_verified && <span className="badge-verified flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Verified</span>}
                </div>

                {/* Image count */}
                {p.images?.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full z-10">
                    {activeImg + 1} / {p.images.length} · Tap to expand
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {p.images?.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {p.images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition
                        ${i === activeImg ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TITLE + KEY INFO */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{p.title}</h1>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0 text-brand" />
                    <span>{p.location?.name}, Hyderabad · {p.location?.zone}</span>
                  </div>
                  {/* Quick specs chips */}
                  <div className="flex flex-wrap gap-2">
                    <span className="badge-type">{p.type}</span>
                    {p.bedrooms && (
                      <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        <BedDouble className="w-3 h-3" /> {p.bedrooms} BHK
                      </span>
                    )}
                    {p.area && (
                      <span className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        <Maximize2 className="w-3 h-3" /> {p.area} {p.area_unit}
                      </span>
                    )}
                    {p.facing && (
                      <span className="bg-orange-50 text-orange-700 text-xs px-3 py-1 rounded-full">
                        {p.facing} Facing
                      </span>
                    )}
                    {p.approval_type && (
                      <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full font-medium">
                        ✅ {p.approval_type} Approved
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <div className="text-3xl font-bold text-brand">
                    {formatPrice(p.price, p.price_type, p.area)}
                  </div>
                  {p.price_type !== 'total' && (
                    <div className="text-gray-400 text-sm mt-0.5">
                      {formatUnitPrice(p.price, p.price_type)}
                    </div>
                  )}
                  {totalPrice > 0 && p.price_type !== 'total' && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      Total: {formatPrice(totalPrice, 'total', 1)}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {p.views} views</span>
                {p.whatsapp_clicks > 0 && (
                  <span className="flex items-center gap-1">💬 {p.whatsapp_clicks} enquiries</span>
                )}
                <span className="ml-auto flex gap-3">
                  <button onClick={handleSave}
                    className={`flex items-center gap-1 transition ${saved ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                    <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} /> Save
                  </button>
                  <button onClick={handleShare}
                    className="flex items-center gap-1 text-gray-400 hover:text-brand transition">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </span>
              </div>
            </div>

            {/* YOUTUBE VIDEO */}
            {p.youtube_url && (
              <div className="card p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-red-500" /> Property Video
                </h3>
                <div className="aspect-video rounded-xl overflow-hidden">
                  <iframe
                    src={p.youtube_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* DESCRIPTION */}
            {p.description && (
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-3">About This Property</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{p.description}</p>
              </div>
            )}

            {/* AMENITIES */}
            {p.amenities?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {p.amenities.map(a => (
                    <div key={a} className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2.5">
                      <span className="text-green-600">
                        {typeof AMENITY_ICONS[a] === 'string'
                          ? AMENITY_ICONS[a]
                          : (AMENITY_ICONS[a] || <CheckCircle2 className="w-4 h-4" />)
                        }
                      </span>
                      <span className="text-sm text-gray-700 font-medium">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NEARBY */}
            {p.nearby?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-4">📍 Nearby Landmarks</h2>
                <div className="flex flex-wrap gap-2">
                  {p.nearby.map(n => (
                    <span key={n} className="bg-blue-50 text-blue-700 text-sm px-4 py-2 rounded-xl border border-blue-100">
                      📌 {n}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* WHY BUY THIS PROPERTY */}
            <div className="card p-6 bg-gradient-to-br from-brand/5 to-blue-50">
              <h2 className="font-bold text-gray-900 text-lg mb-4">🏆 Why Buy This Property?</h2>
              <div className="space-y-3">
                {[
                  p.location?.zone === 'Emerging' && '🚀 High appreciation potential — emerging growth zone',
                  p.is_verified && '✅ Verified listing — reviewed by HyderabadZone team',
                  p.approval_type && `🏛️ ${p.approval_type} approved — legally clear plot`,
                  totalPrice > 0 && totalPrice < 5000000 && '💰 Affordable pricing — best value in the area',
                  p.area && p.area_unit === 'sqyd' && '📐 Prime plot size — ideal for construction',
                  '📍 Direct owner contact — zero brokerage, zero commission',
                  '🤝 No middlemen — talk directly to the owner',
                ].filter(Boolean).map((point, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-0.5">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GOOGLE MAP */}
            {p.latitude && p.longitude ? (
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 text-lg">📍 Location on Map</h2>
                </div>
                <iframe
                  title="Property Location"
                  width="100%"
                  height="300"
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${p.latitude},${p.longitude}&z=15&output=embed`}
                />
                <div className="p-3">
                  <a href={`https://maps.google.com/?q=${p.latitude},${p.longitude}`}
                    target="_blank" rel="noreferrer"
                    className="text-brand text-sm hover:underline flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> Open in Google Maps
                  </a>
                </div>
              </div>
            ) : (
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-2">📍 Location</h2>
                <p className="text-gray-600 text-sm mb-3">{p.location?.name}, Hyderabad · {p.location?.zone} Zone</p>
                <a href={`https://maps.google.com/?q=${p.location?.name}+Hyderabad`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 text-brand text-sm hover:underline border border-brand px-4 py-2 rounded-xl">
                  <MapPin className="w-4 h-4" /> View on Google Maps
                </a>
              </div>
            )}

            {/* EMI CALCULATOR */}
            {!isSold && !isExpired && totalPrice > 0 && (
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-4">💰 EMI Calculator</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Interest Rate (%)</label>
                    <input type="number" min="5" max="20" step="0.1" value={emiRate}
                      onChange={e => setEmiRate(Number(e.target.value))}
                      className="input-field py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Tenure (years)</label>
                    <input type="number" min="5" max="30" value={emiTenure}
                      onChange={e => setEmiTenure(Number(e.target.value))}
                      className="input-field py-2 text-sm" />
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                  <div className="text-xs text-gray-500 mb-1">Estimated Monthly EMI (80% loan)</div>
                  <div className="text-3xl font-bold text-green-600">{formatEMI(emi)}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Down payment: {formatPrice(totalPrice * 0.2, 'total', 1)} · Loan: {formatPrice(totalPrice * 0.8, 'total', 1)}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">*Indicative only. Actual EMI may vary by bank.</p>
              </div>
            )}

            {/* SIMILAR PROPERTIES */}
            {similar.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 text-lg">
                    Similar {p.type}s in {p.location?.name}
                  </h2>
                  <Link to={`/${p.location?.slug}/${p.type}s`}
                    className="text-brand text-sm hover:underline">
                    View All →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similar.map(s => <PropertyCard key={s.id} property={s} compact />)}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: CONTACT SIDEBAR ── */}
          <div className="space-y-4">
            <div className="card p-5 sticky top-20">

              {/* Owner info */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {p.owner?.name?.[0]?.toUpperCase() || 'O'}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{p.owner?.name}</div>
                  {p.owner?.builder_company && (
                    <div className="text-xs text-gray-500">{p.owner.builder_company}</div>
                  )}
                  {p.is_verified && (
                    <div className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                      <BadgeCheck className="w-3 h-3" /> Verified Owner
                    </div>
                  )}
                </div>
              </div>

              {/* SOLD / EXPIRED state */}
              {(isSold || isExpired) ? (
                <div className="text-center">
                  <div className={`${isSold ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border rounded-xl p-4 mb-4`}>
                    <p className={`font-semibold text-sm ${isSold ? 'text-red-600' : 'text-gray-600'}`}>
                      {isSold ? '🔴 Property Sold' : '⏳ Listing Expired'}
                    </p>
                    <p className={`text-xs mt-1 ${isSold ? 'text-red-400' : 'text-gray-400'}`}>
                      This property is no longer available
                    </p>
                  </div>
                  <Link to={`/${p.location?.slug}`}
                    className="btn-brand w-full justify-center flex items-center gap-2">
                    View Similar in {p.location?.name}
                  </Link>
                </div>
              ) : (
                /* ACTIVE — Contact options */
                <>
                  {/* WhatsApp CTA */}
                  <a href={p.whatsapp_link} target="_blank" rel="noopener noreferrer"
                    onClick={() => setWaPopup(true)}
                    className="btn-wa w-full justify-center mb-3 text-base py-3.5 flex items-center gap-2">
                    {WA_ICON} WhatsApp Owner
                  </a>

                  {/* Call button */}
                  <a href={`tel:+91${p.owner?.whatsapp_link?.match(/91(\d{10})/)?.[1] || ''}`}
                    className="w-full flex items-center justify-center gap-2 border-2 border-brand text-brand font-semibold py-3 rounded-xl hover:bg-brand hover:text-white transition mb-4">
                    <Phone className="w-4 h-4" /> Call Owner
                  </a>

                  {/* Enquiry form */}
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <p className="text-xs text-gray-500 text-center font-medium">Or send an enquiry</p>
                    <input type="text" placeholder="Your name *" value={leadForm.name}
                      onChange={e => setLeadForm(f => ({ ...f, name: e.target.value }))}
                      className="input-field py-2.5 text-sm" />
                    <input type="tel" placeholder="Your phone number *" value={leadForm.phone}
                      onChange={e => setLeadForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                      className="input-field py-2.5 text-sm" maxLength={10} />
                    <textarea placeholder="Message (optional)" value={leadForm.message}
                      onChange={e => setLeadForm(f => ({ ...f, message: e.target.value }))}
                      className="input-field py-2.5 text-sm resize-none" rows={2} />
                    <button onClick={handleLead} disabled={leadMutation.isPending}
                      className="btn-brand w-full flex items-center justify-center gap-2 py-2.5 text-sm">
                      {leadMutation.isPending
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <MessageSquare className="w-4 h-4" />}
                      Send Enquiry
                    </button>
                  </div>

                  {/* Trust signals */}
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Direct owner contact
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Zero brokerage
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Admin verified listing
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 text-center mt-3">
                    Expires: {p.expires_at}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* ── WHATSAPP LEAD POPUP ── */}
      {waPopup && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
          onClick={e => e.target === e.currentTarget && setWaPopup(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                {WA_ICON}
              </div>
              <h3 className="text-lg font-bold text-gray-900">Connect with Owner</h3>
              <p className="text-sm text-gray-500 mt-1">Enter your details to continue</p>
            </div>
            <div className="space-y-3 mb-4">
              <input type="text" placeholder="Your Name *"
                value={waForm.name}
                onChange={e => setWaForm(f => ({ ...f, name: e.target.value }))}
                className="input-field" autoFocus />
              <input type="tel" placeholder="Your Phone Number *" maxLength={10}
                value={waForm.phone}
                onChange={e => setWaForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                className="input-field" />
            </div>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-xs text-gray-500">
              <p className="font-medium text-gray-700 truncate">{p.title}</p>
              <p>{p.location?.name} · {p.formatted_price}</p>
            </div>
            <button onClick={handleWaSubmit} disabled={waLoading}
              className="btn-wa w-full justify-center flex items-center gap-2 py-3.5 text-base mb-3">
              {waLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : WA_ICON}
              Open WhatsApp
            </button>
            <button onClick={() => setWaPopup(false)}
              className="w-full text-sm text-gray-400 hover:text-gray-600 transition py-2">
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* ── MOBILE STICKY WHATSAPP BUTTON ── */}
      {isActive && (
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden p-3 bg-white border-t border-gray-200 shadow-lg">
          <button
            onClick={() => setWaPopup(true)}
            className="btn-wa w-full justify-center flex items-center gap-2 py-3.5 text-base">
            {WA_ICON} WhatsApp Owner — Free
          </button>
        </div>
      )}
    </>
  )
}
