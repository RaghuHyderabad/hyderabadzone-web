// src/pages/Dashboard.jsx
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PlusCircle, Eye, TrendingUp, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { usersApi } from '../api/index'
import { formatPrice } from '../utils/index'

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  usersApi.dashboard,
  })

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>

  const d = data || {}

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <Link to="/list-property" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> List New Property
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Listings', value: d.total_listings ?? 0, icon: <TrendingUp className="w-5 h-5 text-brand" /> },
          { label: 'Active',         value: d.active          ?? 0, icon: <CheckCircle2 className="w-5 h-5 text-green-500" /> },
          { label: 'Total Views',    value: d.total_views     ?? 0, icon: <Eye className="w-5 h-5 text-blue-500" /> },
          { label: 'Leads Received', value: d.total_leads     ?? 0, icon: <TrendingUp className="w-5 h-5 text-orange-500" /> },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-xs text-gray-500">{s.label}</span></div>
            <div className="text-2xl font-bold text-gray-900">{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Listings table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">My Listings</h2>
        </div>
        {!d.listings?.length ? (
          <div className="text-center py-12 text-gray-400">
            <p className="mb-3">No listings yet.</p>
            <Link to="/list-property" className="btn-brand text-sm px-4 py-2">List your first property</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr>
                  {['Property', 'Type', 'Price', 'Status', 'Views', 'Leads', 'Expires', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.listings.map(l => (
                  <tr key={l.id} className="border-t border-gray-50 hover:bg-surface transition">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 max-w-48 truncate">{l.title}</div>
                      <div className="text-xs text-gray-400">{l.location}</div>
                    </td>
                    <td className="px-4 py-3 capitalize"><span className="badge-type">{l.type}</span></td>
                    <td className="px-4 py-3 font-medium text-brand">{l.formatted_price}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{l.views}</td>
                    <td className="px-4 py-3 text-gray-600">{l.leads_count}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{l.expires_at || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/property/${l.slug}`} className="text-brand text-xs hover:underline">View</Link>
                        {(l.status === 'expired' || l.status === 'active') && (
                          <Link to={`/payment/${l.id}`} className="text-orange-500 text-xs hover:underline">Renew</Link>
                        )}
                        {l.status === 'pending_payment' && (
                          <Link to={`/payment/${l.id}`} className="text-green-600 text-xs font-semibold hover:underline">Pay ₹499</Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    active:          'bg-green-100 text-green-700',
    pending_payment: 'bg-yellow-100 text-yellow-700',
    draft:           'bg-gray-100 text-gray-600',
    expired:         'bg-red-100 text-red-600',
    rejected:        'bg-red-200 text-red-800',
  }
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status?.replace('_', ' ')}
    </span>
  )
}


// ═══════════════════════════════════════════════════
// src/pages/ListProperty.jsx
// ═══════════════════════════════════════════════════
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { propertiesApi, locationsApi } from '../api/index'
import { Loader2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

const TYPES    = ['plot', 'flat', 'villa', 'house']
const FACINGS  = ['East', 'West', 'North', 'South', 'NE', 'NW', 'SE', 'SW']
const AMENITIES = ['Parking', 'Gym', 'Swimming Pool', 'Club House', 'Security',
                   'Power Backup', 'Lift', 'Park', 'Temple', 'CCTV']

export function ListProperty() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [images, setImages] = useState([])
  const [form, setForm] = useState({
    title: '', type: 'flat', location_id: '', price: '', price_type: 'sqft',
    area: '', area_unit: 'sqft', bedrooms: '', bathrooms: '', description: '',
    amenities: [], approval_type: '', facing: '', youtube_url: '',
    whatsapp_contact: '', latitude: '', longitude: '',
  })

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn:  locationsApi.all,
  })

  const createMutation = useMutation({
    mutationFn: propertiesApi.create,
    onSuccess: async (res) => {
      toast.success('Property saved! Uploading images...')
      if (images.length > 0) {
        try {
          await propertiesApi.uploadImages(res.property.id, images)
        } catch { toast.error('Image upload failed. You can add them later.') }
      }
      navigate(`/payment/${res.property.id}`)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create listing.'),
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleAmenity = (a) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }))
  }

  const submit = () => {
    if (!form.title || !form.location_id || !form.price || !form.whatsapp_contact) {
      toast.error('Please fill all required fields.')
      return
    }
    createMutation.mutate(form)
  }

  const allLocations = locations?.data
    ? Object.values(locations.data).flat()
    : []

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">List Your Property</h1>
      <p className="text-gray-500 mb-8">Fill in the details below. Pay ₹499 to publish.</p>

      {/* Steps */}
      <div className="flex gap-4 mb-8">
        {['Basic Info', 'Details', 'Contact & Publish'].map((s, i) => (
          <button key={s} onClick={() => setStep(i + 1)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium border transition
              ${step === i + 1 ? 'bg-brand text-white border-brand' : 'bg-white text-gray-400 border-gray-200'}`}>
            {i + 1}. {s}
          </button>
        ))}
      </div>

      <div className="card p-6 space-y-5">
        {step === 1 && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Property Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. 200 Sq Yd HMDA Plot in Adibatla" className="input-field" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Property Type *</label>
                <select value={form.type} onChange={e => {
                  const t = e.target.value
                  set('type', t)
                  set('price_type', t === 'plot' ? 'sqyd' : t === 'flat' ? 'sqft' : 'total')
                }} className="input-field">
                  {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Location *</label>
                <select value={form.location_id} onChange={e => set('location_id', e.target.value)} className="input-field">
                  <option value="">Select area...</option>
                  {allLocations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.zone})</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Price ({form.price_type === 'sqft' ? 'per sq.ft' : form.price_type === 'sqyd' ? 'per sq.yd' : 'Total ₹'}) *
                </label>
                <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                  placeholder={form.price_type === 'total' ? '9000000' : '4500'} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Price Type</label>
                <select value={form.price_type} onChange={e => set('price_type', e.target.value)} className="input-field">
                  <option value="sqft">per sq.ft</option>
                  <option value="sqyd">per sq.yd</option>
                  <option value="total">Total</option>
                </select>
              </div>
            </div>

            {form.price_type !== 'total' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Area</label>
                  <input type="number" value={form.area} onChange={e => set('area', e.target.value)}
                    placeholder="e.g. 1200" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Unit</label>
                  <select value={form.area_unit} onChange={e => set('area_unit', e.target.value)} className="input-field">
                    <option value="sqft">sq.ft</option>
                    <option value="sqyd">sq.yd</option>
                  </select>
                </div>
              </div>
            )}

            {(form.type === 'flat' || form.type === 'villa' || form.type === 'house') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Bedrooms</label>
                  <select value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} className="input-field">
                    <option value="">Select</option>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} BHK</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Bathrooms</label>
                  <select value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} className="input-field">
                    <option value="">Select</option>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            )}

            <button onClick={() => setStep(2)} className="btn-brand w-full">Next: Add Details →</button>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                rows={4} placeholder="Describe the property — location highlights, legal status, nearby landmarks..."
                className="input-field resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Approval Type</label>
                <select value={form.approval_type} onChange={e => set('approval_type', e.target.value)} className="input-field">
                  <option value="">None specified</option>
                  {['HMDA', 'DTCP', 'Panchayat', 'GHMC', 'RERA Approved'].map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Facing</label>
                <select value={form.facing} onChange={e => set('facing', e.target.value)} className="input-field">
                  <option value="">Select</option>
                  {FACINGS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map(a => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition
                      ${form.amenities.includes(a)
                        ? 'bg-brand text-white border-brand'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">YouTube Video URL (optional)</label>
              <input value={form.youtube_url} onChange={e => set('youtube_url', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..." className="input-field" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Photos (max 10)</label>
              <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center
                               justify-center cursor-pointer hover:border-brand transition">
                <Upload className="w-8 h-8 text-gray-300 mb-2" />
                <span className="text-sm text-gray-500">Click to upload photos</span>
                <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 5MB each</span>
                <input type="file" multiple accept="image/*" className="hidden"
                  onChange={e => setImages(Array.from(e.target.files))} />
              </label>
              {images.length > 0 && (
                <p className="text-sm text-green-600 mt-2">{images.length} photo(s) selected</p>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline flex-1">← Back</button>
              <button onClick={() => setStep(3)} className="btn-brand flex-1">Next: Contact →</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">WhatsApp Number for Leads *</label>
              <input type="tel" maxLength={10} value={form.whatsapp_contact}
                onChange={e => set('whatsapp_contact', e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number" className="input-field" />
              <p className="text-xs text-gray-400 mt-1">Buyers will contact you directly on this number.</p>
            </div>

            {/* Summary */}
            <div className="bg-surface rounded-xl p-4 space-y-2 text-sm">
              <h3 className="font-semibold text-gray-700">Summary</h3>
              <div className="grid grid-cols-2 gap-1 text-gray-600">
                <span>Title:</span><span className="font-medium truncate">{form.title || '—'}</span>
                <span>Type:</span><span className="capitalize">{form.type}</span>
                <span>Location:</span><span>{allLocations.find(l => l.id == form.location_id)?.name || '—'}</span>
                <span>Price:</span><span>₹{Number(form.price || 0).toLocaleString()} {form.price_type !== 'total' ? `/ ${form.price_type}` : ''}</span>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <p className="text-sm font-semibold text-orange-700 mb-1">Listing Fee: ₹499</p>
              <p className="text-xs text-orange-600">Your listing will go live for 30 days after payment and admin approval.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-outline flex-1">← Back</button>
              <button onClick={submit} disabled={createMutation.isPending}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save & Pay ₹499
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ListProperty
