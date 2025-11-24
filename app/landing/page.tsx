'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'

export default function SurveyWelcome() {
  const router = useRouter()

  const handleStart = () => {
    // Store survey start time
    sessionStorage.setItem('surveyStartTime', Date.now().toString())
    router.push('/application')
  }

  // Add Enter key listener
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleStart()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F4D3D] via-[#2D6A4F] to-[#1F4D3D] relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-white focus:rounded-lg focus:ring-4 focus:ring-emerald-300"
      >
        Skip to main content
      </a>

      <main id="main-content" className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Animated entrance */}
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Help Build a Future Where Businesses<br />
                <span className="text-emerald-300">can confidently sell on terms</span>
              </h1>

              <p className="text-xl md:text-2xl text-emerald-100 mb-8 leading-relaxed max-w-3xl mx-auto">
                Share your insights to transform how businesses
                protect themselves from payment defaults.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <div className="flex items-center text-emerald-100">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Just 5 minutes</span>
                </div>
                <div className="flex items-center text-emerald-100">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">100% Anonymous</span>
                </div>
                <div className="flex items-center text-emerald-100">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Receive survey report</span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleStart}
                className="group relative inline-flex items-center justify-center px-12 py-5 text-xl font-bold text-[#1F4D3D] bg-white rounded-full overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-emerald-500/50 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/50"
              >
                <span className="relative z-10 flex items-center">
                  Start Survey
                  <svg className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </button>

              <p className="text-emerald-200 text-sm mt-4 font-medium">
                Press <kbd className="px-2 py-1 bg-white/10 rounded">Enter ↵</kbd> or click to begin
              </p>
            </div>
          </div>
        </section>

        {/* Who's Behind This Section */}
        <section className="container mx-auto px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-10">Who's Behind This</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Javier Serrano Card */}
              <a
                href="https://www.linkedin.com/in/javierserranogp/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-emerald-400">
                    <Image
                      src="/javier_serrano.jpg"
                      alt="Javier Serrano"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Javier Serrano</h3>
                    <p className="text-emerald-200 text-sm">MIT Sloan '27</p>
                  </div>
                </div>
              </a>

              {/* Sergio Sanchez Card */}
              <a
                href="https://www.linkedin.com/in/sergio-s%C3%A1nchez-g%C3%B3mez/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-emerald-400">
                    <Image
                      src="/sergio_sanchez.jpg"
                      alt="Sergio Sanchez"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Sergio Sanchez</h3>
                    <p className="text-emerald-200 text-sm">MIT Sloan '27</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 border-t border-white/10">
          <div className="text-center text-emerald-200">
            <p className="text-sm text-emerald-300">Your responses are anonymous and confidential.</p>
          </div>
        </footer>
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  )
}
