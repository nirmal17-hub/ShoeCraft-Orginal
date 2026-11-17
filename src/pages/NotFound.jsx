
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Footprints } from 'lucide-react'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#faf9f6] px-6 py-16">

      <div className="w-full max-w-2xl text-center">

        <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
          <Footprints size={32} className="text-amber-800" />
        </div>

        <p className="text-sm font-bold uppercase tracking-[0.3em] text-amber-700">
          ShoeCraft
        </p>

        <h1 className="mt-6 text-8xl md:text-9xl font-black tracking-tight text-neutral-900">
          404
        </h1>

        <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-amber-600" />

        <h2 className="mt-8 text-2xl md:text-3xl font-bold text-neutral-900">
          Page Not Found
        </h2>

        <p className="mx-auto mt-4 max-w-md leading-7 text-gray-500">
          Oops! The page you're looking for doesn't exist,
          may have been moved, or the URL might be incorrect.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-7 py-3 font-semibold text-neutral-800 transition hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <button
            onClick={() => navigate('/', {
              state: { authTransition: false }
            })}
            className="flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-7 py-3 font-semibold text-white transition hover:bg-amber-800"
          >
            <Home size={18} />
            Back To Home
          </button>

        </div>

      </div>

    </div>
  )
}

export default NotFound
