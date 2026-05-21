// src/pages/Payment.jsx
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { CheckCircle, Loader2, Home, ShieldCheck, Gift } from 'lucide-react'
import { propertiesApi, paymentsApi } from '../api/index'
import toast from 'react-hot-toast'

export default function Payment() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const { data: propData, isLoading } = useQuery({
    queryKey: ['property-pay', id],
    queryFn:  () => propertiesApi.get(id),
  })

  const publishMutation = useMutation({
    mutationFn: paymentsApi.publishFree,
    onSuccess: () => {
      toast.success('Listing submitted for review!')
      navigate(`/verify-whatsapp?property_id=${id}`)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not submit listing.'),
  })

  const handlePublish = () => {
    const p = propData?.data
    const type = (p?.status === 'active' || p?.status === 'expired') ? 'renewal' : 'new_listing'
    publishMutation.mutate({ property_id: Number(id), type })
  }

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 text-brand animate-spin" />
    </div>
  )

  const p = propData?.data
  if (!p) return <div className="text-center py-16 text-gray-400">Property not found.</div>

  return (
    <div className="max-w-lg mx-auto px-4 py-12">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Almost There!</h1>
        <p className="text-gray-500 mt-1">Review your property and submit for free</p>
      </div>

      {/* FREE banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 mb-6 text-center text-white shadow-md">
        <div className="text-3xl font-extrabold tracking-tight">🎉 100% FREE</div>
        <div className="text-sm mt-1 opacity-90">Listing is free until <strong>June 30, 2027</strong></div>
      </div>

      {/* Property summary */}
      <div className="card p-5 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Property Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Title</span>
            <span className="font-medium text-gray-800 text-right max-w-48 truncate">{p.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Location</span>
            <span className="text-gray-800">{p.location?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Price</span>
            <span className="font-semibold text-brand">{p.formatted_price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Type</span>
            <span className="capitalize">{p.type}</span>
          </div>
        </div>
      </div>

      {/* What you get */}
      <div className="card p-5 mb-6 border border-green-200">
        <h3 className="font-semibold text-gray-800 mb-3">What's included</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          {[
            'Direct WhatsApp leads from buyers',
            'Admin verification & approval',
            'Lead tracking dashboard',
            'Listed until June 30, 2027 — completely free',
          ].map(f => (
            <li key={f} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Submit button */}
      <button
        onClick={handlePublish}
        disabled={publishMutation.isPending}
        className="btn-brand w-full flex items-center justify-center gap-2 py-3 text-base">
        {publishMutation.isPending
          ? <Loader2 className="w-5 h-5 animate-spin" />
          : <CheckCircle className="w-5 h-5" />}
        Submit Listing for Free
      </button>

      {/* Trust line */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-400 mt-5">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> No payment needed
        </span>
        <span className="flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Admin verified
        </span>
      </div>

      <p className="text-xs text-center text-gray-400 mt-3">
        Your listing will be reviewed by our team before going live.
      </p>
    </div>
  )
}
