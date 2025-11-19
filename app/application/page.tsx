'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ApplicationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    organization: '',
    position: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Retrieve email from sessionStorage
    const savedEmail = sessionStorage.getItem('applicantEmail')
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }))
      setIsLoading(false)
    } else {
      // If no email, redirect back to landing
      router.replace('/landing')
    }
  }, [router])

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return value.trim().length < 2 ? 'Must be at least 2 characters' : ''
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return !emailRegex.test(value) ? 'Please enter a valid email address' : ''
      case 'organization':
        return value.trim().length < 2 ? 'Organization name is required' : ''
      case 'position':
        return value.trim().length < 2 ? 'Position is required' : ''
      case 'phone':
        if (value.trim() === '') return ''
        const phoneRegex = /^[\d\s\-\+\(\)]+$/
        return !phoneRegex.test(value) ? 'Please enter a valid phone number' : ''
      default:
        return ''
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (touched[name]) {
      const error = validateField(name, value)
      setErrors({ ...errors, [name]: error })
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched({ ...touched, [name]: true })
    const error = validateField(name, value)
    setErrors({ ...errors, [name]: error })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData])
      if (error) newErrors[key] = error
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))

      const firstErrorField = Object.keys(newErrors)[0]
      document.getElementById(firstErrorField)?.focus()
      return
    }

    console.log('Form submitted:', formData)
    // Clear sessionStorage
    sessionStorage.removeItem('applicantEmail')
    setSubmitted(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" role="status" aria-label="Loading">
            <span className="sr-only">Loading application form...</span>
          </div>
          <p className="mt-4 text-slate-300">Loading your application...</p>
        </div>
      </div>
    )
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
      <header className="container mx-auto px-6 py-8 border-b border-slate-700">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Rivio
          </h1>
        </div>
      </header>

      <main id="main-content">
        <section className="container mx-auto px-6 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            {submitted ? (
              <div className="bg-green-900 border border-green-700 rounded-xl p-8 md:p-12 text-center" role="alert" aria-live="polite">
                <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h2 className="text-3xl font-semibold text-white mb-4">Thank You!</h2>
                <p className="text-lg text-green-200 mb-6">
                  We've received your application and will be in touch shortly to schedule your 30-minute interview.
                </p>
                <p className="text-md text-green-300">
                  Don't forget—you'll receive a <strong>$50 Amazon gift card</strong> as our thank you for participating!
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                    Complete Your Application
                  </h2>
                  <p className="text-lg text-slate-300">
                    Just a few more details to get started with your interview.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl p-8 md:p-10 shadow-2xl border border-slate-700" noValidate>
                  {/* Email (Read-only) */}
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="w-full px-4 py-4 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 cursor-not-allowed"
                    />
                  </div>

                  {/* First Name and Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                        First Name <span className="text-red-400" aria-label="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-invalid={errors.firstName ? 'true' : 'false'}
                        aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                        className={`w-full px-4 py-4 bg-slate-900 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 focus:border-blue-400 transition-all duration-200 ${
                          errors.firstName && touched.firstName ? 'border-red-500' : 'border-slate-600'
                        }`}
                        placeholder="John"
                      />
                      {errors.firstName && touched.firstName && (
                        <p id="firstName-error" className="mt-1 text-sm text-red-400" role="alert">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                        Last Name <span className="text-red-400" aria-label="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-invalid={errors.lastName ? 'true' : 'false'}
                        aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                        className={`w-full px-4 py-4 bg-slate-900 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 focus:border-blue-400 transition-all duration-200 ${
                          errors.lastName && touched.lastName ? 'border-red-500' : 'border-slate-600'
                        }`}
                        placeholder="Doe"
                      />
                      {errors.lastName && touched.lastName && (
                        <p id="lastName-error" className="mt-1 text-sm text-red-400" role="alert">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Organization */}
                  <div className="mb-6">
                    <label htmlFor="organization" className="block text-sm font-medium text-white mb-2">
                      Organization <span className="text-red-400" aria-label="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="organization"
                      name="organization"
                      required
                      value={formData.organization}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={errors.organization ? 'true' : 'false'}
                      aria-describedby={errors.organization ? 'organization-error' : undefined}
                      className={`w-full px-4 py-4 bg-slate-900 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 focus:border-blue-400 transition-all duration-200 ${
                        errors.organization && touched.organization ? 'border-red-500' : 'border-slate-600'
                      }`}
                      placeholder="Your Company Ltd."
                    />
                    {errors.organization && touched.organization && (
                      <p id="organization-error" className="mt-1 text-sm text-red-400" role="alert">
                        {errors.organization}
                      </p>
                    )}
                  </div>

                  {/* Position */}
                  <div className="mb-6">
                    <label htmlFor="position" className="block text-sm font-medium text-white mb-2">
                      Position <span className="text-red-400" aria-label="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      required
                      value={formData.position}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={errors.position ? 'true' : 'false'}
                      aria-describedby={errors.position ? 'position-error' : undefined}
                      className={`w-full px-4 py-4 bg-slate-900 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 focus:border-blue-400 transition-all duration-200 ${
                        errors.position && touched.position ? 'border-red-500' : 'border-slate-600'
                      }`}
                      placeholder="Chief Financial Officer"
                    />
                    {errors.position && touched.position && (
                      <p id="position-error" className="mt-1 text-sm text-red-400" role="alert">
                        {errors.position}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="mb-8">
                    <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                      Phone Number <span className="text-slate-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={errors.phone ? 'true' : 'false'}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                      className={`w-full px-4 py-4 bg-slate-900 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 focus:border-blue-400 transition-all duration-200 ${
                        errors.phone && touched.phone ? 'border-red-500' : 'border-slate-600'
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && touched.phone && (
                      <p id="phone-error" className="mt-1 text-sm text-red-400" role="alert">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800"
                  >
                    Submit & Claim Your $50 Gift Card
                  </button>

                  <p className="text-sm text-slate-400 text-center mt-6">
                    By submitting this form, you agree to participate in a 30-minute interview about trade credit insurance practices.
                  </p>
                </form>
              </>
            )}
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
