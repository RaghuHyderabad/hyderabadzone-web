// src/pages/Admin/ManageListings.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Zap, Search, Loader2 } from 'lucide-react'
import { adminApi } from '../../api/index'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['', 'pending', 'active', 'pending_payment', 'expired', 'rejected', 'draft', 'sold']

export default function ManageListings() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-all-properties', status, page],
    queryFn:  () => adminApi.properties({ status: status || undefined, page }),
  })

  const approveMutation = useMutation({
    mutationFn: adminApi.approve,
    onSuccess: () => { toast.success('Approved!'); qc.invalidateQueries({ queryKey: ['admin-all-properties'] }) },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminApi.reject(id, reason),
    onSuccess: () => { toast.success('Rejected.'); qc.invalidateQueries({ queryKey: ['admin-all-properties'] }) },
  })

  const featuredMutation = useMutation({
    mutationFn: adminApi.toggleFeatured,
    onSuccess: () => { toast.success('Featured updated.'); qc.invalidateQueries({ queryKey: ['admin-all-properties'] }) },
  })

  const handleReject = (id) => {
    const reason = window.prompt('Rejection reason:')
    if (!reason) return
    rejectMutation.mutate({ id, reason })
  }

  const properties = data?.data?.data ?? []
  const pagination  = data?.data

  const STATUS_COLORS = {
    active:          'bg-green-100 text-green-700',
    pending:         'bg-orange-100 text-orange-700',
    sold:            'bg-blue-100 text-blue-700',
    pending_payment: 'bg-yellow-100 text-yellow-700',
    draft:           'bg-gray-100 text-gray-600',
    expired:         'bg-red-100 text-red-600',
    rejected:        'bg-red-200 text-red-800',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Listings</h1>
        <Link to="/admin" className="btn-outline text-sm">← Dashboard</Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {STATUS_OPTIONS.map(s => (
          <button key={s || 'all'}
            onClick={() => { setStatus(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition capitalize
              ${status === s ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-gray-200 hover:border-brand'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-brand animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr>
                  {['ID', 'Property', 'Owner', 'Type', 'Price', 'Location', 'Status', 'Featured', 'Expires', 'Actions'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {properties.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-8 text-gray-400">No listings found.</td></tr>
                ) : properties.map(p => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-surface/50 transition text-xs">
                    <td className="px-3 py-3 text-gray-400">#{p.id}</td>
                    <td className="px-3 py-3 max-w-48">
                      <div className="font-medium text-gray-800 truncate">{p.title}</div>
                      <a href={`/property/${p.slug}`} target="_blank" rel="noopener" className="text-brand hover:underline">View</a>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-gray-700">{p.user?.name}</div>
                      <div className="text-gray-400">{p.user?.phone}</div>
                    </td>
                    <td className="px-3 py-3 capitalize"><span className="badge-type text-xs">{p.type}</span></td>
                    <td className="px-3 py-3 font-medium text-brand whitespace-nowrap">{p.formatted_price}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{p.location?.name}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize whitespace-nowrap ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {p.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {p.is_featured ? '⭐' : '—'}
                    </td>
                    <td className="px-3 py-3 text-gray-400 whitespace-nowrap">
                      {p.expires_at ? new Date(p.expires_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {p.status === 'pending_payment' && (
                          <button onClick={() => approveMutation.mutate(p.id)}
                            className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(p.status === 'pending_payment' || p.status === 'active') && (
                          <button onClick={() => handleReject(p.id)}
                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => featuredMutation.mutate(p.id)}
                          className={`p-1.5 rounded-lg transition ${p.is_featured ? 'bg-orange-200 text-orange-700' : 'bg-orange-100 text-orange-500 hover:bg-orange-200'}`}>
                          <Zap className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination?.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition
                ${n === page ? 'bg-brand text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand'}`}>
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

