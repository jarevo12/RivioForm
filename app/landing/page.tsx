'use client'

import { useRouter } from 'next/navigation'

export default function SurveyWelcome() {
  const router = useRouter()

  const handleStart = () => {
    // Store survey start time
    sessionStorage.setItem('surveyStartTime', Date.now().toString())
    router.push('/application')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:ring-4 focus:ring-blue-400"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Help Us Understand B2B Credit Risk Management
          </h1>
        </div>
      </header>

      <main id="main-content">
        {/* Introduction Section */}
        <section className="container mx-auto px-6 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-800 rounded-2xl p-8 md:p-10 shadow-2xl border border-slate-700 mb-8">
              <p className="text-lg text-slate-300 leading-relaxed mb-6">
                Most B2B companies face payment defaults that cost billions in bad debt annually.
                We're researching how businesses protect themselves from this risk—and where current
                solutions fall short.
              </p>

              <div className="bg-slate-900 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Your contribution (5 minutes):</h2>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-3">⏱️</span>
                    <span><strong>Quick:</strong> 16-20 questions based on your responses</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-3">🔒</span>
                    <span><strong>Anonymous & confidential</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-3">📊</span>
                    <span><strong>Option to receive</strong> personalized insights at the end</span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-slate-700 pt-6">
                <h2 className="text-xl font-semibold text-white mb-4">What you can receive:</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="text-green-400 mr-3 mt-1">✓</span>
                    <div>
                      <h3 className="font-semibold text-white">Personalized Benchmark Report</h3>
                      <p className="text-slate-400 text-sm">
                        See how your credit practices compare to peers in your industry and size
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-400 mr-3 mt-1">✓</span>
                    <div>
                      <h3 className="font-semibold text-white">Early Access to Research</h3>
                      <p className="text-slate-400 text-sm">
                        Full findings before public release
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-400 mr-3 mt-1">✓</span>
                    <div>
                      <h3 className="font-semibold text-white">Free Expert Consultation</h3>
                      <p className="text-slate-400 text-sm">
                        Optional 15-min session to discuss your specific situation (no sales pitch)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={handleStart}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-12 rounded-lg transition duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 text-lg"
              >
                START SURVEY
              </button>
              <p className="text-sm text-slate-400 mt-4">
                Takes approximately 5 minutes to complete
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-slate-700 mt-12">
        <div className="text-center text-slate-400">
          <p className="mb-2">© 2025 Rivio. All rights reserved.</p>
          <p className="text-sm">Your responses are anonymous and confidential.</p>
        </div>
      </footer>
    </div>
  )
}
