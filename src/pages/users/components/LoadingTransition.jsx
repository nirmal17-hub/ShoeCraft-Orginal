
import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Footprints, Sparkles, ShieldCheck } from 'lucide-react'

function LoadingTransition() {
  const location = useLocation()

  const [loading, setLoading] = useState(false)
  const firstLoad = useRef(true)

  const transitionPages = [
    '/collections',
    '/cart',
    '/payment',
    '/',
    '/category',
    '/about',
    '/contact'
  ]

  const authPages = [
    '/login',
    '/register'
  ]

  const isAuthPage =
    authPages.includes(location.pathname) ||
    (
      location.pathname === '/' &&
      location.state?.authTransition === true
    )

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false
      return
    }

    const currentPath = location.pathname

    const isAuth =
      authPages.includes(currentPath) ||
      (
        currentPath === '/' &&
        location.state?.authTransition === true
      )

    const shouldShow = isAuth ||
      transitionPages.some(path => currentPath === path) ||
      currentPath.startsWith('/product/')

    if (!shouldShow) {
      setLoading(false)
      return
    }

    setLoading(true)

    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)

  }, [location.key])

  if (!loading) return null

  // FULL SCREEN AUTH LOADER
  if (isAuthPage) {
    const isLogout = location.state?.authAction === 'logout'

    return (
      <div className="fixed inset-0 z-[99999] bg-[#111111] flex items-center justify-center overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute top-0 left-0 w-full h-full opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        />
        <div className="relative flex flex-col items-center text-center px-6">
          <div className="relative w-36 h-36 flex items-center justify-center mb-10">
            <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-3 rounded-full border-2 border-dashed border-amber-500/50 animate-[spin_2s_linear_infinite_reverse]" />
            <div className="absolute w-24 h-24 rounded-full bg-amber-500/20 blur-2xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow-2xl shadow-amber-600/30 animate-[bounce_1s_infinite]">
              <Footprints
                size={43}
                strokeWidth={1.5}
                className="text-black"
              />
            </div>
            <Sparkles
              size={20}
              className="absolute top-1 right-1 text-amber-400 animate-pulse"
            />
            <div className="absolute bottom-2 left-0 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-[0.35em] text-white">
            SHOE<span className="text-amber-500">CRAFT</span>
          </h1>
          <p className="text-amber-500 text-xs font-bold tracking-[0.4em] mt-5 uppercase">
            {isLogout
              ? 'SEE YOU AGAIN'
              : location.pathname === '/register'
                ? 'CREATING YOUR EXPERIENCE'
                : 'WELCOME BACK'}
          </p>
          <p className="text-gray-500 text-xs mt-3 tracking-widest">
            {isLogout
              ? 'THANK YOU FOR SHOPPING WITH US'
              : location.pathname === '/register'
                ? 'YOUR JOURNEY STARTS HERE'
                : 'GET READY TO STEP IN AGAIN'}
          </p>
          <div className="w-56 h-1 bg-white/10 rounded-full overflow-hidden mt-10">
            <div className="h-full w-full origin-left rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 animate-[loading_500ms_ease-in-out_forwards]" />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <ShieldCheck size={13} className="text-amber-600" />

            <p className="text-[10px] text-gray-500 tracking-[0.25em]">
              PREMIUM FOOTWEAR EXPERIENCE
            </p>
          </div>

        </div>
        <div className="absolute bottom-7 left-0 w-full text-center">
          <p className="text-[9px] text-gray-700 tracking-[0.4em]">
            WALK YOUR WAY.
          </p>
        </div>

        <style>{`
          @keyframes loading {
            0% {
              transform: scaleX(0);
            }
            100% {
              transform: scaleX(1);
            }
          }
        `}</style>

      </div>
    )
  }

  return (
    <div className="fixed inset-x-0 top-20 bottom-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#f8f7f3]/90 backdrop-blur-xl">
      <div className="absolute w-72 h-72 bg-amber-300/20 rounded-full blur-[100px] -top-20 -left-20" />
      <div className="absolute w-72 h-72 bg-orange-300/20 rounded-full blur-[100px] -bottom-20 -right-20" />
      <div className="relative flex flex-col items-center">
        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-full border border-amber-300/40 animate-spin" />
          <div className="absolute inset-3 rounded-full border-2 border-dashed border-amber-500/40 animate-[spin_5s_linear_infinite_reverse]" />
          <div className="absolute w-20 h-20 bg-amber-400/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-20 h-20 bg-white rounded-3xl shadow-xl shadow-amber-900/10 flex items-center justify-center animate-bounce">
            <Footprints
              size={42}
              strokeWidth={1.5}
              className="text-amber-600"
            />
          </div>
          <Sparkles
            size={19}
            className="absolute top-0 right-0 text-amber-500 animate-pulse"
          />
        </div>
        <h1 className="text-3xl font-black tracking-[0.3em] text-gray-900">
          SHOE<span className="text-amber-600">CRAFT</span>
        </h1>
        <p className="mt-3 text-xs font-semibold tracking-[0.25em] text-gray-400 uppercase">
          PREPARING YOUR EXPERIENCE
        </p>
        <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-9">
          <div className="h-full w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 rounded-full origin-left animate-[loading_500ms_ease-in-out_forwards]" />
        </div>
        <p className="mt-4 text-[10px] tracking-widest text-gray-400 font-medium">
          STEP INTO SOMETHING NEW
        </p>
      </div>
      <style>{`
        @keyframes loading {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  )
}

export default LoadingTransition
