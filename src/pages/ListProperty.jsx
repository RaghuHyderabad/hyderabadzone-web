import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { propertiesApi, locationsApi } from '../api/index'
import { Loader2, Upload, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

const TYPES     = ['plot', 'flat', 'villa', 'house']
const FACING    = ['East', 'West', 'North', 'South', 'NE', 'NW', 'SE', 'SW']
const AMENITIES = ['24/7 Water', 'Power Backup', 'Security', 'Park', 'Gym', 'Swimming Pool', 'Club House', 'Parking']

export default function ListProperty() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [images, setImages] = useState([])
  const [mapInput, setMapInput] = useState('')
  const [form, setForm] = useState({
    title: '', type: 'flat', location_id: '', price: '', price_type: 'sqft',
    area: '', area_unit: 'sqft', bedrooms: '', bathrooms: '', description: '',
    amenities: [], approval_type: '', facing: '', youtube_url: '',
    whatsapp_contact: '', latitude: '', longitude: '',
  })

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn:  locationsApi.list,
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
      // Admin listings skip payment and verification
      if (res.admin) {
        toast.success('Listing published successfully!')
        navigate('/dashboard')
      } else {
        // Regular users: go to free publish confirmation
        toast.success('Property saved! Submit to publish...')
        navigate(`/payment/${res.property.id}`)
      }
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

  // Parse lat/lng from Google Maps link or direct coordinates
  const parseMapLink = (input) => {
    if (!input) return
    const patterns = [
      /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /maps\/place\/[^/]+\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/,
    ]
    for (const pattern of patterns) {
      const match = input.match(pattern)
      if (match) {
        set('latitude', match[1])
        set('longitude', match[2])
        toast.success(`📍 Location set: ${match[1]}, ${match[2]}`)
        return
      }
    }
    toast.error('Could not read location. Try: 17.3850, 78.4867 or paste a Google Maps link.')
  }

  const submit = () => {
    if (!form.title || !form.location_id || !form.price || !form.whatsapp_contact) {
      toast.error('Please fill all required fields.')
      return
    }
    if (!/^[6-9]\d{9}$/.test(form.whatsapp_contact)) {
      toast.error('Enter a valid 10-digit WhatsApp number.')
      return
    }
    createMutation.mutate(form)
  }

  // Handle both grouped {zone: [...]} and flat array formats
  const allLocations = (() => {
    try {
      if (!locations?.data) return []
      const data = locations.data
      if (Array.isArray(data)) return data
      return Object.values(data).flat()
    } catch { return [] }
  })()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">List Your Property</h1>
      <p className="text-gray-500 mb-8">Fill in the details below. Listing is completely free!</p>

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

        {/* ── STEP 1: Basic Info ── */}
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

        {/* ── STEP 2: Details ── */}
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
                  {FACING.map(f => <option key={f}>{f}</option>)}
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

            {/* ── GOOGLE MAPS LOCATION ── */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                <MapPin className="w-4 h-4 text-brand" />
                Property Location on Map (optional but recommended)
              </label>
              <div className="flex gap-2">
                <input
                  value={mapInput}
                  onChange={e => setMapInput(e.target.value)}
                  placeholder="Paste Google Maps link or coordinates e.g. 17.3850, 78.4867"
                  className="input-field flex-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => parseMapLink(mapInput)}
                  className="btn-outline text-sm px-4 whitespace-nowrap">
                  Set 📍
                </button>
              </div>

              {form.latitude && form.longitude ? (
                <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  ✅ Location set: {Number(form.latitude).toFixed(4)}, {Number(form.longitude).toFixed(4)}
                  <button
                    type="button"
                    onClick={() => { set('latitude', ''); set('longitude', ''); setMapInput('') }}
                    className="ml-auto text-red-400 hover:text-red-600 font-medium">
                    ✕ Clear
                  </button>
                </div>
              ) : (
                <div className="mt-2 bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-600 space-y-1">
                  <p className="font-medium">📱 How to get your property location:</p>
                  <p>1. Open <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="underline font-medium">Google Maps</a> on your phone</p>
                  <p>2. Long press on your property location</p>
                  <p>3. Tap the coordinates shown at the top (e.g. 17.3850, 78.4867)</p>
                  <p>4. Tap Share → Copy Link → paste here</p>
                  <p className="text-blue-400">Or type coordinates directly: 17.3850, 78.4867</p>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Photos — up to 6 (first one = primary display image)
              </label>
              <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center
                               justify-center cursor-pointer hover:border-brand transition">
                <Upload className="w-8 h-8 text-gray-300 mb-2" />
                <span className="text-sm text-gray-500">Click to upload photos</span>
                <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 5MB each · Up to 6 photos</span>
                <span className="text-xs text-orange-500 mt-1">💡 Compress large photos free at tinypng.com</span>
                <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={e => {
                    const files = Array.from(e.target.files)
                    const MAX_BYTES = 5 * 1024 * 1024
                    e.target.value = ''
                    for (const file of files) {
                      const sizeMB = (file.size / 1024 / 1024).toFixed(1)
                      if (file.size > MAX_BYTES) {
                        toast.error(
                          `❌ "${file.name}" is ${sizeMB}MB — too large!\n\nMax allowed: 5MB per photo.\n\n👉 Compress it free at tinypng.com then upload again.`,
                          { duration: 8000 }
                        )
                        return
                      }
                    }
                    if (files.length > 6) {
                      toast.error('Maximum 6 photos allowed.')
                      return
                    }
                    setImages(files.slice(0, 6))
                  }} />
              </label>
              {images.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-green-600 mb-2">{images.length} photo(s) selected</p>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, i) => (
                      <div key={i} className={`relative rounded-xl overflow-hidden border-2
                        ${i === 0 ? 'border-brand' : 'border-gray-200'}`}>
                        <img src={URL.createObjectURL(img)} alt="" className="w-full h-24 object-cover" />
                        {i === 0 && (
                          <div className="absolute bottom-1 left-1 bg-brand text-white text-xs px-2 py-0.5 rounded-full">
                            Primary
                          </div>
                        )}
                        <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline flex-1">← Back</button>
              <button onClick={() => setStep(3)} className="btn-brand flex-1">Next: Contact →</button>
            </div>
          </>
        )}

        {/* ── STEP 3: Contact & Publish ── */}
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
                <span>Photos:</span><span>{images.length} selected</span>
                <span>Map:</span><span>{form.latitude ? '✅ Set' : '—'}</span>
              </div>
            </div>

            {/* Free listing info */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-700 mb-1">🎉 Listing is 100% FREE until June 30, 2027</p>
              <div className="text-xs text-gray-500 space-y-1 mt-2">
                <div>✅ Step 1: Submit property details (this form)</div>
                <div>✅ Step 2: Confirm via WhatsApp</div>
                <div>✅ Step 3: Admin approves → listing goes live!</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-outline flex-1">← Back</button>
              <button onClick={submit} disabled={createMutation.isPending}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Submit Listing for Free →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
