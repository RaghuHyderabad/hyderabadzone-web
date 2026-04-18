import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { propertiesApi, locationsApi } from '../api/index'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const TYPES   = ['plot', 'flat', 'villa', 'house']
const FACING  = ['East', 'West', 'North', 'South', 'NE', 'NW', 'SE', 'SW']
const AMENITIES = ['24/7 Water', 'Power Backup', 'Security', 'Park', 'Gym', 'Swimming Pool', 'Club House', 'Parking']

export default function EditProperty() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(null)

  // Load existing property
  const { data: propData, isLoading: propLoading } = useQuery({
    queryKey: ['property-edit', id],
    queryFn:  () => propertiesApi.get(id),
  })

  // Load locations
  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn:  locationsApi.list,
  })

  const allLocations = locations?.data
    ? Object.values(locations.data).flat()
    : []

  // Pre-fill form when property loads
  useEffect(() => {
    if (propData?.data) {
      const p = propData.data
      setForm({
        title:            p.title ?? '',
        type:             p.type ?? 'flat',
        location_id:      p.location?.id ?? '',
        price:            p.price ?? '',
        price_type:       p.price_type ?? 'sqft',
        area:             p.area ?? '',
        area_unit:        p.area_unit ?? 'sqft',
        bedrooms:         p.bedrooms ?? '',
        bathrooms:        p.bathrooms ?? '',
        description:      p.description ?? '',
        amenities:        p.amenities ?? [],
        approval_type:    p.approval_type ?? '',
        facing:           p.facing ?? '',
        youtube_url:      p.youtube_url ?? '',
        whatsapp_contact: p.whatsapp_link?.match(/\d{10}/)?.[0] ?? '',
        latitude:         p.latitude ?? '',
        longitude:        p.longitude ?? '',
      })
    }
  }, [propData])

  const updateMutation = useMutation({
    mutationFn: (data) => propertiesApi.update(id, data),
    onSuccess:  () => {
      toast.success('Property updated successfully!')
      navigate('/dashboard')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed.'),
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleAmenity = (a) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter(x => x !== a)
        : [...f.amenities, a],
    }))
  }

  const submit = () => {
    if (!form.title || !form.price) {
      toast.error('Please fill all required fields.')
      return
    }
    updateMutation.mutate(form)
  }

  if (propLoading || !form) return (
    <div className="flex justify-center py-24">
      <Loader2 className="w-8 h-8 text-brand animate-spin" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Property</h1>
      <p className="text-gray-500 mb-8">Update your property details below.</p>

      <div className="card p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Property Title *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. 200 Sq Yd HMDA Plot in Adibatla" className="input-field" />
        </div>

        {/* Type + Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Property Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} className="input-field">
              {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
            <select value={form.location_id} onChange={e => set('location_id', e.target.value)} className="input-field">
              <option value="">Select area...</option>
              {allLocations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.zone})</option>)}
            </select>
          </div>
        </div>

        {/* Price */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Price *</label>
            <input type="number" value={form.price} onChange={e => set('price', e.target.value)} className="input-field" />
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

        {/* Area */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Area</label>
            <input type="number" value={form.area} onChange={e => set('area', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Unit</label>
            <select value={form.area_unit} onChange={e => set('area_unit', e.target.value)} className="input-field">
              <option value="sqft">sq.ft</option>
              <option value="sqyd">sq.yd</option>
            </select>
          </div>
        </div>

        {/* BHK */}
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

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={4} className="input-field resize-none" />
        </div>

        {/* Approval + Facing */}
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

        {/* Amenities */}
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

        {/* YouTube */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">YouTube URL</label>
          <input value={form.youtube_url} onChange={e => set('youtube_url', e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..." className="input-field" />
        </div>

        {/* WhatsApp */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">WhatsApp Number *</label>
          <input type="tel" maxLength={10} value={form.whatsapp_contact}
            onChange={e => set('whatsapp_contact', e.target.value.replace(/\D/g, ''))}
            className="input-field" />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button onClick={() => navigate('/dashboard')} className="btn-outline flex-1">
            ← Cancel
          </button>
          <button onClick={submit} disabled={updateMutation.isPending}
            className="btn-brand flex-1 flex items-center justify-center gap-2">
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
