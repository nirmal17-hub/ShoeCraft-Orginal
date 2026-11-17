
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Footprints
} from 'lucide-react'

function Register() {
  const navigate = useNavigate()
  const API_URL = import.meta.env.VITE_API_URL
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)


  async function registration(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.')
      }

      const database = await fetch(`${API_URL}/users`)

      if (!database.ok) {
        throw new Error('Could not connect to the server.')
      }

      const users = await database.json()

      const existingUser = users.find(
        (item) =>
          item.email.toLowerCase() === email.trim().toLowerCase()
      )

      if (existingUser) {
        throw new Error(
          'This email is already registered. Please login.'
        )
      }

      const response = await fetch(`http://localhost:3000/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password,
          role: 'user'
        })
      })

      if (!response.ok) {
        throw new Error('Unable to create your account.')
      }

      await response.json()

      alert('Account created successfully!')
      navigate('/login')

    } catch (error) {
      setError(
        error.message || 'Unable to connect to the server. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#111111] flex items-center justify-center p-2 md:p-4">

      <div className="w-full max-w-[1500px] h-full max-h-[850px] bg-white rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2">

        {/* LEFT SIDE - BRANDING */}
        <div className="relative bg-[#171717] text-white flex flex-col justify-between p-6 md:p-10 lg:p-12 xl:p-16 overflow-hidden min-h-0">

          {/* Background Decorations */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-white/10" />
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-amber-600/10 blur-3xl rounded-full" />

          {/* Brand */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center">
                <Footprints size={25} className="text-black" />
              </div>

              <span className="text-2xl font-black tracking-[3px]">
                SHOE<span className="text-amber-500">CRAFT</span>
              </span>
            </Link>
          </div>

          {/* Main Branding */}
          <div className="relative z-10 py-5">

            <p className="text-amber-500 text-xs font-bold tracking-[5px] uppercase mb-5">
              Join Our Community
            </p>

            <h1 className="text-4xl md:text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight">
              YOUR STYLE.
              <br />
              YOUR <span className="text-amber-500">STORY.</span>
              <br />
              YOUR STEP.
            </h1>

            <p className="text-gray-400 mt-6 max-w-md text-sm leading-7">
              Create your ShoeCraft account and explore
              footwear designed for comfort, confidence
              and individuality. Your perfect pair starts here.
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-3 mt-8">

              <div className="border border-white/10 bg-white/5 rounded-full px-4 py-2.5 flex items-center gap-2">
                <ShoppingBag size={16} className="text-amber-500" />
                <span className="text-xs font-semibold text-gray-300">
                  Exclusive Collection
                </span>
              </div>

              <div className="border border-white/10 bg-white/5 rounded-full px-4 py-2.5 flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-500" />
                <span className="text-xs font-semibold text-gray-300">
                  Secure Shopping
                </span>
              </div>

            </div>

          </div>

          {/* Bottom */}
          <div className="relative z-10 flex justify-between items-center border-t border-white/10 pt-5">

            <p className="text-xs text-gray-500 tracking-wider">
              WALK YOUR WAY.
            </p>

            <p className="text-xs text-gray-500">
              EST. SHOECRAFT
            </p>

          </div>

        </div>

        {/* RIGHT SIDE - REGISTER */}
        <div className="bg-[#faf9f6] flex items-center justify-center px-5 py-4 md:px-10 lg:px-12 xl:px-16 min-h-0 overflow-hidden">

          <div className="w-full max-w-md">

            {/* Heading */}
            <div className="mb-5">

              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <ShoppingBag size={23} className="text-amber-800" />
              </div>

              <p className="text-xs font-bold tracking-[3px] text-amber-700 uppercase mb-2">
                Start Your Journey
              </p>

              <h2 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">
                SIGN UP<span className="text-amber-600">.</span>
              </h2>

              <p className="text-gray-500 mt-2 text-sm leading-5">
                Create your account and discover your
                next favourite pair with ShoeCraft.
              </p>

            </div>

            {/* Form */}
            <form onSubmit={registration} className="space-y-3">

              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 text-sm outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 text-sm outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    minLength={4}
                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 pr-14 text-sm outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-700 transition"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>

                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  Confirm Password
                </label>

                <div className="relative">

                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    minLength={4}
                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 pr-14 text-sm outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-700 transition"
                  >
                    {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>

                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  <p className="text-sm text-red-600">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-950 text-white rounded-xl py-3.5 px-6 font-bold text-sm flex items-center justify-center gap-3 hover:bg-amber-800 transition duration-300 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Your Account
                    <ArrowRight size={19} />
                  </>
                )}
              </button>

            </form>

            {/* Login Link */}
            <div className="mt-5 text-center">

              <p className="text-sm text-gray-500">
                Already have an account?

                <Link
                  to="/login"
                  className="font-bold text-neutral-900 hover:text-amber-700 ml-2 transition"
                >
                  Sign In
                </Link>
              </p>

            </div>

            {/* Bottom */}
            <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-center gap-2">

              <ShieldCheck size={16} className="text-amber-700" />

              <p className="text-xs text-gray-400">
                Your shopping journey starts here.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Register
