// src/components/search/SearchBar.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Home, X, Loader2 } from 'lucide-react'
import { searchApi } from '../../api/index'

const SUGGESTIONS = [
  'Plots in Adibatla',
  'Flats in Kondapur',
  'Villas near Gachibowli',
  '2BHK under 60L in LB Nagar',
  'Open plots near Pharma City',
  'Villas in Kokapet',
]

export default function SearchBar({ large = false, defaultValue = '' }) {
  const [query, setQuery]           = useState(defaultValue)
  const [results, setResults]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [focused, setFocused]       = useState(false)
  const [placeholder, setPlaceholder] = useState(SUGGESTIONS[0])
  const navigate                    = useNavigate()
  const inputRef                    = useRef(null)
  const debounceRef                 = useRef(null)
  const phIndexRef                  = useRef(0)

  // Rotate placeholder suggestions
  useEffect(() => {
    const id = setInterval(() => {
      phIndexRef.current = (phIndexRef.current + 1) % SUGGESTIONS.length
      setPlaceholder(SUGGESTIONS[phIndexRef.current])
    }, 3000)
    return () => clearInterval(id)
  }, [])

  // Debounced autocomplete
  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchApi.autocomplete(query)
        setResults(data.data ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const handleSearch = (q = query) => {
    if (!q.trim()) return
    setFocused(false)
    navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
    if (e.key === 'Escape') setFocused(false)
  }

  const sizeClasses = large
    ? 'text-base py-4 pl-5 pr-14 rounded-2xl'
    : 'text-sm py-3 pl-4 pr-12 rounded-xl'

  return (
    <div className="relative w-full">
      {/* Input */}
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ${large ? 'w-5 h-5' : 'w-4 h-4'}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30
                      focus:border-brand text-gray-800 placeholder-gray-400 transition shadow-sm
                      ${large ? 'pl-12 py-4 pr-14 text-base rounded-2xl' : 'pl-10 py-3 pr-12 text-sm rounded-xl'}`}
        />
        {query ? (
          <button
            onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
            className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
        <button
          onClick={() => handleSearch()}
          className={`absolute right-2 top-1/2 -translate-y-1/2 bg-brand text-white rounded-xl
                      flex items-center justify-center hover:bg-brand-light transition
                      ${large ? 'w-10 h-10' : 'w-8 h-8'}`}
        >
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Search className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Dropdown */}
      {focused && (results.length > 0 || query.length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl
                        border border-gray-100 z-50 overflow-hidden max-h-72 overflow-y-auto">
          {results.length === 0 && !loading && (
            <div className="px-4 py-3 text-gray-400 text-sm">
              Press Enter to search for "<span className="text-gray-600">{query}</span>"
            </div>
          )}
          {results.map((r, i) => (
            <button
              key={i}
              onMouseDown={() => handleSearch(r.type === 'location' ? r.action : r.label)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-surface transition text-left"
            >
              <div className="mt-0.5 flex-shrink-0">
                {r.type === 'location'
                  ? <MapPin className="w-4 h-4 text-brand" />
                  : <Home className="w-4 h-4 text-cta-start" />
                }
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">{r.label}</div>
                <div className="text-xs text-gray-400">{r.sub}</div>
              </div>
            </button>
          ))}

          {/* Quick filter chips */}
          {query.length < 2 && (
            <div className="px-4 py-3 border-t border-gray-50">
              <div className="text-xs text-gray-400 mb-2">Popular searches</div>
              <div className="flex flex-wrap gap-2">
                {['Plots in Adibatla', 'Flats HITEC City', 'Villas Kokapet', 'LB Nagar plots'].map(s => (
                  <button
                    key={s}
                    onMouseDown={() => handleSearch(s)}
                    className="text-xs bg-surface text-brand px-3 py-1.5 rounded-full hover:bg-brand hover:text-white transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
