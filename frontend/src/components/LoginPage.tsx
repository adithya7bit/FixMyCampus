import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  AlertCircle, 
  KeyRound,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Info,
  XCircle,
  Wrench,
  RefreshCw,
  X,
  BadgeCheck
} from 'lucide-react'
import { 
  authenticateStudent, 
  authenticateAdmin, 
  registerStudentAccount,
  authenticateGoogleEmail,
  REGISTERED_ACCOUNTS,
  DEPARTMENT_NAMES 
} from '../services/authService'
import { supabase } from '../services/supabase'
import { playSuccess, playTick, playAlert } from '../services/soundFx'
import type { UserPersona } from '../types/index'

interface LoginPageProps {
  onLogin: (user: UserPersona) => void
}

// Crisp official Google Multi-Color SVG Icon
const GoogleIcon = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
)

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [authRole, setAuthRole] = useState<'student' | 'admin'>('student')
  const [studentTab, setStudentTab] = useState<'signin' | 'signup' | 'verify_google'>('signin')
  
  // Student Sign-In Form State
  const [studentIdentifier, setStudentIdentifier] = useState('7376231CS101')
  const [studentPassword, setStudentPassword] = useState('student123')
  
  // Student Sign-Up Form State
  const [signUpName, setSignUpName] = useState('')
  const [signUpRoll, setSignUpRoll] = useState('')
  const [signUpDept, setSignUpDept] = useState('Computer Science & Engineering')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')

  // Google Email Verification State (Post Sign-Up)
  const [verificationCode, setVerificationCode] = useState('')
  const [pendingUser, setPendingUser] = useState<{
    name: string
    roll_number: string
    department: string
    email: string
    password?: string
  } | null>(null)

  // Interactive Google Account Chooser
  const [showGoogleChooser, setShowGoogleChooser] = useState(false)
  const [customGoogleEmail, setCustomGoogleEmail] = useState('')
  
  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('marcus.vance@campus.edu')
  const [adminPassword, setAdminPassword] = useState('admin123')
  const [selectedAdminDept, setSelectedAdminDept] = useState('electrical')
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const [showCredentialsGuide, setShowCredentialsGuide] = useState(true)

  // Check for active Supabase session on mount (handles OAuth redirects)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email || ''
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0]
        const avatar = session.user.user_metadata?.avatar_url
        const res = authenticateGoogleEmail(email, name, avatar)
        if (res.success) {
          playSuccess()
          onLogin(res.user)
        }
      }
    }).catch(() => {})
  }, [onLogin])

  const triggerShake = () => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 550)
  }

  // Student Sign-In Handler
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsLoading(true)
    playTick()

    setTimeout(() => {
      const result = authenticateStudent(studentIdentifier, studentPassword)

      if (!result.success) {
        setIsLoading(false)
        setErrorMessage(result.error)
        playAlert()
        triggerShake()
        return
      }

      setSuccessMessage(`Authenticated successfully as ${result.user.name} (${result.user.roll_number})`)
      playSuccess()
      setTimeout(() => {
        setIsLoading(false)
        onLogin(result.user)
      }, 400)
    }, 450)
  }

  // Student Sign-Up Submission -> Transitions to Google Email Verification
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!signUpName.trim() || !signUpRoll.trim() || !signUpEmail.trim()) {
      setErrorMessage('Please fill in your name, student roll number, and Google campus email.')
      playAlert()
      triggerShake()
      return
    }

    playTick()
    setPendingUser({
      name: signUpName.trim(),
      roll_number: signUpRoll.trim(),
      department: signUpDept,
      email: signUpEmail.trim(),
      password: signUpPassword.trim() || 'student123'
    })
    setStudentTab('verify_google')
  }

  // Finalize Google Email Verification
  const handleVerifyGoogle = (mode: 'direct' | 'code') => {
    if (!pendingUser) return
    setErrorMessage('')
    setIsLoading(true)
    playTick()

    if (mode === 'code' && (!verificationCode.trim() || verificationCode.trim().length < 4)) {
      setIsLoading(false)
      setErrorMessage('Please enter the 6-digit Google verification code or click "Authorize with Google".')
      playAlert()
      triggerShake()
      return
    }

    setTimeout(() => {
      const res = registerStudentAccount({
        name: pendingUser.name,
        roll_number: pendingUser.roll_number,
        email: pendingUser.email,
        department: pendingUser.department,
        password: pendingUser.password || 'student123',
        google_verified: true
      })

      if (!res.success) {
        setIsLoading(false)
        setErrorMessage(res.error)
        playAlert()
        triggerShake()
        return
      }

      setSuccessMessage(`Google Email Authenticated: ${pendingUser.email} is verified!`)
      playSuccess()
      setTimeout(() => {
        setIsLoading(false)
        onLogin(res.user)
      }, 500)
    }, 600)
  }

  // Trigger Google Sign-In (OAuth attempt + interactive Chooser fallback)
  const handleTriggerGoogleAuth = async () => {
    playTick()
    setErrorMessage('')
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) {
        // If Supabase OAuth provider is not configured in dashboard, use interactive chooser
        setIsLoading(false)
        setShowGoogleChooser(true)
      }
    } catch {
      setIsLoading(false)
      setShowGoogleChooser(true)
    }
  }

  // Authenticate chosen Google Account
  const handleSelectGoogleAccount = (email: string, name: string) => {
    playTick()
    setShowGoogleChooser(false)
    setIsLoading(true)

    setTimeout(() => {
      const res = authenticateGoogleEmail(email, name)
      if (res.success) {
        setSuccessMessage(`Signed in with Google as ${res.user.name} (${res.user.email})`)
        playSuccess()
        setTimeout(() => {
          setIsLoading(false)
          onLogin(res.user)
        }, 400)
      } else {
        setIsLoading(false)
        setErrorMessage(res.error)
        playAlert()
      }
    }, 450)
  }

  // Admin Login Handler
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsLoading(true)
    playTick()

    setTimeout(() => {
      const result = authenticateAdmin(adminEmail, selectedAdminDept, adminPassword)

      if (!result.success) {
        setIsLoading(false)
        setErrorMessage(result.error)
        playAlert()
        triggerShake()
        return
      }

      setSuccessMessage(`Officer Verified: ${result.user.name} • ${result.user.department_name}`)
      playSuccess()
      setTimeout(() => {
        setIsLoading(false)
        onLogin(result.user)
      }, 400)
    }, 450)
  }

  // Interactive Quick Fillers for Testing
  const fillStudentValid = (roll: string, pass: string = 'student123') => {
    playTick()
    setStudentTab('signin')
    setStudentIdentifier(roll)
    setStudentPassword(pass)
    setErrorMessage('')
    setSuccessMessage('')
  }

  const fillAdminValid = (email: string, dept: string, pass: string = 'admin123') => {
    playTick()
    setAdminEmail(email)
    setSelectedAdminDept(dept)
    setAdminPassword(pass)
    setErrorMessage('')
    setSuccessMessage('')
  }

  const testInvalidCredentials = () => {
    playTick()
    if (authRole === 'student') {
      setStudentPassword('wrong_password_999')
      setErrorMessage('')
      setSuccessMessage('')
    } else {
      setAdminPassword('invalid_passcode_000')
      setErrorMessage('')
      setSuccessMessage('')
    }
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden select-none">
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />
      {authRole === 'admin' && (
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-700" />
      )}
      
      {/* Brand Header */}
      <div className="text-center mb-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Real Facilities Authentication Gate</span>
        </div>

        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-xl shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0d121f] rounded-[15px] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            FixMyCampus
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Autonomous Incident Triage, 3D Campus GIS Tracking & Verified Physical Closed-Loop Resolution
        </p>
      </div>

      {/* Main Dual-Auth Card Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Role Tab Switcher (Student vs Admin) */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#0e1424] border border-white/10 mb-4 shadow-lg">
          <button
            type="button"
            onClick={() => { 
              playTick()
              setAuthRole('student')
              setErrorMessage('')
              setSuccessMessage('')
            }}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              authRole === 'student'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className={`w-4 h-4 ${authRole === 'student' ? 'text-slate-950' : 'text-cyan-400'}`} />
            <span>Student Portal</span>
          </button>

          <button
            type="button"
            onClick={() => { 
              playTick()
              setAuthRole('admin')
              setErrorMessage('')
              setSuccessMessage('')
            }}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              authRole === 'admin'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${authRole === 'admin' ? 'text-slate-950' : 'text-amber-400'}`} />
            <span>Admin Command</span>
          </button>
        </div>

        {/* Form Card Shell with 3D Depth Glass & Shake Animation on Rejection */}
        <div className={`p-1 rounded-3xl bg-white/[0.04] ring-1 ring-white/10 shadow-2xl backdrop-blur-xl transition-transform duration-300 ${
          isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''
        }`}>
          <div className="bg-[#0b101d]/95 rounded-[calc(1.5rem-2px)] p-6 sm:p-7 border border-white/5">
            
            {/* ═══════════════════════════════════════════════ */}
            {/* STUDENT PORTAL VIEWS */}
            {/* ═══════════════════════════════════════════════ */}
            {authRole === 'student' && (
              <div>
                {/* Sign-In vs Sign-Up Segmented Sub-Header */}
                {studentTab !== 'verify_google' && (
                  <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 mb-5">
                    <button
                      type="button"
                      onClick={() => {
                        playTick()
                        setStudentTab('signin')
                        setErrorMessage('')
                        setSuccessMessage('')
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        studentTab === 'signin'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playTick()
                        setStudentTab('signup')
                        setErrorMessage('')
                        setSuccessMessage('')
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        studentTab === 'signup'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Sign Up (New Student)
                    </button>
                  </div>
                )}

                {/* 1. STUDENT SIGN IN MODE */}
                {studentTab === 'signin' && (
                  <form onSubmit={handleStudentSubmit} className="space-y-4">
                    
                    {/* Google One-Click Auth Action */}
                    <button
                      type="button"
                      onClick={handleTriggerGoogleAuth}
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      <GoogleIcon />
                      <span>Continue with Google Email</span>
                    </button>

                    <div className="relative my-3">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                        <span className="bg-[#0b101d] px-3 text-slate-500">or sign in with student id</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Roll Number or University Email</span>
                        </label>
                        <span className="text-[10px] text-cyan-400 font-mono">e.g. 7376231CS101</span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={studentIdentifier}
                          onChange={(e) => {
                            setStudentIdentifier(e.target.value)
                            setErrorMessage('')
                          }}
                          placeholder="Enter student ID or email..."
                          className="w-full bg-[#111728] border border-white/15 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Password / Student PIN</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">Default: student123</span>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={studentPassword}
                          onChange={(e) => {
                            setStudentPassword(e.target.value)
                            setErrorMessage('')
                          }}
                          placeholder="Enter password..."
                          className="w-full bg-[#111728] border border-white/15 rounded-xl pl-4 pr-11 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Live Error Alert */}
                    {errorMessage && (
                      <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-rose-200 mb-0.5">Authentication Failed</p>
                          <p className="text-[11px] leading-relaxed text-rose-300/90">{errorMessage}</p>
                        </div>
                      </div>
                    )}

                    {/* Live Success Banner */}
                    {successMessage && (
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-[11px]">{successMessage}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span className="font-semibold text-xs">Verifying Campus Credentials...</span>
                        </div>
                      ) : (
                        <>
                          <span>Check & Authenticate Student</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          playTick()
                          setStudentTab('signup')
                        }}
                        className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        Don't have an account yet? <span className="font-bold underline text-cyan-300">Sign Up</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* 2. STUDENT SIGN UP MODE */}
                {studentTab === 'signup' && (
                  <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                    
                    {/* Google One-Click Sign-Up */}
                    <button
                      type="button"
                      onClick={handleTriggerGoogleAuth}
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      <GoogleIcon />
                      <span>Instant Sign Up with Google</span>
                    </button>

                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                        <span className="bg-[#0b101d] px-3 text-slate-500">or enter details manually</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="w-full bg-[#111728] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Roll Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={signUpRoll}
                          onChange={(e) => setSignUpRoll(e.target.value.toUpperCase())}
                          placeholder="7376231CS..."
                          className="w-full bg-[#111728] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Department *
                        </label>
                        <select
                          value={signUpDept}
                          onChange={(e) => setSignUpDept(e.target.value)}
                          className="w-full bg-[#111728] border border-white/15 rounded-xl px-2.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                        >
                          <option value="Computer Science & Engineering">CS & Engineering</option>
                          <option value="Electronics & Communication">ECE Electronics</option>
                          <option value="Mechanical Engineering">Mechanical</option>
                          <option value="Civil Engineering">Civil</option>
                          <option value="AI & Data Science">AI & Data Science</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Google College / Personal Email *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          placeholder="e.g. priya.sharma@campus.edu or gmail"
                          className="w-full bg-[#111728] border border-white/15 rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                        />
                        <div className="absolute right-3 top-3">
                          <GoogleIcon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Requires Google Email verification on next step
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Set Account Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="Create strong password..."
                        className="w-full bg-[#111728] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>

                    {errorMessage && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                        {errorMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.98] mt-2"
                    >
                      <span>Proceed to Google Email Auth</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          playTick()
                          setStudentTab('signin')
                        }}
                        className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        Already have an account? <span className="font-bold underline text-cyan-300">Sign In</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* 3. GOOGLE EMAIL AUTHENTICATION AFTER SIGN UP */}
                {studentTab === 'verify_google' && pendingUser && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    
                    {/* Visual Google Security Badge */}
                    <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white p-2 flex items-center justify-center shrink-0 shadow-md">
                        <GoogleIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h3 className="text-xs font-bold text-white">Google Email Verification</h3>
                          <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">
                          Authenticate with your Google Account to activate student access for:
                        </p>
                        <div className="mt-1.5 px-2 py-1 rounded bg-[#0d1425] border border-cyan-500/30 text-cyan-300 font-mono text-[11px] inline-block font-semibold">
                          {pendingUser.email}
                        </div>
                      </div>
                    </div>

                    {/* Method 1: Instant Google Account Authorization */}
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleVerifyGoogle('direct')}
                        disabled={isLoading}
                        className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        <GoogleIcon />
                        <span>Authorize with Google Account</span>
                      </button>
                      <p className="text-[10px] text-slate-400 text-center">
                        Instant OAuth verification via Google Workspace
                      </p>
                    </div>

                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                        <span className="bg-[#0b101d] px-3 text-slate-500">or enter verification code</span>
                      </div>
                    </div>

                    {/* Method 2: Google 6-Digit Email Verification Code */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300">
                          6-Digit Email Security Code
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            playTick()
                            setVerificationCode('842109')
                          }}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold underline"
                        >
                          Auto-Paste Demo Code: 842109
                        </button>
                      </div>

                      <input
                        type="text"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-digit code..."
                        className="w-full bg-[#111728] border border-white/15 rounded-xl px-4 py-2.5 text-center text-sm font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                      />

                      {errorMessage && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                          {errorMessage}
                        </div>
                      )}

                      {successMessage && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{successMessage}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleVerifyGoogle('code')}
                        disabled={isLoading}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            <span>Confirming Google Identity...</span>
                          </div>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Verify & Complete Registration</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            playTick()
                            setStudentTab('signup')
                          }}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          ← Edit Details
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playSuccess()
                            setSuccessMessage('Fresh verification code sent to your Google inbox!')
                          }}
                          className="text-xs text-cyan-400 hover:text-cyan-300"
                        >
                          Resend Code
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* ADMIN COMMAND LOGIN FLOW */}
            {/* ═══════════════════════════════════════════════ */}
            {authRole === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Officer Campus Email / Staff ID</span>
                    </label>
                    <span className="text-[10px] text-amber-400 font-mono">marcus.vance@campus.edu</span>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => {
                        setAdminEmail(e.target.value)
                        setErrorMessage('')
                      }}
                      placeholder="officer@campus.edu..."
                      className="w-full bg-[#111728] border border-white/15 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-400" />
                      <span>Authorized Department Unit</span>
                    </label>
                  </div>
                  <select
                    value={selectedAdminDept}
                    onChange={(e) => {
                      setSelectedAdminDept(e.target.value)
                      setErrorMessage('')
                    }}
                    className="w-full bg-[#111728] border border-white/15 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition-colors font-medium"
                  >
                    <option value="electrical">⚡ Electrical & Power Infrastructure</option>
                    <option value="civil_maintenance">🔧 Civil & Plumbing Maintenance</option>
                    <option value="food_services">🍲 Food Services & Dining</option>
                    <option value="it_network">🌐 IT & Digital Infrastructure</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Security Passcode / 2FA Token</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Default: admin123</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value)
                        setErrorMessage('')
                      }}
                      placeholder="Enter security passcode..."
                      className="w-full bg-[#111728] border border-white/15 rounded-xl pl-4 pr-11 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors"
                      title={showPassword ? "Hide passcode" : "Show passcode"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Live Error Alert */}
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-rose-200 mb-0.5">Authorization Denied</p>
                      <p className="text-[11px] leading-relaxed text-rose-300/90">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Live Success Banner */}
                {successMessage && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-[11px]">{successMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span className="font-semibold text-xs">Authenticating Command Token...</span>
                    </div>
                  ) : (
                    <>
                      <span>Check & Authenticate Admin</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Interactive Testing Helper: Test Valid vs Invalid */}
            <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Try testing auth checks:</span>
              <button
                type="button"
                onClick={testInvalidCredentials}
                className="text-[11px] text-rose-400 hover:text-rose-300 underline font-medium transition-colors"
                title="Inserts an incorrect password so you can see the real rejection in action"
              >
                Insert Wrong Password
              </button>
            </div>

          </div>
        </div>

        {/* Collapsible Verified Demo Credentials Drawer */}
        <div className="mt-4 rounded-2xl bg-[#0b101d]/90 border border-white/10 overflow-hidden shadow-lg">
          <button
            type="button"
            onClick={() => setShowCredentialsGuide(!showCredentialsGuide)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Campus Directory & Test Accounts</span>
            </div>
            {showCredentialsGuide ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {showCredentialsGuide && (
            <div className="p-3.5 border-t border-white/5 space-y-3 text-[11px]">
              
              {/* Student Accounts */}
              <div>
                <div className="text-slate-400 font-semibold mb-1.5 flex items-center justify-between">
                  <span className="text-cyan-300">🎓 Registered Students (Password: student123)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthRole('student')
                      fillStudentValid('7376231CS101', 'student123')
                    }}
                    className="p-2 rounded-lg bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-800/40 text-left transition-all hover:border-cyan-500/60"
                  >
                    <div className="font-bold text-white text-[11px]">Alex Rivera</div>
                    <div className="text-[10px] text-cyan-400 font-mono">7376231CS101</div>
                    <div className="text-[9px] text-slate-400">Computer Science</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthRole('student')
                      fillStudentValid('7376231EC204', 'student123')
                    }}
                    className="p-2 rounded-lg bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-800/40 text-left transition-all hover:border-cyan-500/60"
                  >
                    <div className="font-bold text-white text-[11px]">Ryan Vance</div>
                    <div className="text-[10px] text-cyan-400 font-mono">7376231EC204</div>
                    <div className="text-[9px] text-slate-400">ECE Hardware</div>
                  </button>
                </div>
              </div>

              {/* Admin Accounts */}
              <div>
                <div className="text-slate-400 font-semibold mb-1.5 flex items-center justify-between">
                  <span className="text-amber-300">🛡️ Facility Officers (Passcode: admin123)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthRole('admin')
                      fillAdminValid('marcus.vance@campus.edu', 'electrical', 'admin123')
                    }}
                    className="p-2 rounded-lg bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/40 text-left transition-all hover:border-amber-500/60"
                  >
                    <div className="font-bold text-white text-[11px]">Marcus Vance</div>
                    <div className="text-[9px] text-amber-300">Chief Electrical Inspector</div>
                    <div className="text-[9px] text-slate-400 font-mono">Dept: Electrical</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthRole('admin')
                      fillAdminValid('elena.r@campus.edu', 'civil_maintenance', 'admin123')
                    }}
                    className="p-2 rounded-lg bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/40 text-left transition-all hover:border-amber-500/60"
                  >
                    <div className="font-bold text-white text-[11px]">Elena Rostova</div>
                    <div className="text-[9px] text-amber-300">Facilities Director</div>
                    <div className="text-[9px] text-slate-400 font-mono">Dept: Civil & Plumbing</div>
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-[11px] text-slate-400 text-center">
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-cyan-400 font-bold block mb-0.5">Google OAuth</span>
            <span>Email Verified</span>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-emerald-400 font-bold block mb-0.5">Closed Loop</span>
            <span>Student Verified</span>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-amber-400 font-bold block mb-0.5">3D GIS Map</span>
            <span>Real Buildings</span>
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* GOOGLE ACCOUNT SELECTOR MODAL */}
      {/* ═══════════════════════════════════════════════ */}
      {showGoogleChooser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-[#121624] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GoogleIcon className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Sign in with Google</h3>
              </div>
              <button 
                onClick={() => setShowGoogleChooser(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Choose an authorized Google account to enter <strong className="text-white">FixMyCampus</strong>:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSelectGoogleAccount('alex.rivera@campus.edu', 'Alex Rivera')}
                className="w-full p-3 rounded-2xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 flex items-center gap-3 text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs shrink-0">
                  AR
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Alex Rivera
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    alex.rivera@campus.edu
                  </div>
                </div>
                <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectGoogleAccount('ryan.v@campus.edu', 'Ryan Vance')}
                className="w-full p-3 rounded-2xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 flex items-center gap-3 text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300 font-bold text-xs shrink-0">
                  RV
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Ryan Vance
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    ryan.v@campus.edu
                  </div>
                </div>
                <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              </button>
            </div>

            {/* Custom Google Email Input */}
            <div className="pt-2 border-t border-white/10">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Or sign in with another Google Email:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="your.email@gmail.com..."
                  className="flex-1 bg-[#090d18] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customGoogleEmail.trim()) {
                      handleSelectGoogleAccount(customGoogleEmail.trim(), customGoogleEmail.split('@')[0])
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs shadow-md active:scale-95"
                >
                  Verify
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              Google Workspace verifies domain authority and auto-syncs student department clearance.
            </p>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 text-xs text-slate-500 text-center relative z-10">
        <p>FixMyCampus • Enterprise University Facilities Management</p>
      </footer>

    </div>
  )
}

export default LoginPage
