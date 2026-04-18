// src/pages/PropertyDetail.jsx
import { useQuery, useMutation } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { MapPin, Eye, BadgeCheck, Zap, BedDouble, Maximize2,
         MessageSquare, Phone, PlayCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { propertiesApi, userApi } from '../api/index'
import { formatPrice, formatUnitPrice, calcEMI, formatEMI, waLink } from '../utils/index'
import SEO from '../components/SEO'
import toast from 'react-hot-toast'

export default function PropertyDetail() {
  const { slugId } = useParams()
  const [activeImg, setActiveImg] = useState(0)
  const [leadForm, setLeadForm]   = useState({ name: '', phone: '', message: '' })
  const [emiRate, setEmiRate]     = useState(8.5)
  const [emiTenure, setEmiTenure] = useState(20)

  // Extract ID from end of slug: "2bhk-flat-lb-nagar-1025" → 1025
  const parts = slugId?.split('-') ?? []
  const lastPart = parts[parts.length - 1]
  const propertyId = /^\d+$/.test(lastPart) ? lastPart : slugId

  const { data, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn:  () => propertiesApi.get(propertyId),
  })

  const leadMutation = useMutation({
    mutationFn: (data) => userApi.submitLead(data),
    onSuccess:  ()     => toast.success('Enquiry sent! Owner will contact you shortly.'),
    onError:    (err)  => toast.error(err.response?.data?.message || 'Failed to submit.'),
  })

  if (isLoading) return (
    <div className="flex justify-center py-24" style={{minHeight:"60vh"}}>
      <Loader2 className="w-8 h-8 text-brand animate-spin" />
    </div>
  )

  const p = data?.data
  if (!p) return <div className="text-center py-16 text-gray-400">Property not found.</div>

  const seoTitle = p.area
    ? `${p.area}${p.area_unit} ${p.type} in ${p.location?.name} | ${p.formatted_price}`
    : `${p.type} in ${p.location?.name} | ${p.formatted_price}`

  const propertySchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: p.title,
    description: p.description || p.title,
    url: `https://www.hyderabadzone.com/property/${p.slug}`,
    image: p.thumbnail || '',
    offers: { '@type': 'Offer', price: p.price, priceCurrency: 'INR' },
    address: {
      '@type': 'PostalAddress',
      addressLocality: p.location?.name,
      addressRegion: 'Telangana',
      addressCountry: 'IN',
    },
  }

  const totalPrice = p.price_type === 'total' ? Number(p.price) : Number(p.price) * Number(p.area)
  const emi        = calcEMI(totalPrice, emiRate, emiTenure)

  const handleLead = () => {
    if (!leadForm.name || !leadForm.phone) {
      toast.error('Name and phone are required.')
      return
    }
    leadMutation.mutate({ property_id: p.id, ...leadForm, source: 'form' })
  }

  return (
    <>
      <SEO
        title={seoTitle}
        description={`Buy ${p.type} in ${p.location?.name}, Hyderabad for ${p.formatted_price}. ${p.area ? p.area + p.area_unit + '. ' : ''}Contact owner directly. Zero brokerage.`}
        canonical={`/property/${p.slug}`}
        image={p.thumbnail}
        noindex={p.status === 'expired'}
        schema={propertySchema}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: p.location?.name, url: `/${p.location?.slug}` },
          { name: p.title, url: `/property/${p.slug}` },
        ]}
      />
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8" style={{minHeight:"100vh"}}>
      {/* ── Left: Images + Details ── */}
      <div className="lg:col-span-2 space-y-6">
        {/* Image gallery */}
        <div className="card overflow-hidden">
          <div className="aspect-video bg-gray-100 relative" style={{aspectRatio:"16/9"}}>
            {p.images?.length > 0 ? (
              <img src={p.images[activeImg]?.url} alt={p.title}
                className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-300">
                <Maximize2 className="w-12 h-12" />
              </div>
            )}
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {p.is_featured && <span className="badge-featured flex items-center gap-1"><Zap className="w-3 h-3" /> Featured</span>}
              {p.is_verified && <span className="badge-verified flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Verified</span>}
            </div>
          </div>
          {/* Thumbnails */}
          {p.images?.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {p.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition
                    ${i === activeImg ? 'border-brand' : 'border-transparent'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* YouTube video */}
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
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Details */}
        <div className="card p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">{p.title}</h1>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <MapPin className="w-4 h-4" />
                {p.location?.name}, Hyderabad · {p.location?.zone}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-brand">
                {formatPrice(p.price, p.price_type, p.area)}
              </div>
              {p.price_type !== 'total' && (
                <div className="text-gray-400 text-sm">{formatUnitPrice(p.price, p.price_type)}</div>
              )}
            </div>
          </div>

          {/* Quick specs */}
          <div className="flex flex-wrap gap-4 py-3 border-y border-gray-100">
            <span className="badge-type">{p.type}</span>
            {p.bedrooms && <span className="flex items-center gap-1 text-sm text-gray-600"><BedDouble className="w-4 h-4" /> {p.bedrooms} BHK</span>}
            {p.area     && <span className="flex items-center gap-1 text-sm text-gray-600"><Maximize2 className="w-4 h-4" /> {p.area} {p.area_unit}</span>}
            {p.facing   && <span className="text-sm text-gray-600">Facing: {p.facing}</span>}
            {p.approval_type && <span className="text-sm text-green-600 font-medium">{p.approval_type} Approved</span>}
            <span className="flex items-center gap-1 text-sm text-gray-400 ml-auto"><Eye className="w-4 h-4" /> {p.views} views</span>
          </div>

          {/* Description */}
          {p.description && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">About this property</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{p.description}</p>
            </div>
          )}

          {/* Amenities */}
          {p.amenities?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {p.amenities.map(a => <span key={a} className="bg-surface text-gray-600 text-xs px-3 py-1 rounded-full">{a}</span>)}
              </div>
            </div>
          )}

          {/* Nearby */}
          {p.nearby?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Nearby</h3>
              <div className="flex flex-wrap gap-2">
                {p.nearby.map(n => <span key={n} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">{n}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* EMI Calculator */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-800 mb-4">EMI Calculator</h3>
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
          <div className="bg-surface rounded-xl p-4 text-center">
            <div className="text-xs text-gray-400 mb-1">Estimated Monthly EMI (80% loan)</div>
            <div className="text-2xl font-bold text-green-600">{formatEMI(emi)}</div>
            <div className="text-xs text-gray-400 mt-1">
              Down payment: {formatPrice(totalPrice * 0.2, 'total', 1)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Contact sidebar ── */}
      <div className="space-y-4">
        {/* WhatsApp CTA */}
        <div className="card p-5 sticky top-20">
          <div className="text-center mb-4">
            <div className="font-semibold text-gray-800">{p.owner?.name}</div>
            {p.owner?.builder_company && (
              <div className="text-sm text-gray-500">{p.owner.builder_company}</div>
            )}
          </div>

          <a
            href={p.whatsapp_link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => userApi.submitLead({ property_id: p.id, name: 'WhatsApp', phone: '0000000000', source: 'whatsapp' }).catch(() => {})}
            className="btn-wa w-full justify-center mb-3"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            WhatsApp Owner
          </a>

          {/* Lead form */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-xs text-gray-500 text-center font-medium">Or send an enquiry</p>
            <input type="text" placeholder="Your name" value={leadForm.name}
              onChange={e => setLeadForm(f => ({ ...f, name: e.target.value }))}
              className="input-field py-2.5 text-sm" />
            <input type="tel" placeholder="Your phone number" value={leadForm.phone}
              onChange={e => setLeadForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
              className="input-field py-2.5 text-sm" maxLength={10} />
            <textarea placeholder="Message (optional)" value={leadForm.message}
              onChange={e => setLeadForm(f => ({ ...f, message: e.target.value }))}
              className="input-field py-2.5 text-sm resize-none" rows={2} />
            <button
              onClick={handleLead}
              disabled={leadMutation.isPending}
              className="btn-brand w-full flex items-center justify-center gap-2 py-2.5 text-sm"
            >
              {leadMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <MessageSquare className="w-4 h-4" />
              }
              Send Enquiry
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-3">
            Expires: {p.expires_at}
          </p>
        </div>
      </div>
    </div>
    </>
  )
}
