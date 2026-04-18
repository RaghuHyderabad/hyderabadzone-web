import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import useAuthStore from './store/authStore'

const Home             = lazy(() => import('./pages/Home'))
const Search           = lazy(() => import('./pages/Search'))
const PropertyDetail   = lazy(() => import('./pages/PropertyDetail'))
const ListProperty     = lazy(() => import('./pages/ListProperty'))
const Payment          = lazy(() => import('./pages/Payment'))
const Dashboard        = lazy(() => import('./pages/Dashboard'))
const Login            = lazy(() => import('./pages/Login'))
const LocationPage     = lazy(() => import('./pages/LocationPage'))
const LocationTypePage = lazy(() => import('./pages/LocationTypePage'))
const AdminDashboard   = lazy(() => import('./pages/Admin/AdminDashboard'))
const ManageListings   = lazy(() => import('./pages/Admin/ManageListings'))
const Analytics        = lazy(() => import('./pages/Admin/Analytics'))

function ProtectedRoute({ children }) {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Static routes first - must be before dynamic ones */}
            <Route path="/"                   element={<Home />} />
            <Route path="/login"              element={<Login />} />
            <Route path="/search"             element={<Search />} />
            <Route path="/property/:slugId"   element={<PropertyDetail />} />
            <Route path="/list-property"      element={<ProtectedRoute><ListProperty /></ProtectedRoute>} />
            <Route path="/edit-property/:id"  element={<ProtectedRoute><ListProperty /></ProtectedRoute>} />
            <Route path="/payment/:id"        element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/dashboard"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin"              element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/listings"     element={<AdminRoute><ManageListings /></AdminRoute>} />
            <Route path="/admin/analytics"    element={<AdminRoute><Analytics /></AdminRoute>} />

            {/* SEO Location Routes - must be LAST */}
            <Route path="/:locationSlug"               element={<LocationPage />} />
            <Route path="/:locationSlug/:propertyType" element={<LocationTypePage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
