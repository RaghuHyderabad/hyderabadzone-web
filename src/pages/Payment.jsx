// src/pages/Payment.jsx
// Listings are FREE — this page confirms and publishes the property directly.
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { CheckCircle, Loader2, Home, ShieldCheck } from 'lucide-react'
import { propertiesApi, paymentsApi } from '../api/index'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function Payment() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: propData, isLoading } = useQuery({
    queryKey: ['property-pay', id],
    queryFn:  () => propertiesApi.get(id),
  })

  const publishMutation = useMutation({
    mutationFn: paymentsApi.publishFree,
    onSuccess: () => {
      toast.success('Listing submitted for review!')
      navigate('/dashboard')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not submit listing.'),
  })

  const handlePublish = (type = 'new_listing') => {
    publishMutation.mutate({ property_id: Number(id), type })
  }

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 text-brand animate-spin" />
    </div>
  )

  const p = propData?.data
  if (!p) return <div className="text-center py-16 text-gray-400">Property not found.</div>

  const isRenewal = p.status === 'active' || p.status === 'expired'

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Home className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isRenewal ? 'Renew Listing' : 'Publish Your Listing'}
        </h1>
        <p className="text-gray-500 mt-1">
          Listing on HyderabadZone is completely <span className="text-green-600 font-semibold">free</span>!
        </p>
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

      {/* Free listing plan */}
      <div className="card p-5 mb-6 border-2 border-green-200 bg-green-50">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-semibold text-gray-800 text-lg">Standard Listing</div>
            <div className="text-sm text-gray-500 mt-0.5">30 days · Admin verified · WhatsApp leads</div>
          </div>
          <div className="text-2xl font-bold text-green-600">FREE</div>
        </div>
        <ul className="text-sm text-gray-600 space-y-1.5 mb-5">
          {['30-day live listing', 'Direct WhatsApp contact', 'Admin verification & approval', 'Lead tracking dashboard'].map(f => (
            <li key={f} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
            </li>
          ))}
        </ul>
        <button
          onClick={() => handlePublish(isRenewal ? 'renewal' : 'new_listing')}
          disabled={publishMutation.isPending}
          className="btn-brand w-full flex items-center justify-center gap-2">
          {publishMutation.isPending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <CheckCircle className="w-4 h-4" />}
          {isRenewal ? 'Renew for Free' : 'Submit Listing for Free'}
        </button>
      </div>

      {/* Trust signals */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
        <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-green-500" /> No payment needed</span>
        <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Admin verified</span>
        <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5" /> 30-day listing</span>
      </div>

      <p className="text-xs text-center text-gray-400 mt-4">
        Your listing will be reviewed by our team before going live.
      </p>
    </div>
  )
}
