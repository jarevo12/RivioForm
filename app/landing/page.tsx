'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const router = useRouter()

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)

    // Show error immediately if user has started typing and email is invalid
    if (value.length > 0 && !validateEmail(value)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError('')
    }
  }

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address')
    }
  }

  const handleStartApplication = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setEmailError('Email is required')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    // Store email in sessionStorage and navigate to application form
    sessionStorage.setItem('applicantEmail', email)
    router.push('/application')
  }

  const isButtonEnabled = email && validateEmail(email)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:ring-4 focus:ring-blue-400"
      >
        Skip to main content
      </a>

      {/* Hero Section */}
      <header className="container mx-auto px-6 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Rivio
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 font-light">
            Trade Credit Insurance Compliance, Simplified
          </p>
        </div>
      </header>

      <main id="main-content">
        {/* What We Do Section */}
        <section aria-labelledby="what-we-do-heading" className="container mx-auto px-6 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 id="what-we-do-heading" className="text-3xl md:text-4xl font-semibold text-white mb-6">
              What We Do
            </h2>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-4">
              Rivio helps businesses monitor and maintain compliance with their trade credit insurance policies.
              We provide real-time insights into accounts receivable, credit limits, and overdue invoices—all in one platform.
            </p>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              Managing risk has never been easier.
            </p>
          </div>
        </section>

        {/* Incentive Section */}
        <section aria-labelledby="incentive-heading" className="container mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 shadow-2xl border border-blue-500">
              <div className="text-center">
                <div className="inline-block bg-white rounded-full px-6 py-2 mb-6">
                  <span className="text-2xl font-bold text-blue-600">$50 Amazon Gift Card</span>
                </div>
                <h2 id="incentive-heading" className="text-2xl md:text-3xl font-semibold text-white mb-4">
                  Share Your Insights
                </h2>
                <p className="text-lg text-blue-100 leading-relaxed">
                  We're conducting research to better understand how businesses manage trade credit insurance.
                  Share your experience in a 30-minute interview and receive a <strong>$50 Amazon gift card</strong> as our thank you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Email Capture Section */}
        <section aria-labelledby="get-started-heading" className="container mx-auto px-6 py-12 md:py-16">
          <div className="max-w-2xl mx-auto">
            <h2 id="get-started-heading" className="text-3xl md:text-4xl font-semibold text-white mb-8 text-center">
              Get Started
            </h2>

            <form onSubmit={handleStartApplication} className="bg-slate-800 rounded-2xl p-8 md:p-10 shadow-2xl border border-slate-700" noValidate>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email Address <span className="text-red-400" aria-label="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  aria-invalid={emailError ? 'true' : 'false'}
                  aria-describedby={emailError ? 'email-error' : undefined}
                  className={`w-full px-4 py-4 bg-slate-900 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 focus:border-blue-400 transition-all duration-200 ${
                    emailError ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="your.email@company.com"
                />
                {emailError && (
                  <p id="email-error" className="mt-2 text-sm text-red-400" role="alert">
                    {emailError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isButtonEnabled}
                aria-describedby={!isButtonEnabled && email ? "button-disabled-reason" : undefined}
                className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                  isButtonEnabled
                    ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl cursor-pointer'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Start Application
              </button>
              {email && !isButtonEnabled && (
                <p id="button-disabled-reason" className="sr-only">
                  Please enter a valid email address to continue
                </p>
              )}

              <p className="text-sm text-slate-400 text-center mt-6">
                By continuing, you agree to participate in a 30-minute interview about trade credit insurance practices.
              </p>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-slate-700">
        <div className="text-center text-slate-400">
          <p className="mb-2">© 2025 Rivio. All rights reserved.</p>
          <p className="text-sm">Making trade credit insurance compliance effortless.</p>
        </div>
      </footer>
    </div>
  )
}
