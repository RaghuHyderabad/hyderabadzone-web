// src/pages/Dashboard.jsx
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PlusCircle, Eye, TrendingUp, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { userApi, propertiesApi } from '../api/index'
import { formatPrice } from '../utils/index'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  userApi.dashboard,
  })

  const markSold = async (id) => {
    if (!window.confirm('Mark this property as SOLD? This cannot be undone.')) return
    try {
      await propertiesApi.markSold(id)
      toast.success('Property marked as sold!')
      queryClient.invalidateQueries(['dashboard'])
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed. Please try again.')
    }
  }

  if (isLoading) return (
    <div className="flex justify-center py-20" style={{minHeight:'60vh'}}>
      <Loader2 className="w-8 h-8 text-brand animate-spin" />
    </div>
  )

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
                      <div className="flex gap-2 flex-wrap">
                        <Link to={`/property/${l.slug}`} className="text-brand text-xs hover:underline">View</Link>
                        {l.status !== 'sold' && (
                          <Link to={`/edit-property/${l.id}`} className="text-gray-500 text-xs hover:underline">Edit</Link>
                        )}
                        {l.status === 'active' && (
                          <button
                            onClick={() => markSold(l.id)}
                            className="text-blue-600 text-xs hover:underline font-medium">
                            Mark Sold
                          </button>
                        )}
                        {(l.status === 'expired' || l.status === 'active') && (
                          <Link to={`/payment/${l.id}`} className="text-orange-500 text-xs hover:underline">Renew</Link>
                        )}
                        {l.status === 'pending_payment' && (
                          <Link to={`/payment/${l.id}`} className="text-green-600 text-xs font-semibold hover:underline">Pay ₹499</Link>
                        )}
                        {l.status === 'pending' && (
                          <Link to={`/verify-whatsapp?property_id=${l.id}`} className="text-green-600 text-xs font-semibold hover:underline">✅ Verify</Link>
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
    sold:            'bg-blue-100 text-blue-700',
    pending:         'bg-orange-100 text-orange-700',
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
