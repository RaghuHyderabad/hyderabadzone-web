import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { IndianRupee, Users, TrendingUp, MessageSquare, BarChart2 } from 'lucide-react'
import { adminApi } from '../../api/index'

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.stats,
  })

  const stats = data?.stats ?? {}

  const cards = [
    { label: 'Total Revenue',    value: `₹${(stats.revenue ?? 0).toLocaleString()}`,  icon: IndianRupee, color: 'text-green-600'  },
    { label: 'Total Users',      value: stats.users ?? 0,       icon: Users,         color: 'text-blue-600'   },
    { label: 'Active Listings',  value: stats.active ?? 0,      icon: TrendingUp,    color: 'text-brand'      },
    { label: 'Total Leads',      value: stats.leads ?? 0,       icon: MessageSquare, color: 'text-purple-600' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-brand" /> Analytics
        </h1>
        <Link to="/admin" className="btn-outline text-sm">← Back</Link>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map(c => (
            <div key={c.label} className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <c.icon className={`w-5 h-5 ${c.color}`} />
                <span className="text-sm text-gray-500">{c.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{c.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
