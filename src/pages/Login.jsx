import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Phone, ShieldCheck, Loader2 } from 'lucide-react'
import { authApi } from '../api/index'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [step, setStep]   = useState(1)
  const [phone, setPhone] = useState('')
  const [otp, setOtp]     = useState('')
  const [name, setName]   = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const sendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) { toast.error('Enter a valid 10-digit mobile number.'); return }
    setLoading(true)
    try {
      await authApi.sendOtp(phone)
      toast.success('OTP sent to your number.')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.')
    } finally { setLoading(false) }
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
    } finally { setLoading(false) }
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
              <input type="tel" maxLength={10} value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
                placeholder="10-digit mobile number" className="input-field pl-10" />
            </div>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name (optional)" className="input-field" />
            <button onClick={sendOtp} disabled={loading} className="btn-brand w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Send OTP
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input type="text" maxLength={6} value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                placeholder="6-digit OTP" className="input-field pl-10 tracking-widest text-lg font-mono" />
            </div>
            <button onClick={verifyOtp} disabled={loading} className="btn-brand w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Verify & Login
            </button>
            <button onClick={() => { setStep(1); setOtp('') }} className="w-full text-sm text-gray-400 hover:text-brand transition">
              ← Change number
            </button>
          </div>
        )}
        <p className="text-xs text-gray-400 text-center mt-6">
          By continuing, you agree to our <a href="/terms" className="text-brand">Terms</a> & <a href="/privacy" className="text-brand">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
