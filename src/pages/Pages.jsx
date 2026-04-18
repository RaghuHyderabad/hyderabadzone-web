// ═══════════════════════════════════════════════════
// src/pages/Search.jsx
// ═══════════════════════════════════════════════════
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Loader2 } from 'lucide-react'
import { useState } from 'react'
import SearchBar from '../components/search/SearchBar'
import PropertyCard from '../components/ui/PropertyCard'
import { searchApi } from '../api/index'

const TYPES    = ['plot', 'flat', 'villa', 'house']
const SORT_OPT = [
  { value: 'rank',       label: 'Best Match'  },
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low'  },
  { value: 'price_desc', label: 'Price: High' },
]

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters]   = useState(false)

  const q          = searchParams.get('q')          || ''
  const type       = searchParams.get('type')        || ''
  const sort       = searchParams.get('sort')        || 'rank'
  const minPrice   = searchParams.get('min_price')   || ''
  const maxPrice   = searchParams.get('max_price')   || ''
  const page       = Number(searchParams.get('page')) || 1

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', q, type, sort, minPrice, maxPrice, page],
    queryFn:  () => searchApi.search({ q, type, sort, min_price: minPrice, max_price: maxPrice, page }),
    keepPreviousData: true,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search bar */}
      <div className="mb-6 max-w-2xl">
        <SearchBar defaultValue={q} />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Type chips */}
        <div className="flex gap-2">
          <button
            onClick={() => setParam('type', '')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition
              ${!type ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-gray-200 hover:border-brand'}`}
          >
            All
          </button>
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setParam('type', t)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border capitalize transition
                ${type === t ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-gray-200 hover:border-brand'}`}
            >
              {t}s
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setParam('sort', e.target.value)}
          className="ml-auto input-field py-2 w-40 text-sm"
        >
          {SORT_OPT.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-outline text-sm flex items-center gap-1.5 py-2"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="card p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Min Budget (₹)</label>
            <input type="number" placeholder="e.g. 2000000" value={minPrice}
              onChange={e => setParam('min_price', e.target.value)}
              className="input-field py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Max Budget (₹)</label>
            <input type="number" placeholder="e.g. 8000000" value={maxPrice}
              onChange={e => setParam('max_price', e.target.value)}
              className="input-field py-2 text-sm" />
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-500 mb-4">
        {data?.total != null ? `${data.total} properties found` : ''}
        {(isFetching && !isLoading) ? ' · Updating...' : ''}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🏚️</div>
          <p className="font-medium">No properties found.</p>
          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {data?.data?.map(p => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: data.pagination.last_page }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setParam('page', n)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition
                ${n === page ? 'bg-brand text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand'}`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


// ═══════════════════════════════════════════════════
// src/pages/Login.jsx
// ═══════════════════════════════════════════════════
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Phone, ShieldCheck, Loader2 } from 'lucide-react'
import { authApi } from '../api/index'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export function Login() {
  const [step, setStep]   = useState(1) // 1=phone, 2=otp
  const [phone, setPhone] = useState('')
  const [otp, setOtp]     = useState('')
  const [name, setName]   = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const sendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Enter a valid 10-digit mobile number.')
      return
    }
    setLoading(true)
    try {
      await authApi.sendOtp(phone)
      toast.success('OTP sent to your number.')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (otp.length !== 6) { toast.error('Enter the 6-digit OTP.'); return }
    setLoading(true)
    try {
      const res = await authApi.verifyOtp({ phone, code: otp, name: name || undefined })
      setAuth(res.token, res.user)
      toast.success('Welcome to HyderabadZone!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="card p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <Link to="/" className="font-bold text-2xl text-brand">HyderabadZone</Link>
          <p className="text-gray-500 text-sm mt-1">
            {step === 1 ? 'Enter your mobile number to continue' : `OTP sent to +91-${phone}`}
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="tel" maxLength={10} value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
                placeholder="10-digit mobile number"
                className="input-field pl-10"
              />
            </div>
            <input
              type="text" value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="input-field"
            />
            <button onClick={sendOtp} disabled={loading} className="btn-brand w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Send OTP
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text" maxLength={6} value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                placeholder="6-digit OTP"
                className="input-field pl-10 tracking-widest text-lg font-mono"
              />
            </div>
            <button onClick={verifyOtp} disabled={loading} className="btn-brand w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Verify & Login
            </button>
            <button onClick={() => { setStep(1); setOtp('') }}
              className="w-full text-sm text-gray-400 hover:text-brand transition">
              ← Change number
            </button>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-6">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-brand">Terms</a> &{' '}
          <a href="/privacy" className="text-brand">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}

export default Login
