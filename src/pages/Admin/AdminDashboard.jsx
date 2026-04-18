// src/pages/Admin/AdminDashboard.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Zap, Users, TrendingUp, IndianRupee, Loader2 } from 'lucide-react'
import { adminApi } from '../../api/index'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const qc = useQueryClient()

  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn:  adminApi.analytics,
    refetchInterval: 60000,
  })

  const { data: pending, isLoading } = useQuery({
    queryKey: ['admin-properties', 'pending_payment'],
    queryFn:  () => adminApi.properties({ status: 'pending_payment' }),
  })

  const approveMutation = useMutation({
    mutationFn: adminApi.approve,
    onSuccess: () => {
      toast.success('Property approved and live!')
      qc.invalidateQueries({ queryKey: ['admin-properties'] })
      qc.invalidateQueries({ queryKey: ['admin-analytics'] })
    },
    onError: () => toast.error('Approval failed.'),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminApi.reject(id, reason),
    onSuccess: () => {
      toast.success('Property rejected.')
      qc.invalidateQueries({ queryKey: ['admin-properties'] })
    },
  })

  const a = analytics || {}

  const handleReject = (id) => {
    const reason = window.prompt('Reason for rejection:')
    if (!reason) return
    rejectMutation.mutate({ id, reason })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-3">
          <Link to="/admin/listings"  className="btn-outline text-sm">All Listings</Link>
          <Link to="/admin/analytics" className="btn-brand text-sm">Analytics</Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users',    value: a.overview?.total_users     ?? 0, icon: <Users className="w-5 h-5 text-brand" />,         sub: `+${a.overview?.new_today ?? 0} today` },
          { label: 'Active Listings',value: a.overview?.active_listings ?? 0, icon: <TrendingUp className="w-5 h-5 text-green-500" />, sub: `${a.overview?.pending_approval ?? 0} pending` },
          { label: 'Revenue (Month)',value: `₹${Number(a.revenue?.this_month ?? 0).toLocaleString('en-IN')}`, icon: <IndianRupee className="w-5 h-5 text-orange-500" />, sub: `₹${Number(a.revenue?.today ?? 0).toLocaleString()} today` },
          { label: 'Total Leads',    value: a.leads?.total             ?? 0, icon: <TrendingUp className="w-5 h-5 text-purple-500" />, sub: `${a.leads?.this_month ?? 0} this month` },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-2 mb-1">{s.icon}<span className="text-xs text-gray-500">{s.label}</span></div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{s.value}</div>
            <div className="text-xs text-gray-400">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Pending approvals */}
      <div className="card overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">
            Pending Approval
            {pending?.data?.total > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                {pending.data.total}
              </span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-brand animate-spin" /></div>
        ) : !pending?.data?.data?.length ? (
          <div className="text-center py-8 text-gray-400 text-sm">No pending listings. All clear! ✅</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr>
                  {['Property', 'Owner', 'Type', 'Price', 'Location', 'Submitted', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.data.data.map(p => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-surface transition">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 max-w-40 truncate">{p.title}</div>
                      <a href={`/property/${p.slug}`} target="_blank" className="text-xs text-brand hover:underline">Preview</a>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700">{p.user?.name}</div>
                      <div className="text-xs text-gray-400">{p.user?.phone}</div>
                    </td>
                    <td className="px-4 py-3 capitalize"><span className="badge-type">{p.type}</span></td>
                    <td className="px-4 py-3 font-medium text-brand">{p.formatted_price}</td>
                    <td className="px-4 py-3 text-gray-600">{p.location?.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(p.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveMutation.mutate(p.id)}
                          disabled={approveMutation.isPending}
                          className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1.5
                                     rounded-lg hover:bg-green-200 transition font-medium"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(p.id)}
                          disabled={rejectMutation.isPending}
                          className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2.5 py-1.5
                                     rounded-lg hover:bg-red-200 transition font-medium"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button
                          onClick={() => adminApi.toggleFeatured(p.id).then(() => {
                            toast.success('Featured status updated.')
                            qc.invalidateQueries({ queryKey: ['admin-properties'] })
                          })}
                          className="flex items-center gap-1 text-xs bg-orange-100 text-orange-600 px-2.5 py-1.5
                                     rounded-lg hover:bg-orange-200 transition font-medium"
                        >
                          <Zap className="w-3.5 h-3.5" /> Feature
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

      {/* Top locations + recent payments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top locations */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Top Locations</h3>
          <div className="space-y-3">
            {(a.top_locations ?? []).slice(0, 6).map((l, i) => (
              <div key={l.slug} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <span className="text-sm text-gray-700">{l.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand rounded-full"
                         style={{ width: `${(l.count / ((a.top_locations?.[0]?.count) || 1)) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-6 text-right">{l.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent payments */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Payments</h3>
          <div className="space-y-3">
            {(a.recent_payments ?? []).slice(0, 5).map(pay => (
              <div key={pay.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700">{pay.user?.name}</div>
                  <div className="text-xs text-gray-400 truncate max-w-36">{pay.property?.title}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600">₹{Number(pay.amount).toLocaleString()}</div>
                  <div className="text-xs text-gray-400">{new Date(pay.paid_at).toLocaleDateString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
