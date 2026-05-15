// src/components/layout/Navbar.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Home, Search, PlusCircle, LayoutDashboard, LogOut } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { authApi } from '../../api/index'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { token, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    navigate('/')
    toast.success('Logged out successfully.')
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-brand">HyderabadZone</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/search" className="text-gray-600 hover:text-brand font-medium transition flex items-center gap-1.5">
              <Search className="w-4 h-4" /> Search
            </Link>
            {token ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-brand font-medium transition flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-brand hover:text-brand-light font-semibold transition text-sm border border-brand px-3 py-1.5 rounded-lg">
                    Admin Panel
                  </Link>
                )}
                <Link to="/list-property" className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4" /> List Property
                </Link>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-brand text-sm px-4 py-2">
                Login / Register
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-gray-500" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link to="/search"       onClick={() => setOpen(false)} className="block text-gray-700 font-medium py-2">Search Properties</Link>
          {token ? (
            <>
              <Link to="/dashboard"     onClick={() => setOpen(false)} className="block text-gray-700 font-medium py-2">My Dashboard</Link>
              <Link to="/list-property" onClick={() => setOpen(false)} className="block text-gray-700 font-medium py-2">+ List Property</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setOpen(false)} className="block text-brand font-medium py-2">Admin Panel</Link>
              )}
              <button onClick={() => { handleLogout(); setOpen(false) }} className="block text-red-500 font-medium py-2">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="block btn-brand text-center py-2.5 rounded-xl">Login / Register</Link>
          )}
        </div>
      )}
    </nav>
  )
}


// src/components/layout/Footer.jsx
export function Footer() {
  return (
    <footer className="bg-brand text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-3">HyderabadZone</h3>
          <p className="text-blue-200 text-sm leading-relaxed">
            Hyderabad's smartest property discovery platform. Direct owner contact, zero middlemen.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Property Types</h4>
          <ul className="space-y-2 text-blue-200 text-sm">
            {['Plots', 'Flats', 'Villas', 'Independent Houses'].map(t => (
              <li key={t}><a href={`/search?type=${t.toLowerCase()}`} className="hover:text-white transition">{t}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Popular Areas</h4>
          <ul className="space-y-2 text-blue-200 text-sm">
            {['Gachibowli', 'Kondapur', 'HITEC City', 'LB Nagar', 'Uppal', 'Adibatla'].map(a => (
              <li key={a}><a href={`/search?q=${a}`} className="hover:text-white transition">{a}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-blue-200 text-sm">
            <li><a href="/about" className="hover:text-white transition">About Us</a></li>
            <li><a href="/list-property" className="hover:text-white transition">List Your Property</a></li>
            <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
            <li><a href="/terms" className="hover:text-white transition">Terms of Service</a></li>
            <li><a href="/refund" className="hover:text-white transition">Refund Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-blue-800 text-center py-4 text-blue-300 text-sm">
        © {new Date().getFullYear()} HyderabadZone. All rights reserved. Marketed by <a href="https://raghuvardhanreddy.com/" target="_blank">Digital Marketing Consultant in Hyderabad</a>
      </div>
    </footer>
  )
}

