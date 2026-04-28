import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Phone, Search, Loader2 } from 'lucide-react'
import { adminApi } from '../../api/index'

const SOURCE_COLORS = {
  form:      'bg-blue-100 text-blue-700',
  whatsapp:  'bg-green-100 text-green-700',
  callback:  'bg-orange-100 text-orange-700',
}

const WA_ICON = <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>

export default function AdminLeads() {
  const [source, setSource] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-leads', source, search, page],
    queryFn:  () => adminApi.leads({ source: source || undefined, search: search || undefined, page }),
  })

  const leads      = data?.data ?? []
  const pagination = data?.pagination

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-brand" /> Buyer Leads
        </h1>
        <Link to="/admin" className="btn-outline text-sm">← Dashboard</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Leads',      value: pagination?.total ?? 0,                                  color: 'text-brand'       },
          { label: 'Form Enquiries',   value: leads.filter(l => l.source === 'form').length,            color: 'text-blue-600'    },
          { label: 'WhatsApp Clicks',  value: leads.filter(l => l.source === 'whatsapp').length,        color: 'text-green-600'   },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        {['', 'form', 'whatsapp', 'callback'].map(s => (
          <button key={s || 'all'} onClick={() => { setSource(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition capitalize
              ${source === s ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-gray-200'}`}>
            {s || 'All Sources'}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search name or phone..." className="input-field pl-9 py-2 text-sm w-56" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-brand animate-spin" /></div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No leads yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr>
                  {['#', 'Buyer', 'Phone', 'Property', 'Message', 'Source', 'Date', 'Action'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map(l => (
                  <tr key={l.id} className="border-t border-gray-50 hover:bg-surface/50 transition text-xs">
                    <td className="px-3 py-3 text-gray-400">#{l.id}</td>
                    <td className="px-3 py-3 font-medium text-gray-800">{l.name}</td>
                    <td className="px-3 py-3">
                      <a href={`tel:+91${l.phone}`} className="flex items-center gap-1 text-brand hover:underline">
                        <Phone className="w-3 h-3" /> {l.phone}
                      </a>
                    </td>
                    <td className="px-3 py-3">
                      {l.property ? (
                        <div>
                          <a href={`/property/${l.property.slug}`} target="_blank" rel="noreferrer"
                            className="text-brand hover:underline font-medium line-clamp-1">{l.property.title}</a>
                          <div className="text-gray-400">{l.property.location}</div>
                        </div>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-3 text-gray-500 max-w-40 truncate">{l.message || '—'}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${SOURCE_COLORS[l.source] || 'bg-gray-100 text-gray-600'}`}>
                        {l.source}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-400 whitespace-nowrap">{l.created_at}</td>
                    <td className="px-3 py-3">
                      <a href={`https://wa.me/91${l.phone}`} target="_blank" rel="noreferrer"
                        className="btn-wa text-xs px-3 py-1.5 flex items-center gap-1 w-fit">
                        {WA_ICON} WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
              className="btn-outline text-sm px-3 py-1.5 disabled:opacity-40">← Prev</button>
            <span className="text-sm text-gray-500">Page {page} of {pagination.last_page}</span>
            <button onClick={() => setPage(p => Math.min(pagination.last_page, p+1))} disabled={page === pagination.last_page}
              className="btn-outline text-sm px-3 py-1.5 disabled:opacity-40">Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}
