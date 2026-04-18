// src/components/ui/PropertyCard.jsx
import { Link } from 'react-router-dom'
import { MapPin, Eye, Heart, BadgeCheck, Zap, BedDouble, Maximize2 } from 'lucide-react'
import { formatPrice, formatUnitPrice, priceLabel, calcEMI, formatEMI } from '../../utils/index'
import { useState } from 'react'
import { userApi } from '../../api/index'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function PropertyCard({ property, compact = false }) {
  const { token } = useAuthStore()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const totalPrice = property.price_type === 'total'
    ? Number(property.price)
    : Number(property.price) * Number(property.area)

  const emi = calcEMI(totalPrice)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!token) { toast.error('Login to save properties.'); return }
    setSaving(true)
    try {
      const res = await userApi.toggleSave(property.id)
      setSaved(res.saved)
      toast.success(res.message)
    } catch {
      toast.error('Could not save property.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Link to={`/property/${property.slug}`} className="card block group">
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-card aspect-[4/3] bg-gray-100">
        {property.thumbnail ? (
          <img
            src={property.thumbnail}
            alt={property.title}
            width="400"
            height="300"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Maximize2 className="w-10 h-10" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {property.is_featured && (
            <span className="badge-featured flex items-center gap-1">
              <Zap className="w-3 h-3" /> Featured
            </span>
          )}
          {property.is_verified && (
            <span className="badge-verified flex items-center gap-1">
              <BadgeCheck className="w-3 h-3" /> Verified
            </span>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center
                     hover:bg-white transition shadow-sm"
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>

        {/* Type badge */}
        <div className="absolute bottom-3 left-3">
          <span className="badge-type">{property.type}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-brand transition mb-2">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{property.location?.name}, Hyderabad</span>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="text-brand font-bold text-lg">
            {formatPrice(property.price, property.price_type, property.area)}
          </div>
          {property.price_type !== 'total' && (
            <div className="text-gray-400 text-xs">
              {formatUnitPrice(property.price, property.price_type)}
              {property.area && ` · ${property.area} ${property.area_unit}`}
            </div>
          )}
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          {property.bedrooms && (
            <span className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5" /> {property.bedrooms} BHK
            </span>
          )}
          {property.area && (
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" /> {property.area} {property.area_unit}
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Eye className="w-3.5 h-3.5" /> {property.views ?? 0}
          </span>
        </div>

        {/* EMI hint */}
        {!compact && totalPrice > 0 && (
          <div className="text-xs text-gray-400 border-t border-gray-50 pt-2">
            EMI from <span className="text-green-600 font-medium">{formatEMI(emi)}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
