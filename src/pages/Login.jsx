import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Phone, ShieldCheck, Loader2, Lock } from 'lucide-react'
import { authApi } from '../api/index'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [step, setStep]           = useState(1)
  const [phone, setPhone]         = useState('')
  const [otp, setOtp]             = useState('')
  const [name, setName]           = useState('')
  const [password, setPassword]   = useState('')
  const [isAdmin, setIsAdmin]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [resending, setResending] = useState(false)
  const [timer, setTimer]         = useState(0)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const startTimer = () => {
    setTimer(30)
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(interval); return 0 }
        return t - 1
      })
    }, 1000)
  }

  const sendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Enter a valid 10-digit mobile number.')
      return
    }
    setLoading(true)
    try {
      const res = await authApi.sendOtp(phone)

      // Admin account — show password field
      if (res.is_admin) {
        setIsAdmin(true)
        setStep(2)
        toast('🛡️ Admin account detected — enter your password', {
          icon: '🔐', duration: 4000,
        })
        return
      }

      // Regular user — OTP sent
      setIsAdmin(false)
      setStep(2)
      startTimer()
      toast.success('OTP sent to +91-' + phone)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.')
    } finally { setLoading(false) }
  }

  const resendOtp = async () => {
    if (timer > 0) return
    setResending(true)
    try {
      await authApi.sendOtp(phone)
      toast.success('OTP resent to +91-' + phone)
      setOtp('')
      startTimer()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.')
    } finally { setResending(false) }
  }

  const verifyOtp = async () => {
    if (isAdmin) {
      if (!password.trim()) { toast.error('Enter your admin password.'); return }
    } else {
      if (otp.length !== 6) { toast.error('Enter the 6-digit OTP.'); return }
    }
    setLoading(true)
    try {
      const res = await authApi.verifyOtp({
        phone,
        code:     isAdmin ? password : otp,
        password: isAdmin ? password : undefined,
        name:     name || undefined,
      })
      setAuth(res.token, res.user)
      toast.success(isAdmin ? '👑 Admin logged in!' : 'Welcome to HyderabadZone!')
      navigate(res.user?.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="card p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <Link to="/" className="font-bold text-2xl text-brand">HyderabadZone</Link>
          <p className="text-gray-500 text-sm mt-1">
            {step === 1
              ? 'Enter your mobile number to continue'
              : isAdmin
                ? '🛡️ Admin Login — Enter your password'
                : `OTP sent to +91-${phone}`}
          </p>
        </div>

        {/* ── STEP 1: Phone Number ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="tel" maxLength={10} value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
                placeholder="10-digit mobile number"
                className="input-field pl-10"
                autoFocus />
            </div>
            <input
              type="text" value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendOtp()}
              placeholder="Your name (optional)"
              className="input-field" />
            <button
              onClick={sendOtp} disabled={loading}
              className="btn-brand w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Continue
            </button>
          </div>
        )}

        {/* ── STEP 2 (ADMIN): Password ── */}
        {step === 2 && isAdmin && (
          <div className="space-y-4">
            <div className="bg-brand/5 border border-brand/20 rounded-xl p-3 text-center text-sm text-brand">
              🛡️ Admin: +91-{phone}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                placeholder="Admin password"
                className="input-field pl-10"
                autoFocus />
            </div>
            <button
              onClick={verifyOtp} disabled={loading}
              className="btn-brand w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Login as Admin
            </button>
            <button
              onClick={() => { setStep(1); setPassword(''); setIsAdmin(false) }}
              className="w-full text-sm text-gray-400 hover:text-brand transition">
              ← Change number
            </button>
          </div>
        )}

        {/* ── STEP 2 (USER): OTP ── */}
        {step === 2 && !isAdmin && (
          <div className="space-y-4">
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text" maxLength={6} value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                placeholder="6-digit OTP"
                className="input-field pl-10 tracking-widest text-lg font-mono"
                autoFocus />
            </div>

            <button
              onClick={verifyOtp} disabled={loading}
              className="btn-brand w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Verify & Login
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-gray-400">
                  Resend OTP in <span className="text-brand font-medium">{timer}s</span>
                </p>
              ) : (
                <button
                  onClick={resendOtp} disabled={resending}
                  className="text-sm text-brand hover:underline flex items-center justify-center gap-1 mx-auto">
                  {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={() => { setStep(1); setOtp(''); setTimer(0); setIsAdmin(false) }}
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
