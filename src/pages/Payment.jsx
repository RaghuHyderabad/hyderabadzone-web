// src/pages/Payment.jsx
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ShieldCheck, Loader2, CreditCard, RefreshCw } from 'lucide-react'
import { propertiesApi, paymentsApi } from '../api/index'
import { formatPrice } from '../utils/index'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

// Load Razorpay script once
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload  = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

export default function Payment() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { user }   = useAuthStore()

  const { data: propData, isLoading } = useQuery({
    queryKey: ['property-pay', id],
    queryFn:  () => propertiesApi.get(id),
  })

  const orderMutation = useMutation({
    mutationFn: paymentsApi.createOrder,
  })

  const verifyMutation = useMutation({
    mutationFn: paymentsApi.verify,
    onSuccess: (res) => {
      toast.success('Payment successful!')
      navigate(`/verify-whatsapp?property_id=${id}`)
    },
    onError: () => toast.error('Payment verification failed. Contact support.'),
  })

  const handlePay = async (type = 'new_listing') => {
    const loaded = await loadRazorpay()
    if (!loaded) { toast.error('Payment service unavailable. Please try again.'); return }

    try {
      const order = await orderMutation.mutateAsync({
        property_id: Number(id),
        type,
      })

      const options = {
        key:         order.key_id,
        amount:      order.amount,
        currency:    'INR',
        name:        'HyderabadZone',
        description: type === 'new_listing' ? 'Property Listing Fee' : 'Listing Renewal',
        order_id:    order.order_id,
        prefill:     order.prefill,
        theme:       { color: '#1F3C88' },
        modal: {
          ondismiss: () => toast.error('Payment cancelled.'),
        },
        handler: async (response) => {
          try {
            await verifyMutation.mutateAsync({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              payment_id:          order.payment_id,
            })
          } catch {}
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (r) => {
        toast.error(`Payment failed: ${r.error.description}`)
      })
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment.')
    }
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
        <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-brand" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isRenewal ? 'Renew Listing' : 'Publish Your Listing'}
        </h1>
        <p className="text-gray-500 mt-1">One-time payment to go live on HyderabadZone</p>
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

      {/* Pricing */}
      <div className="card p-5 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Choose Plan</h3>

        {/* Standard listing */}
        <div className="border border-brand/30 rounded-xl p-4 mb-3 bg-brand/5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-semibold text-gray-800">Standard Listing</div>
              <div className="text-sm text-gray-500 mt-0.5">30 days · Admin verified · WhatsApp leads</div>
            </div>
            <div className="text-2xl font-bold text-brand">₹499</div>
          </div>
          <ul className="text-xs text-gray-600 space-y-1 mb-4">
            {['30-day live listing', 'Direct WhatsApp contact', 'Admin verification', 'Lead tracking dashboard'].map(f => (
              <li key={f} className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handlePay(isRenewal ? 'renewal' : 'new_listing')}
            disabled={orderMutation.isPending || verifyMutation.isPending}
            className="btn-brand w-full flex items-center justify-center gap-2"
          >
            {(orderMutation.isPending || verifyMutation.isPending)
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <CreditCard className="w-4 h-4" />
            }
            Pay ₹499 &amp; {isRenewal ? 'Renew' : 'Publish'}
          </button>
        </div>

        {/* Featured boost */}
        <div className="border border-orange-200 rounded-xl p-4 bg-orange-50">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="font-semibold text-gray-800 flex items-center gap-2">
                Featured Boost
                <span className="badge-featured text-xs">⚡ Premium</span>
              </div>
              <div className="text-sm text-gray-500 mt-0.5">Top position in search · 3× more visibility</div>
            </div>
            <div className="text-2xl font-bold text-orange-600">₹999</div>
          </div>
          <button
            onClick={() => handlePay('featured_boost')}
            disabled={p.status !== 'active' || orderMutation.isPending}
            className="btn-primary w-full mt-3 text-sm"
          >
            {p.status !== 'active' ? 'Publish first to boost' : 'Boost for ₹999'}
          </button>
        </div>
      </div>

      {/* Trust signals */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
        <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Secure payment</span>
        <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> 30-day listing</span>
        <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Razorpay</span>
      </div>

      <p className="text-xs text-center text-gray-400 mt-4">
        Payments are processed securely by Razorpay. View our{' '}
        <a href="/refund" className="text-brand hover:underline">Refund Policy</a>.
      </p>
    </div>
  )
}
