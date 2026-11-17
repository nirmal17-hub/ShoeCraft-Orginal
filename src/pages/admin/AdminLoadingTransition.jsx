
import React, { useEffect, useState } from 'react'
import { DB } from './components/Header'
import { useLocation } from 'react-router-dom'
import {
  Footprints,
  ShieldCheck,
  Database,
  LockKeyhole,
  Activity
} from 'lucide-react'

function AdminLoadingTransition() {
  const location = useLocation()
  const [loadingType, setLoadingType] = useState(null)

  const adminPages = [
    '/dashboard',
    '/add-products',
    '/view-products',
    '/view-orders',
    '/admin/orders',
    '/view-customers',
    '/add-notifications',
    '/stock-management',
    '/stock-history',
    '/reports',
  ]

  useEffect(() => {
    let timer

    const isAdminLogout =
      location.pathname === '/login' &&
      location.state?.adminTransition === true &&
      location.state?.authAction === 'logout'

    const isAdminLogin =
      location.pathname === '/dashboard' &&
      location.state?.adminLogin === true

    const isAdminPage = adminPages.includes(location.pathname)

    if (isAdminLogout || isAdminLogin) {
      setLoadingType('fullscreen')
    } else if (isAdminPage) {
      setLoadingType('content')
    } else {
      setLoadingType(null)
      return
    }

    timer = setTimeout(() => {
      setLoadingType(null)
    }, 700)

    return () => clearTimeout(timer)
  }, [location.key])

  if (!loadingType) return null

  // FULL-SCREEN BLUE LOADER: ADMIN LOGIN AND LOGOUT
  if (loadingType === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#071426]">
        <div className="absolute h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-[110px]" />

        <div className="relative flex flex-col items-center">
          <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-blue-400/30 border-t-blue-400" />
            <div className="absolute inset-3 animate-[spin_4s_linear_infinite_reverse] rounded-full border border-cyan-300/40" />
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 shadow-lg shadow-blue-500/20">
              <ShieldCheck size={36} className="text-cyan-300" />
            </div>
          </div>

          <h1 className="text-3xl font-black tracking-[0.3em] text-white">
            SHOE<span className="text-blue-400">CRAFT</span>
          </h1>

          <p className="mt-3 text-[10px] font-bold tracking-[0.4em] text-blue-300">
            ADMIN WORKSPACE
          </p>

          <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-full origin-left animate-[adminLoading_700ms_ease-in-out_forwards] bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500" />
          </div>

          <p className="mt-4 text-[9px] font-semibold tracking-[0.3em] text-blue-200/50">
            SECURELY PREPARING YOUR WORKSPACE
          </p>
        </div>

        <style>{`
          @keyframes adminLoading {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
          }
        `}</style>
      </div>
    )
  }

  // CONTENT LOADER: NORMAL ADMIN PAGE NAVIGATION
  return (
    <div className="fixed bottom-0 left-64 right-0 top-[76px] z-[40] flex items-center justify-center overflow-hidden bg-[#171717]/85 backdrop-blur-md">
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[100px]" />

      <div className="relative flex flex-col items-center">
        <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border border-amber-400/30 border-t-amber-400" />
          <div className="absolute inset-3 animate-[spin_3s_linear_infinite_reverse] rounded-full border border-dashed border-neutral-500/50" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 shadow-lg shadow-black/30">
            <Footprints size={30} className="text-amber-400" />
          </div>
        </div>

        <h2 className="text-xl font-black tracking-[0.25em] text-white">
          SHOE<span className="text-amber-400">CRAFT</span>
        </h2>

        <p className="mt-3 text-[9px] font-bold tracking-[0.35em] text-amber-400/80">
          ADMIN PANEL
        </p>

        <div className="mt-7 h-1 w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full origin-left animate-[adminLoading_700ms_ease-in-out_forwards] bg-gradient-to-r from-amber-500 to-orange-400" />
        </div>

        <p className="mt-4 text-[9px] font-semibold tracking-[0.25em] text-neutral-400">
          LOADING PAGE
        </p>
      </div>

      <style>{`
        @keyframes adminLoading {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  )
}

export default AdminLoadingTransition
