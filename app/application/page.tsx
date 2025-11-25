'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { API_ENDPOINTS } from '../config/api'

// Searchable Select Component
type SearchableSelectProps = {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
}

function SearchableSelect({ value, onChange, options, placeholder, className }: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get display value
  const displayValue = options.find(opt => opt.value === value)?.label || ''

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSearchTerm('')
        break
    }
  }

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setIsOpen(false)
    setSearchTerm('')
    setHighlightedIndex(0)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setIsOpen(true)
    setHighlightedIndex(0)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0) {
      const optionElement = document.getElementById(`option-${highlightedIndex}`)
      optionElement?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex, isOpen])

  return (
    <div ref={wrapperRef} className={`relative ${isOpen ? 'z-[9999]' : ''} ${className || ''}`}>
      <input
        ref={inputRef}
        type="text"
        value={isOpen ? searchTerm : displayValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Type to search...'}
        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-white/40 rounded-xl text-[#1F4D3D] placeholder-[#2D6A4F]/60 focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60 focus:bg-white/70"
        autoComplete="off"
      />

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white/95 backdrop-blur-md border-2 border-white/50 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={option.value}
                id={`option-${index}`}
                onClick={() => handleSelect(option.value)}
                className={`px-4 py-3 cursor-pointer transition ${
                  index === highlightedIndex
                    ? 'bg-emerald-500 text-white font-medium'
                    : value === option.value
                    ? 'bg-emerald-100 text-[#1F4D3D]'
                    : 'text-[#1F4D3D] hover:bg-white/60'
                }`}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-[#2D6A4F]">No matches found</div>
          )}
        </div>
      )}
    </div>
  )
}

// Define section types
type SectionId =
  | 'qualification'
  | 'payment-terms'
  | 'bad-debt-question'
  | 'bad-debt-details'
  | 'bad-debt-changes'
  | 'current-practices'
  | 'tci-questions'
  | 'tci-non-usage'
  | 'company-profile'
  | 'email-capture'

// Define types
type SurveyData = {
  // Qualification
  q1_b2b_percentage: string
  q2_role: string
  q2_role_other: string
  // Credit Management
  q3_payment_terms: string
  q4_bad_debt_experience: string
  // Bad Debt (conditional)
  q5_bad_debt_amount: string
  q6_bad_debt_impact: number
  q7_changed_approach: string
  q7a_changes_made: string[]
  q7a_changes_other: string
  // Current Practices
  q8_credit_assessment_methods: string[]
  q9_ar_tracking_tools: string[]
  // Risk Mitigation
  q10_risk_mechanisms: string[]
  q10_risk_mechanisms_other: string
  // TCI Non-usage (conditional)
  q10a_tci_non_usage_reasons: string[]
  q10a_tci_non_usage_reasons_other: string
  // TCI Deep-dive (conditional)
  q11_tci_duration: string
  q12_tci_coverage: string
  q12_tci_coverage_other: string
  q13_tci_provider: string[]
  q13_tci_provider_other: string
  q14_tci_interaction_frequency: string
  q15_tci_satisfaction: number
  q16_tci_challenges: string[]
  q16_tci_challenges_other: string
  // Company Profile
  q17_annual_revenue: string
  q18_primary_industry: string
  q18_primary_industry_other: string
  q19_company_headquarters: string
  q19_company_headquarters_other: string
  q20_international_sales_percentage: string
  // Email capture
  email: string
  contactName: string
  companyName: string
  wantsStayInTouch: boolean
  wantsBenchmarkReport: boolean
  wantsResearchReport: boolean
  wantsConsultation: boolean
  consultationPhone: string
  consultationBestTime: string
}

export default function SurveyPage() {
  const router = useRouter()
  const [currentSectionId, setCurrentSectionId] = useState<SectionId>('qualification')
  const [screenedOut, setScreenedOut] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState<Partial<SurveyData>>({
    q1_b2b_percentage: '',
    q2_role: '',
    q2_role_other: '',
    q3_payment_terms: '',
    q4_bad_debt_experience: '',
    q5_bad_debt_amount: '',
    q6_bad_debt_impact: 0,
    q7_changed_approach: '',
    q7a_changes_made: [],
    q7a_changes_other: '',
    q8_credit_assessment_methods: [],
    q9_ar_tracking_tools: [],
    q10_risk_mechanisms: [],
    q10_risk_mechanisms_other: '',
    q10a_tci_non_usage_reasons: [],
    q10a_tci_non_usage_reasons_other: '',
    q11_tci_duration: '',
    q12_tci_coverage: '',
    q12_tci_coverage_other: '',
    q13_tci_provider: [],
    q13_tci_provider_other: '',
    q14_tci_interaction_frequency: '',
    q15_tci_satisfaction: 0,
    q16_tci_challenges: [],
    q16_tci_challenges_other: '',
    q17_annual_revenue: '',
    q18_primary_industry: '',
    q18_primary_industry_other: '',
    q19_company_headquarters: '',
    q19_company_headquarters_other: '',
    q20_international_sales_percentage: '',
    email: '',
    contactName: '',
    companyName: '',
    wantsStayInTouch: false,
    wantsBenchmarkReport: false,
    wantsResearchReport: false,
    wantsConsultation: false,
    consultationPhone: '',
    consultationBestTime: '',
  })

  // Load saved progress from sessionStorage on mount
  useEffect(() => {
    const savedFormData = sessionStorage.getItem('surveyFormData')
    const savedSection = sessionStorage.getItem('surveyCurrentSectionId')

    if (savedFormData) {
      try {
        setFormData(JSON.parse(savedFormData))
      } catch (error) {
        console.error('Error loading saved form data:', error)
      }
    }

    if (savedSection) {
      setCurrentSectionId(savedSection as SectionId)
    }
  }, [])

  // Save progress to sessionStorage whenever formData or currentSection changes
  useEffect(() => {
    if (!submitted && !screenedOut) {
      sessionStorage.setItem('surveyFormData', JSON.stringify(formData))
      sessionStorage.setItem('surveyCurrentSectionId', currentSectionId)
    }
  }, [formData, currentSectionId, submitted, screenedOut])

  // Helper functions to determine survey path
  const hasBadDebt = () => {
    return formData.q4_bad_debt_experience === 'yes-multiple' ||
           formData.q4_bad_debt_experience === 'yes-once-or-twice'
  }

  const madeChanges = () => {
    return formData.q7_changed_approach === 'yes-significant' ||
           formData.q7_changed_approach === 'yes-minor'
  }

  const usesTCI = () => {
    return formData.q10_risk_mechanisms?.includes('trade-credit-insurance') || false
  }

  // Get ordered list of sections based on user's path
  const getSectionOrder = (): SectionId[] => {
    const sections: SectionId[] = [
      'qualification',
      'payment-terms',
      'bad-debt-question',
    ]

    // Add bad debt sections if applicable
    if (hasBadDebt()) {
      sections.push('bad-debt-details')
      if (madeChanges()) {
        sections.push('bad-debt-changes')
      }
    }

    sections.push('current-practices')

    // Add TCI section if applicable, otherwise add TCI non-usage section
    if (usesTCI()) {
      sections.push('tci-questions')
    } else {
      sections.push('tci-non-usage')
    }

    sections.push('company-profile', 'email-capture')

    return sections
  }

  const getCurrentProgress = () => {
    const sections = getSectionOrder()
    const currentIndex = sections.indexOf(currentSectionId)
    return Math.round(((currentIndex + 1) / sections.length) * 100)
  }

  const getCurrentSectionNumber = () => {
    const sections = getSectionOrder()
    return sections.indexOf(currentSectionId) + 1
  }

  const getTotalSections = () => {
    return getSectionOrder().length
  }

  const handleCheckboxChange = (field: keyof SurveyData, value: string, checked: boolean) => {
    const currentArray = (formData[field] as string[]) || []
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value)
    setFormData({ ...formData, [field]: newArray })
  }

  const handleNext = () => {
    const sections = getSectionOrder()
    const currentIndex = sections.indexOf(currentSectionId)

    // Screen out logic
    if (currentSectionId === 'qualification' && formData.q1_b2b_percentage === 'less-than-25') {
      sessionStorage.removeItem('surveyFormData')
      sessionStorage.removeItem('surveyCurrentSectionId')
      setScreenedOut(true)
      return
    }

    // Move to next section
    if (currentIndex < sections.length - 1) {
      setCurrentSectionId(sections[currentIndex + 1])
      // Scroll to top of page smoothly after state update
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 0)
    }
  }

  const handleBack = () => {
    const sections = getSectionOrder()
    const currentIndex = sections.indexOf(currentSectionId)

    if (currentIndex > 0) {
      setCurrentSectionId(sections[currentIndex - 1])
      // Scroll to top of page smoothly after state update
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 0)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const startTime = sessionStorage.getItem('surveyStartTime')
      const completionTime = startTime
        ? Math.floor((Date.now() - parseInt(startTime)) / 1000)
        : undefined

      // Clean data - remove empty strings and default values for conditional fields
      const cleanedData: any = { ...formData }

      Object.keys(cleanedData).forEach(key => {
        const value = cleanedData[key]
        if (value === '') {
          delete cleanedData[key]
        }
        else if (typeof value === 'number' && value === 0) {
          delete cleanedData[key]
        }
        else if (Array.isArray(value) && value.length === 0) {
          delete cleanedData[key]
        }
      })

      const response = await fetch(API_ENDPOINTS.survey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...cleanedData,
          completionTime,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          const errorMessages = data.errors.map((err: any) => err.msg).join('\n')
          alert(`Validation Error:\n${errorMessages}`)
        } else {
          alert(`Error: ${data.message || 'Failed to submit survey'}`)
        }
        return
      }

      sessionStorage.removeItem('surveyStartTime')
      sessionStorage.removeItem('surveyFormData')
      sessionStorage.removeItem('surveyCurrentSectionId')
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting survey:', error)
      alert('Failed to submit survey. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add Enter key listener for navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only trigger if Enter is pressed and we can proceed
      if (event.key === 'Enter' && canProceed() && !isSubmitting) {
        // Prevent if user is typing in an input field
        const target = event.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return
        }

        // If on last section, submit; otherwise go to next
        if (isLastSection()) {
          handleSubmit()
        } else {
          handleNext()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentSectionId, formData, isSubmitting])

  // Render screened out message
  if (screenedOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1F4D3D] via-[#2D6A4F] to-[#1F4D3D] flex items-center justify-center relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-2xl mx-auto px-6 relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#2D6A4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Thank You for Your Interest</h2>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              This survey focuses on B2B credit management practices. Based on your response,
              this survey may not be applicable to your business at this time.
            </p>
            <button
              onClick={() => {
                sessionStorage.clear()
                router.push('/landing')
              }}
              className="bg-gradient-to-r from-[#2D6A4F] to-[#1F4D3D] hover:from-[#1F4D3D] hover:to-[#2D6A4F] text-white font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render thank you screen after submission
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1F4D3D] via-[#2D6A4F] to-[#1F4D3D] relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 text-center mb-8 shadow-2xl">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-slow">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-5xl font-bold text-[#1F4D3D] mb-6">Thank You!</h2>
              <div className="inline-block bg-emerald-50 rounded-full px-6 py-3 mt-4">
                <p className="text-lg text-emerald-800 font-semibold">
                  <span className="text-emerald-600 font-bold">Your insights matter</span>
                </p>
              </div>
            </div>

            {formData.email && (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-[#1F4D3D] mb-6 text-center">What Happens Next?</h3>
                <div className="space-y-4">
                  {formData.wantsStayInTouch && (
                    <div className="flex items-start p-4 bg-emerald-50 rounded-xl">
                      <svg className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                      <p className="text-[#1F4D3D]"><span className="font-semibold">Survey Report:</span> We will share with you the results of the survey once sufficient number of responses have been collected and analyzed</p>
                    </div>
                  )}
                  {formData.wantsConsultation && (
                    <div className="flex items-start p-4 bg-emerald-50 rounded-xl">
                      <svg className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-[#1F4D3D]"><span className="font-semibold">Challenge Mapping Session:</span> If you have not scheduled a session through Calendly, we will contact you in the next few days</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="container mx-auto px-6 py-8 mt-8">
            <div className="text-center">
              <p className="text-sm text-emerald-200">
                Any questions? Contact us at{' '}
                <a href="mailto:javiersg@mit.edu" className="text-emerald-400 hover:text-emerald-300 font-medium">javiersg@mit.edu</a>
                {' '}or{' '}
                <a href="mailto:sergio51@mit.edu" className="text-emerald-400 hover:text-emerald-300 font-medium">sergio51@mit.edu</a>
              </p>
            </div>
          </footer>
        </div>

        <style jsx>{`
          @keyframes bounce-slow {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    )
  }

  const renderSection = () => {
    switch (currentSectionId) {
      case 'qualification':
        return (
          <div className="space-y-8">
            <div>
              <p className="text-sm text-emerald-700 mb-3 font-medium flex items-center gap-2">
                <span className="bg-emerald-100 px-2 py-1 rounded">Question 1 of 2</span>
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1F4D3D] mb-8 leading-tight">
                What percentage of your company's sales are B2B?
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'less-than-25', label: 'Less than 25%' },
                  { value: '25-50', label: '25-50%' },
                  { value: '51-75', label: '51-75%' },
                  { value: '76-100', label: '76-100%' },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setFormData({ ...formData, q1_b2b_percentage: option.value })}
                    className={`p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 shadow-sm flex items-center gap-3 ${
                      formData.q1_b2b_percentage === option.value
                        ? 'bg-emerald-600 border-emerald-700 shadow-md'
                        : 'bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60 hover:border-white/50'
                    }`}
                  >
                    {formData.q1_b2b_percentage === option.value && (
                      <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className={`text-lg font-medium ${formData.q1_b2b_percentage === option.value ? 'text-white' : 'text-[#1F4D3D]'}`}>{option.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-emerald-700 mb-3 font-medium flex items-center gap-2">
                <span className="bg-emerald-100 px-2 py-1 rounded">Question 2 of 2</span>
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1F4D3D] mb-8 leading-tight">What is your role?</h2>
              <div className="space-y-3">
                {[
                  { value: 'cfo-finance-director', label: 'CFO / Finance Director' },
                  { value: 'credit-manager', label: 'Credit Manager / Credit Controller' },
                  { value: 'controller-treasurer', label: 'Controller / Treasurer' },
                  { value: 'ar-collections-manager', label: 'AR/Collections Manager' },
                  { value: 'ceo-owner', label: 'CEO/Owner (involved in credit decisions)' },
                  { value: 'coo', label: 'COO (involved in credit decisions)' },
                  { value: 'other', label: 'Other role' },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setFormData({ ...formData, q2_role: option.value })}
                    className={`p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 shadow-sm flex items-center gap-3 ${
                      formData.q2_role === option.value
                        ? 'bg-emerald-600 border-emerald-700 shadow-md'
                        : 'bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60 hover:border-white/50'
                    }`}
                  >
                    {formData.q2_role === option.value && (
                      <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className={`text-lg font-medium ${formData.q2_role === option.value ? 'text-white' : 'text-[#1F4D3D]'}`}>{option.label}</span>
                  </div>
                ))}
              </div>
              {formData.q2_role === 'other' && (
                <input
                  type="text"
                  placeholder="Please specify your role"
                  value={formData.q2_role_other}
                  onChange={(e) => setFormData({ ...formData, q2_role_other: e.target.value })}
                  className="mt-3 w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-white/40 rounded-xl text-[#1F4D3D] placeholder-[#2D6A4F]/60 focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60 focus:bg-white/70"
                />
              )}
            </div>
          </div>
        )

      case 'payment-terms':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 leading-tight">
                What credit payment terms do you typically offer?
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'net-15-or-shorter', label: 'Net 15 or shorter' },
                  { value: 'net-30', label: 'Net 30' },
                  { value: 'net-60', label: 'Net 60' },
                  { value: 'net-90', label: 'Net 90' },
                  { value: 'more-than-net-90', label: 'More than Net 90' },
                  { value: 'cash-payment-on-delivery', label: 'Mostly cash/payment on delivery' },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setFormData({ ...formData, q3_payment_terms: option.value })}
                    className={`p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 shadow-sm flex items-center gap-3 ${
                      formData.q3_payment_terms === option.value
                        ? 'bg-emerald-600 border-emerald-700 shadow-md'
                        : 'bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60 hover:border-white/50'
                    }`}
                  >
                    {formData.q3_payment_terms === option.value && (
                      <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className={`text-lg font-medium ${formData.q3_payment_terms === option.value ? 'text-white' : 'text-[#1F4D3D]'}`}>{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'bad-debt-question':
        return (
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 leading-tight">
              Have you ever experienced significant payment defaults or bad debt from customers?
            </h2>
            <div className="space-y-3">
              {[
                { value: 'yes-multiple', label: 'Yes, multiple times' },
                { value: 'yes-once-or-twice', label: 'Yes, once or twice' },
                { value: 'no-never', label: 'No, never' },
                { value: 'prefer-not-say', label: 'Prefer not to say' },
              ].map((option) => (
                <div
                  key={option.value}
                  onClick={() => setFormData({ ...formData, q4_bad_debt_experience: option.value })}
                  className={`p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 shadow-sm flex items-center gap-3 ${
                    formData.q4_bad_debt_experience === option.value
                      ? 'bg-emerald-600 border-emerald-700 shadow-md'
                      : 'bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60 hover:border-white/50'
                  }`}
                >
                  {formData.q4_bad_debt_experience === option.value && (
                    <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span className={`text-lg font-medium ${formData.q4_bad_debt_experience === option.value ? 'text-white' : 'text-[#1F4D3D]'}`}>{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        )

      case 'bad-debt-details':
        return (
          <div className="space-y-10">
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-white/40">
              <p className="text-sm text-emerald-700 mb-3 font-medium flex items-center gap-2">
                <span className="bg-emerald-100 px-2 py-1 rounded">Question 1 of 3</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 leading-tight">
                Approximately how much has your company lost to bad debt over the past 5 years?
              </h2>
              <p className="text-lg text-[#2D6A4F] mb-6">
                Your response is anonymous and helps us understand the scale of impact across different businesses.
              </p>
              <div className="space-y-3">
                {[
                  { value: 'less-than-50k', label: 'Less than $50,000' },
                  { value: '50k-250k', label: '$50,000 - $250,000' },
                  { value: '250k-1m', label: '$250,000 - $1 million' },
                  { value: '1m-5m', label: '$1 million - $5 million' },
                  { value: 'over-5m', label: 'Over $5 million' },
                  { value: 'prefer-not-say', label: 'Prefer not to say' },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setFormData({ ...formData, q5_bad_debt_amount: option.value })}
                    className={`p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 shadow-sm flex items-center gap-3 ${
                      formData.q5_bad_debt_amount === option.value
                        ? 'bg-emerald-600 border-emerald-700 shadow-md'
                        : 'bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60 hover:border-white/50'
                    }`}
                  >
                    {formData.q5_bad_debt_amount === option.value && (
                      <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className={`text-lg font-medium ${formData.q5_bad_debt_amount === option.value ? 'text-white' : 'text-[#1F4D3D]'}`}>{option.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-white/40">
              <p className="text-sm text-emerald-700 mb-3 font-medium flex items-center gap-2">
                <span className="bg-emerald-100 px-2 py-1 rounded">Question 2 of 3</span>
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 sm:mb-8 leading-tight">
                How significantly did bad debt impact your business?
              </h2>
              <div className="flex justify-between items-start mb-4 max-w-xl mx-auto gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex flex-col items-center flex-1 min-w-0">
                    <button
                      onClick={() => setFormData({ ...formData, q6_bad_debt_impact: rating })}
                      className={`w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full font-bold text-base sm:text-xl md:text-2xl transition-all duration-200 flex-shrink-0 ${
                        formData.q6_bad_debt_impact === rating
                          ? 'bg-emerald-600 text-white shadow-lg scale-105 sm:scale-110 ring-2 sm:ring-4 ring-emerald-300'
                          : 'bg-white/60 backdrop-blur-sm text-[#1F4D3D] hover:bg-white/80 border-2 border-white/50 hover:border-emerald-400 shadow-sm'
                      }`}
                    >
                      {rating}
                    </button>
                    <div className="h-auto sm:h-12 mt-2 sm:mt-3 flex items-start justify-center w-full px-0.5">
                      {rating === 1 && (
                        <p className="text-[10px] sm:text-sm text-[#2D6A4F] text-center font-medium leading-tight">Minor<br /> inconvenience</p>
                      )}
                      {rating === 5 && (
                        <p className="text-[10px] sm:text-sm text-[#2D6A4F] text-center font-medium leading-tight">Threatened<br /> business<br /> viability</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-white/40">
              <p className="text-sm text-emerald-700 mb-3 font-medium flex items-center gap-2">
                <span className="bg-emerald-100 px-2 py-1 rounded">Question 3 of 3</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 leading-tight">
                Did you change your credit risk management approach after these experiences?
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'yes-significant', label: 'Yes, made significant changes' },
                  { value: 'yes-minor', label: 'Yes, made minor adjustments' },
                  { value: 'no-same-approach', label: 'No, kept the same approach' },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setFormData({ ...formData, q7_changed_approach: option.value })}
                    className={`p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 shadow-sm flex items-center gap-3 ${
                      formData.q7_changed_approach === option.value
                        ? 'bg-emerald-600 border-emerald-700 shadow-md'
                        : 'bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60 hover:border-white/50'
                    }`}
                  >
                    {formData.q7_changed_approach === option.value && (
                      <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className={`text-lg font-medium ${formData.q7_changed_approach === option.value ? 'text-white' : 'text-[#1F4D3D]'}`}>{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'bad-debt-changes':
        return (
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 leading-tight">
              What changes did you make?
            </h2>
            <p className="text-lg text-[#2D6A4F] mb-6">Select all that apply</p>
            <div className="space-y-3">
              {[
                { value: 'stricter-credit-approval', label: 'Stricter credit approval processes' },
                { value: 'trade-credit-insurance', label: 'Started using trade credit insurance' },
                { value: 'factoring-invoice-financing', label: 'Started using factoring/invoice financing' },
                { value: 'ar-management-software', label: 'New AR management software' },
                { value: 'letters-of-credit', label: 'Required letters of credit for risky customers' },
                { value: 'shortened-payment-terms', label: 'Shortened payment terms' },
                { value: 'deposits-advance-payments', label: 'Required deposits/advance payments' },
                { value: 'other', label: 'Other' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 shadow-sm ${
                    formData.q7a_changes_made?.includes(option.value)
                      ? 'bg-emerald-600 border-emerald-700 shadow-md'
                      : 'bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60 hover:border-white/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.q7a_changes_made?.includes(option.value)}
                    onChange={(e) => handleCheckboxChange('q7a_changes_made', option.value, e.target.checked)}
                    className="w-6 h-6 text-white accent-white rounded focus:ring-emerald-300 focus:ring-2"
                  />
                  <span className={`ml-4 text-lg font-medium ${formData.q7a_changes_made?.includes(option.value) ? 'text-white' : 'text-[#1F4D3D]'}`}>{option.label}</span>
                </label>
              ))}
            </div>
            {formData.q7a_changes_made?.includes('other') && (
              <input
                type="text"
                placeholder="Please specify other changes"
                value={formData.q7a_changes_other}
                onChange={(e) => setFormData({ ...formData, q7a_changes_other: e.target.value })}
                className="mt-3 w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-white/40 rounded-xl text-[#1F4D3D] placeholder-[#2D6A4F]/60 focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60 focus:bg-white/70"
              />
            )}
          </div>
        )

      case 'current-practices':
        return (
          <div className="space-y-10">
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-white/40">
              <p className="text-sm text-emerald-700 mb-3 font-medium flex items-center gap-2">
                <span className="bg-emerald-100 px-2 py-1 rounded">Question 1 of 3</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 leading-tight">
                What information sources do you use to determine credit terms for customers?
              </h2>
              <p className="text-lg text-[#2D6A4F] mb-6">Select all that apply</p>
              <div className="space-y-3">
                {[
                  { value: 'credit-bureau-reports', label: 'Credit bureau reports (Dun & Bradstreet, Experian, etc.)' },
                  { value: 'financial-statements', label: 'Financial statements review' },
                  { value: 'bank-trade-references', label: 'Bank or trade references' },
                  { value: 'third-party-assessments', label: 'Third-party credit risk assessments' },
                  { value: 'personal-relationship', label: 'Personal relationship/experience' },
                  { value: 'industry-standard-terms', label: 'Industry standard terms' },
                  { value: 'no-formal-assessment', label: "We don't conduct formal assessments" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 shadow-sm ${
                      formData.q8_credit_assessment_methods?.includes(option.value)
                        ? 'bg-emerald-600 border-emerald-700 shadow-md'
                        : 'bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60 hover:border-white/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.q8_credit_assessment_methods?.includes(option.value)}
                      onChange={(e) => handleCheckboxChange('q8_credit_assessment_methods', option.value, e.target.checked)}
                      className="w-6 h-6 text-white accent-white rounded focus:ring-emerald-300 focus:ring-2"
                    />
                    <span className={`ml-4 text-lg font-medium ${formData.q8_credit_assessment_methods?.includes(option.value) ? 'text-white' : 'text-[#1F4D3D]'}`}>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-white/40">
              <p className="text-sm text-emerald-700 mb-3 font-medium flex items-center gap-2">
                <span className="bg-emerald-100 px-2 py-1 rounded">Question 2 of 3</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 leading-tight">
                What tools do you use to track Accounts Receivable?
              </h2>
              <p className="text-lg text-[#2D6A4F] mb-6">Select all that apply</p>
              <div className="space-y-3">
                {[
                  { value: 'erp-system', label: 'ERP system (SAP, Oracle, NetSuite, etc.)' },
                  { value: 'accounting-software', label: 'Accounting software (QuickBooks, Xero, Sage, etc.)' },
                  { value: 'ar-collections-software', label: 'Dedicated AR/Collections software' },
                  { value: 'spreadsheets', label: 'Spreadsheets (Excel/Google Sheets)' },
                  { value: 'no-specific-tools', label: "We don't use specific tools" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 shadow-sm ${
                      formData.q9_ar_tracking_tools?.includes(option.value)
                        ? 'bg-emerald-600 border-emerald-700 shadow-md'
                        : 'bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60 hover:border-white/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.q9_ar_tracking_tools?.includes(option.value)}
                      onChange={(e) => handleCheckboxChange('q9_ar_tracking_tools', option.value, e.target.checked)}
                      className="w-6 h-6 text-white accent-white rounded focus:ring-emerald-300 focus:ring-2"
                    />
                    <span className={`ml-4 text-lg font-medium ${formData.q9_ar_tracking_tools?.includes(option.value) ? 'text-white' : 'text-[#1F4D3D]'}`}>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-white/40">
              <p className="text-sm text-emerald-700 mb-3 font-medium flex items-center gap-2">
                <span className="bg-emerald-100 px-2 py-1 rounded">Question 3 of 3</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 leading-tight">
                Which of these credit risk mechanisms does your company currently use?
              </h2>
              <p className="text-lg text-[#2D6A4F] mb-6">Select all that apply. Don't worry if you haven't heard of some—just skip those.</p>
              <div className="space-y-3">
                {[
                  { value: 'trade-credit-insurance', label: 'Trade Credit Insurance' },
                  { value: 'invoice-factoring', label: 'Invoice Factoring / Invoice Financing' },
                  { value: 'letters-of-credit', label: 'Letters of Credit' },
                  { value: 'bank-guarantees', label: 'Bank Guarantees' },
                  { value: 'internal-reserves', label: 'Internal reserves / allowance for bad debt' },
                  { value: 'none', label: "We don't use any formal mechanisms" },
                  { value: 'other', label: 'Other' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 shadow-sm ${
                      formData.q10_risk_mechanisms?.includes(option.value)
                        ? 'bg-emerald-600 border-emerald-700 shadow-md'
                        : 'bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60 hover:border-white/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.q10_risk_mechanisms?.includes(option.value)}
                      onChange={(e) => handleCheckboxChange('q10_risk_mechanisms', option.value, e.target.checked)}
                      className="w-6 h-6 text-white accent-white rounded focus:ring-emerald-300 focus:ring-2"
                    />
                    <span className={`ml-4 text-lg font-medium ${formData.q10_risk_mechanisms?.includes(option.value) ? 'text-white' : 'text-[#1F4D3D]'}`}>{option.label}</span>
                  </label>
                ))}
              </div>
              {formData.q10_risk_mechanisms?.includes('other') && (
                <input
                  type="text"
                  placeholder="Please specify other mechanisms"
                  value={formData.q10_risk_mechanisms_other}
                  onChange={(e) => setFormData({ ...formData, q10_risk_mechanisms_other: e.target.value })}
                  className="mt-3 w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-white/40 rounded-xl text-[#1F4D3D] placeholder-[#2D6A4F]/60 focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60 focus:bg-white/70"
                />
              )}
            </div>
          </div>
        )

      case 'tci-questions':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 leading-tight">
                How long have you used trade credit insurance?
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'less-than-1-year', label: 'Less than 1 year' },
                  { value: '1-3-years', label: '1-3 years' },
                  { value: '3-5-years', label: '3-5 years' },
                  { value: 'over-5-years', label: 'Over 5 years' },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setFormData({ ...formData, q11_tci_duration: option.value })}
                    className={`p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 shadow-sm flex items-center gap-3 ${
                      formData.q11_tci_duration === option.value
                        ? 'bg-emerald-600 border-emerald-700 shadow-md'
                        : 'bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60 hover:border-white/50'
                    }`}
                  >
                    {formData.q11_tci_duration === option.value && (
                      <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className={`text-lg font-medium ${formData.q11_tci_duration === option.value ? 'text-white' : 'text-[#1F4D3D]'}`}>{option.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 leading-tight">
                What portion of your AR do you insure?
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'entire-portfolio', label: 'Entire portfolio (whole turnover policy)' },
                  { value: 'only-high-risk', label: 'Only high-risk customers' },
                  { value: 'only-large-customers', label: 'Only large customers/invoices' },
                  { value: 'specific-segments', label: 'Specific segments (e.g., international only)' },
                  { value: 'other', label: 'Other' },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setFormData({ ...formData, q12_tci_coverage: option.value })}
                    className={`p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 shadow-sm flex items-center gap-3 ${
                      formData.q12_tci_coverage === option.value
                        ? 'bg-emerald-600 border-emerald-700 shadow-md'
                        : 'bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60 hover:border-white/50'
                    }`}
                  >
                    {formData.q12_tci_coverage === option.value && (
                      <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className={`text-lg font-medium ${formData.q12_tci_coverage === option.value ? 'text-white' : 'text-[#1F4D3D]'}`}>{option.label}</span>
                  </div>
                ))}
              </div>
              {formData.q12_tci_coverage === 'other' && (
                <input
                  type="text"
                  placeholder="Please specify coverage"
                  value={formData.q12_tci_coverage_other}
                  onChange={(e) => setFormData({ ...formData, q12_tci_coverage_other: e.target.value })}
                  className="mt-3 w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-white/40 rounded-xl text-[#1F4D3D] placeholder-[#2D6A4F]/60 focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60 focus:bg-white/70"
                />
              )}
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 leading-tight">
                Who is your TCI provider?
              </h2>
              <p className="text-lg text-[#2D6A4F] mb-6">Select all that apply</p>
              <div className="space-y-3">
                {[
                  { value: 'allianz-trade', label: 'Allianz Trade (incl. Euler Hermes)' },
                  { value: 'atradius', label: 'Atradius' },
                  { value: 'coface', label: 'Coface' },
                  { value: 'aig', label: 'AIG' },
                  { value: 'zurich', label: 'Zurich' },
                  { value: 'other', label: 'Other' },
                  { value: 'prefer-not-say', label: 'Prefer not to say' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 shadow-sm ${
                      formData.q13_tci_provider?.includes(option.value)
                        ? 'bg-emerald-600 border-emerald-700 shadow-md'
                        : 'bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60 hover:border-white/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.q13_tci_provider?.includes(option.value)}
                      onChange={(e) => handleCheckboxChange('q13_tci_provider', option.value, e.target.checked)}
                      className="w-6 h-6 text-white accent-white rounded focus:ring-emerald-300 focus:ring-2"
                    />
                    <span className={`ml-4 text-lg font-medium ${formData.q13_tci_provider?.includes(option.value) ? 'text-white' : 'text-[#1F4D3D]'}`}>{option.label}</span>
                  </label>
                ))}
              </div>
              {formData.q13_tci_provider?.includes('other') && (
                <input
                  type="text"
                  placeholder="Please specify provider"
                  value={formData.q13_tci_provider_other}
                  onChange={(e) => setFormData({ ...formData, q13_tci_provider_other: e.target.value })}
                  className="mt-3 w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-white/40 rounded-xl text-[#1F4D3D] placeholder-[#2D6A4F]/60 focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60 focus:bg-white/70"
                />
              )}
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 leading-tight">
                How often do you interact with your insurer?
              </h2>
              <p className="text-lg text-[#2D6A4F] mb-6">
                Including coverage for new customer, credit limit increase/decrease, monthly/annual reporting, claim submission, policy renewal
              </p>
              <div className="space-y-3">
                {[
                  { value: 'weekly-or-more', label: 'Weekly or more often' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'quarterly', label: 'Quarterly' },
                  { value: 'only-when-issues', label: 'Only when issues arise' },
                  { value: 'rarely-annual-only', label: 'Rarely (annual renewal only)' },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setFormData({ ...formData, q14_tci_interaction_frequency: option.value })}
                    className={`p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 shadow-sm flex items-center gap-3 ${
                      formData.q14_tci_interaction_frequency === option.value
                        ? 'bg-emerald-600 border-emerald-700 shadow-md'
                        : 'bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60 hover:border-white/50'
                    }`}
                  >
                    {formData.q14_tci_interaction_frequency === option.value && (
                      <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className={`text-lg font-medium ${formData.q14_tci_interaction_frequency === option.value ? 'text-white' : 'text-[#1F4D3D]'}`}>{option.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 sm:mb-8 leading-tight">
                How satisfied are you with your TCI provider overall?
              </h2>
              <div className="flex justify-center gap-1 sm:gap-3 md:gap-4 mb-4 px-2">
                {[1, 2, 3, 4, 5].map((rating) => {
                  const isSelected = formData.q15_tci_satisfaction && rating <= formData.q15_tci_satisfaction
                  return (
                    <div key={rating} className="flex flex-col items-center">
                      <button
                        onClick={() => setFormData({ ...formData, q15_tci_satisfaction: rating })}
                        className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 transition-all duration-200 p-1 ${
                          isSelected
                            ? 'scale-105 sm:scale-110'
                            : 'opacity-60 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" className="w-full h-full">
                          <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            fill={isSelected ? '#059669' : 'none'}
                            stroke={isSelected ? '#059669' : '#2D6A4F'}
                            strokeWidth="1.5"
                          />
                        </svg>
                      </button>
                      <p className="text-sm sm:text-base text-[#2D6A4F] mt-2 font-medium">{rating}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 leading-tight">
                What are your biggest challenges with trade credit insurance?
              </h2>
              <p className="text-lg text-[#2D6A4F] mb-6">Select up to 3</p>
              <div className="space-y-3">
                {[
                  { value: 'high-premiums', label: 'High premiums/cost' },
                  { value: 'slow-approval', label: 'Slow approval for credit limits' },
                  { value: 'complex-claims', label: 'Complex claims process' },
                  { value: 'coverage-gaps', label: 'Coverage gaps (certain customers/markets excluded)' },
                  { value: 'coverage-removed', label: 'Coverage removed at insurer\'s discretion' },
                  { value: 'administrative-burden', label: 'Administrative burden/paperwork' },
                  { value: 'poor-communication', label: 'Poor communication or transparency' },
                  { value: 'difficult-integration', label: 'Difficult to integrate with our systems' },
                  { value: 'other', label: 'Other' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 shadow-sm ${
                      formData.q16_tci_challenges?.includes(option.value)
                        ? 'bg-emerald-600 border-emerald-700 shadow-md'
                        : 'bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60 hover:border-white/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.q16_tci_challenges?.includes(option.value)}
                      onChange={(e) => handleCheckboxChange('q16_tci_challenges', option.value, e.target.checked)}
                      disabled={!formData.q16_tci_challenges?.includes(option.value) && (formData.q16_tci_challenges?.length || 0) >= 3}
                      className="w-6 h-6 text-white accent-white rounded focus:ring-emerald-300 focus:ring-2"
                    />
                    <span className={`ml-4 text-lg font-medium ${formData.q16_tci_challenges?.includes(option.value) ? 'text-white' : 'text-[#1F4D3D]'}`}>{option.label}</span>
                  </label>
                ))}
              </div>
              {formData.q16_tci_challenges?.includes('other') && (
                <input
                  type="text"
                  placeholder="Please specify other challenges"
                  value={formData.q16_tci_challenges_other}
                  onChange={(e) => setFormData({ ...formData, q16_tci_challenges_other: e.target.value })}
                  className="mt-3 w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-white/40 rounded-xl text-[#1F4D3D] placeholder-[#2D6A4F]/60 focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60 focus:bg-white/70"
                />
              )}
            </div>
          </div>
        )

      case 'tci-non-usage':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 leading-tight">
                Why does your company not use Trade Credit Insurance?
              </h2>
              <p className="text-lg text-[#2D6A4F] mb-6">Select all that apply</p>
              <div className="space-y-3">
                {[
                  { value: 'never-heard', label: 'I have never heard of this product' },
                  { value: 'too-expensive', label: "It's too expensive" },
                  { value: 'no-value', label: "I don't see the value" },
                  { value: 'too-complex', label: "It's too complex" },
                  { value: 'other', label: 'Other' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 shadow-sm ${
                      formData.q10a_tci_non_usage_reasons?.includes(option.value)
                        ? 'bg-emerald-600 border-emerald-700 shadow-md'
                        : 'bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60 hover:border-white/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.q10a_tci_non_usage_reasons?.includes(option.value)}
                      onChange={(e) => handleCheckboxChange('q10a_tci_non_usage_reasons', option.value, e.target.checked)}
                      className="w-6 h-6 text-white accent-white rounded focus:ring-emerald-300 focus:ring-2"
                    />
                    <span className={`ml-4 text-lg font-medium ${formData.q10a_tci_non_usage_reasons?.includes(option.value) ? 'text-white' : 'text-[#1F4D3D]'}`}>{option.label}</span>
                  </label>
                ))}
              </div>
              {formData.q10a_tci_non_usage_reasons?.includes('other') && (
                <input
                  type="text"
                  placeholder="Please specify other reason"
                  value={formData.q10a_tci_non_usage_reasons_other}
                  onChange={(e) => setFormData({ ...formData, q10a_tci_non_usage_reasons_other: e.target.value })}
                  className="mt-3 w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-white/40 rounded-xl text-[#1F4D3D] placeholder-[#2D6A4F]/60 focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60 focus:bg-white/70"
                />
              )}
            </div>
          </div>
        )

      case 'company-profile':
        return (
          <div className="space-y-10 overflow-visible">
            <div className="text-center mb-4">
              <p className="text-lg text-emerald-700 font-semibold bg-emerald-100 inline-block px-4 py-2 rounded-full">
                🎉 Almost done! Final questions
              </p>
            </div>
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-white/40">
              <p className="text-sm text-emerald-700 mb-3 font-medium flex items-center gap-2">
                <span className="bg-emerald-100 px-2 py-1 rounded">Question 1 of 4</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 leading-tight">
                What is your company's approximate annual revenue?
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'under-10m', label: 'Under $10 million' },
                  { value: '10-50m', label: '$10-50 million' },
                  { value: '50-100m', label: '$50-100 million' },
                  { value: '100-500m', label: '$100-500 million' },
                  { value: 'over-500m', label: 'Over $500 million' },
                  { value: 'prefer-not-say', label: 'Prefer not to say' },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setFormData({ ...formData, q17_annual_revenue: option.value })}
                    className={`p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 shadow-sm flex items-center gap-3 ${
                      formData.q17_annual_revenue === option.value
                        ? 'bg-emerald-600 border-emerald-700 shadow-md'
                        : 'bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60 hover:border-white/50'
                    }`}
                  >
                    {formData.q17_annual_revenue === option.value && (
                      <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className={`text-lg font-medium ${formData.q17_annual_revenue === option.value ? 'text-white' : 'text-[#1F4D3D]'}`}>{option.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-white/40">
              <p className="text-sm text-emerald-700 mb-3 font-medium flex items-center gap-2">
                <span className="bg-emerald-100 px-2 py-1 rounded">Question 2 of 4</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 leading-tight">
                What is your company's primary industry?
              </h2>
              <SearchableSelect
                value={formData.q18_primary_industry || ''}
                onChange={(value) => setFormData({ ...formData, q18_primary_industry: value })}
                options={[
                  { value: 'manufacturing', label: 'Manufacturing' },
                  { value: 'wholesale-distribution', label: 'Wholesale/Distribution' },
                  { value: 'technology-software', label: 'Technology/Software' },
                  { value: 'construction', label: 'Construction' },
                  { value: 'healthcare', label: 'Healthcare' },
                  { value: 'professional-services', label: 'Professional Services' },
                  { value: 'transportation-logistics', label: 'Transportation/Logistics' },
                  { value: 'retail', label: 'Retail' },
                  { value: 'food-beverage', label: 'Food & Beverage' },
                  { value: 'chemicals', label: 'Chemicals' },
                  { value: 'textiles-apparel', label: 'Textiles/Apparel' },
                  { value: 'other', label: 'Other' },
                ]}
                placeholder="Type to search industries..."
              />
              {formData.q18_primary_industry === 'other' && (
                <input
                  type="text"
                  placeholder="Please specify your industry"
                  value={formData.q18_primary_industry_other || ''}
                  onChange={(e) => setFormData({ ...formData, q18_primary_industry_other: e.target.value })}
                  className="mt-3 w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-white/40 rounded-xl text-[#1F4D3D] placeholder-[#2D6A4F]/60 focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60 focus:bg-white/70"
                />
              )}
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-white/40">
              <p className="text-sm text-emerald-700 mb-3 font-medium flex items-center gap-2">
                <span className="bg-emerald-100 px-2 py-1 rounded">Question 3 of 4</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 leading-tight">
                Where is your company headquartered?
              </h2>
              <SearchableSelect
                value={formData.q19_company_headquarters || ''}
                onChange={(value) => setFormData({ ...formData, q19_company_headquarters: value })}
                options={[
                  { value: 'united-states', label: 'United States' },
                  { value: 'canada', label: 'Canada' },
                  { value: 'mexico', label: 'Mexico' },
                  { value: 'brazil', label: 'Brazil' },
                  { value: 'argentina', label: 'Argentina' },
                  { value: 'chile', label: 'Chile' },
                  { value: 'colombia', label: 'Colombia' },
                  { value: 'peru', label: 'Peru' },
                  { value: 'united-kingdom', label: 'United Kingdom' },
                  { value: 'germany', label: 'Germany' },
                  { value: 'france', label: 'France' },
                  { value: 'netherlands', label: 'Netherlands' },
                  { value: 'belgium', label: 'Belgium' },
                  { value: 'spain', label: 'Spain' },
                  { value: 'italy', label: 'Italy' },
                  { value: 'switzerland', label: 'Switzerland' },
                  { value: 'sweden', label: 'Sweden' },
                  { value: 'norway', label: 'Norway' },
                  { value: 'denmark', label: 'Denmark' },
                  { value: 'finland', label: 'Finland' },
                  { value: 'poland', label: 'Poland' },
                  { value: 'austria', label: 'Austria' },
                  { value: 'ireland', label: 'Ireland' },
                  { value: 'portugal', label: 'Portugal' },
                  { value: 'czech-republic', label: 'Czech Republic' },
                  { value: 'greece', label: 'Greece' },
                  { value: 'romania', label: 'Romania' },
                  { value: 'hungary', label: 'Hungary' },
                  { value: 'australia', label: 'Australia' },
                  { value: 'new-zealand', label: 'New Zealand' },
                  { value: 'china', label: 'China' },
                  { value: 'india', label: 'India' },
                  { value: 'japan', label: 'Japan' },
                  { value: 'singapore', label: 'Singapore' },
                  { value: 'south-korea', label: 'South Korea' },
                  { value: 'hong-kong', label: 'Hong Kong' },
                  { value: 'taiwan', label: 'Taiwan' },
                  { value: 'thailand', label: 'Thailand' },
                  { value: 'malaysia', label: 'Malaysia' },
                  { value: 'indonesia', label: 'Indonesia' },
                  { value: 'vietnam', label: 'Vietnam' },
                  { value: 'philippines', label: 'Philippines' },
                  { value: 'uae', label: 'United Arab Emirates' },
                  { value: 'saudi-arabia', label: 'Saudi Arabia' },
                  { value: 'israel', label: 'Israel' },
                  { value: 'turkey', label: 'Turkey' },
                  { value: 'south-africa', label: 'South Africa' },
                  { value: 'egypt', label: 'Egypt' },
                  { value: 'nigeria', label: 'Nigeria' },
                  { value: 'kenya', label: 'Kenya' },
                  { value: 'russia', label: 'Russia' },
                  { value: 'ukraine', label: 'Ukraine' },
                  { value: 'other', label: 'Other' },
                ]}
                placeholder="Type to search countries..."
              />
              {formData.q19_company_headquarters === 'other' && (
                <input
                  type="text"
                  placeholder="Please specify your country"
                  value={formData.q19_company_headquarters_other || ''}
                  onChange={(e) => setFormData({ ...formData, q19_company_headquarters_other: e.target.value })}
                  className="mt-3 w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-white/40 rounded-xl text-[#1F4D3D] placeholder-[#2D6A4F]/60 focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60 focus:bg-white/70"
                />
              )}
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-white/40">
              <p className="text-sm text-emerald-700 mb-3 font-medium flex items-center gap-2">
                <span className="bg-emerald-100 px-2 py-1 rounded">Question 4 of 4</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F4D3D] mb-6 leading-tight">
                What percentage of your B2B sales are international?
              </h2>
              <div className="space-y-3">
                {[
                  { value: '0-10', label: '0-10%' },
                  { value: '10-25', label: '10-25%' },
                  { value: '25-50', label: '25-50%' },
                  { value: '50-75', label: '50-75%' },
                  { value: '75-100', label: '75-100%' },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setFormData({ ...formData, q20_international_sales_percentage: option.value })}
                    className={`p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 shadow-sm flex items-center gap-3 ${
                      formData.q20_international_sales_percentage === option.value
                        ? 'bg-emerald-600 border-emerald-700 shadow-md'
                        : 'bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60 hover:border-white/50'
                    }`}
                  >
                    {formData.q20_international_sales_percentage === option.value && (
                      <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className={`text-lg font-medium ${formData.q20_international_sales_percentage === option.value ? 'text-white' : 'text-[#1F4D3D]'}`}>{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'email-capture':
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-[#1F4D3D] mb-4">
                Thank You! Together, We're Creating Safer Ways for Businesses to Sell on Credit. 🤝
              </h2>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-6 md:p-8 border-2 border-emerald-200">
              {/* Get access to survey report Section */}
              <div className="mb-8">
                <label
                  className={`flex items-start p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                    formData.wantsStayInTouch
                      ? 'bg-emerald-600 border-emerald-700 shadow-md'
                      : 'bg-white hover:bg-emerald-50 hover:border-emerald-300 border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.wantsStayInTouch}
                    onChange={(e) => setFormData({ ...formData, wantsStayInTouch: e.target.checked })}
                    className={`w-6 h-6 flex-shrink-0 rounded focus:ring-emerald-300 focus:ring-2 mt-1 ${
                      formData.wantsStayInTouch ? 'text-white accent-white' : 'text-emerald-600'
                    }`}
                  />
                  <div className="ml-4">
                    <div className={`font-bold text-lg ${formData.wantsStayInTouch ? 'text-white' : 'text-[#1F4D3D]'}`}>Get Access to the Survey Report</div>
                    <div className={`mt-1 ${formData.wantsStayInTouch ? 'text-emerald-50' : 'text-gray-600'}`}>
                      Nobody likes answering surveys without seeing the results. Share your email if you'd like to receive the findings of this research*.
                    </div>
                  </div>
                </label>
              </div>

              <h3 className="text-2xl font-bold text-[#1F4D3D] mb-6">
                We'd love to hear more about the credit management challenges you're facing
              </h3>

              <div className="space-y-4 mb-6">
                <label
                  className={`flex items-start p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                    formData.wantsConsultation
                      ? 'bg-emerald-600 border-emerald-700 shadow-md'
                      : 'bg-white hover:bg-emerald-50 hover:border-emerald-300 border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.wantsConsultation}
                    onChange={(e) => setFormData({ ...formData, wantsConsultation: e.target.checked })}
                    className={`w-6 h-6 flex-shrink-0 rounded focus:ring-emerald-300 focus:ring-2 mt-1 ${
                      formData.wantsConsultation ? 'text-white accent-white' : 'text-emerald-600'
                    }`}
                  />
                  <div className="ml-4">
                    <div className={`font-bold text-lg ${formData.wantsConsultation ? 'text-white' : 'text-[#1F4D3D]'}`}>Challenge Mapping Session</div>
                    <div className={`mt-1 ${formData.wantsConsultation ? 'text-emerald-50' : 'text-gray-600'}`}>
                      15-minute conversation to discuss your biggest challenges in managing the risks that come with selling on credit
                    </div>
                  </div>
                </label>
              </div>

              {(formData.wantsStayInTouch || formData.wantsConsultation) && (
                <div className="space-y-4 pt-6 border-t-2 border-emerald-200">
                  <div>
                    <label className="block text-base font-semibold text-[#1F4D3D] mb-2">
                      Email Address {(formData.wantsStayInTouch || formData.wantsConsultation) && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-semibold text-[#1F4D3D] mb-2">
                        Name {(formData.wantsStayInTouch || formData.wantsConsultation) ? <span className="text-red-500">*</span> : '(Optional)'}
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-semibold text-[#1F4D3D] mb-2">
                        Company Name {(formData.wantsStayInTouch || formData.wantsConsultation) ? <span className="text-red-500">*</span> : '(Optional)'}
                      </label>
                      <input
                        type="text"
                        placeholder="Your Company Ltd."
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {formData.wantsConsultation && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t-2 border-emerald-200">
                        <div>
                          <label className="block text-base font-semibold text-[#1F4D3D] mb-2">
                            Phone (Optional)
                          </label>
                          <input
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={formData.consultationPhone}
                            onChange={(e) => setFormData({ ...formData, consultationPhone: e.target.value })}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-base font-semibold text-[#1F4D3D] mb-2">
                            Best Time to Contact (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Weekday mornings"
                            value={formData.consultationBestTime}
                            onChange={(e) => setFormData({ ...formData, consultationBestTime: e.target.value })}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-3">Or schedule directly:</p>
                          <a
                            href="https://calendly.com/javiersg/30min"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Schedule Meeting on Calendly
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Confidentiality Disclaimer */}
              <div className="mt-8 p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-emerald-200">
                <p className="text-xs text-[#2D6A4F] leading-relaxed">
                  *Findings will be shared once a sufficient number of responses have been collected and analyzed. Your individual answers will remain fully confidential, and only aggregated data will be reported.
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Check if current section can proceed
  const canProceed = () => {
    switch (currentSectionId) {
      case 'qualification':
        return (
          formData.q1_b2b_percentage &&
          formData.q2_role &&
          // If "other" is selected, require text input
          (formData.q2_role !== 'other' || (formData.q2_role_other && formData.q2_role_other.trim() !== ''))
        )
      case 'payment-terms':
        return formData.q3_payment_terms && formData.q3_payment_terms !== ''
      case 'bad-debt-question':
        return formData.q4_bad_debt_experience
      case 'bad-debt-details':
        return formData.q5_bad_debt_amount && (formData.q6_bad_debt_impact ?? 0) > 0 && formData.q7_changed_approach
      case 'bad-debt-changes':
        return (
          formData.q7a_changes_made &&
          formData.q7a_changes_made.length > 0 &&
          // If "other" is selected, require text input
          (!formData.q7a_changes_made.includes('other') || (formData.q7a_changes_other && formData.q7a_changes_other.trim() !== ''))
        )
      case 'current-practices':
        return (
          formData.q8_credit_assessment_methods && formData.q8_credit_assessment_methods.length > 0 &&
          formData.q9_ar_tracking_tools && formData.q9_ar_tracking_tools.length > 0 &&
          formData.q10_risk_mechanisms && formData.q10_risk_mechanisms.length > 0 &&
          // If "other" is selected in Q10, require text input
          (!formData.q10_risk_mechanisms.includes('other') || (formData.q10_risk_mechanisms_other && formData.q10_risk_mechanisms_other.trim() !== ''))
        )
      case 'tci-questions':
        return (
          formData.q11_tci_duration &&
          formData.q12_tci_coverage &&
          // If "other" is selected in Q12, require text input
          (formData.q12_tci_coverage !== 'other' || (formData.q12_tci_coverage_other && formData.q12_tci_coverage_other.trim() !== '')) &&
          formData.q13_tci_provider && formData.q13_tci_provider.length > 0 &&
          // If "other" is selected in Q13, require text input
          (!formData.q13_tci_provider.includes('other') || (formData.q13_tci_provider_other && formData.q13_tci_provider_other.trim() !== '')) &&
          formData.q14_tci_interaction_frequency &&
          (formData.q15_tci_satisfaction ?? 0) > 0 &&
          formData.q16_tci_challenges && formData.q16_tci_challenges.length > 0 &&
          // If "other" is selected in Q16, require text input
          (!formData.q16_tci_challenges.includes('other') || (formData.q16_tci_challenges_other && formData.q16_tci_challenges_other.trim() !== ''))
        )
      case 'tci-non-usage':
        return (
          formData.q10a_tci_non_usage_reasons &&
          formData.q10a_tci_non_usage_reasons.length > 0 &&
          // If "other" is selected, require text input
          (!formData.q10a_tci_non_usage_reasons.includes('other') || (formData.q10a_tci_non_usage_reasons_other && formData.q10a_tci_non_usage_reasons_other.trim() !== ''))
        )
      case 'company-profile':
        return (
          formData.q17_annual_revenue &&
          formData.q18_primary_industry &&
          // If "other" is selected in Q18, require text input
          (formData.q18_primary_industry !== 'other' || (formData.q18_primary_industry_other && formData.q18_primary_industry_other.trim() !== '')) &&
          formData.q19_company_headquarters &&
          // If "other" is selected in Q19, require text input
          (formData.q19_company_headquarters !== 'other' || (formData.q19_company_headquarters_other && formData.q19_company_headquarters_other.trim() !== '')) &&
          formData.q20_international_sales_percentage
        )
      case 'email-capture':
        if (formData.wantsStayInTouch || formData.wantsConsultation) {
          return (
            formData.email &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
            formData.contactName &&
            formData.contactName.trim() !== '' &&
            formData.companyName &&
            formData.companyName.trim() !== ''
          )
        }
        return true
      default:
        return false
    }
  }

  const isLastSection = () => {
    const sections = getSectionOrder()
    return currentSectionId === sections[sections.length - 1]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F4D3D] via-[#2D6A4F] to-[#1F4D3D] relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Progress Bar - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50 w-full bg-[#1F4D3D]/90 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-emerald-100">Survey Progress</span>
            <span className="text-lg font-bold text-white">{getCurrentProgress()}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-emerald-300 h-3 rounded-full transition-all duration-500 ease-out shadow-lg shadow-emerald-500/50"
              style={{ width: `${getCurrentProgress()}%` }}
            />
          </div>
          <p className="text-xs text-emerald-200 mt-2 font-medium">
            Section {getCurrentSectionNumber()} of {getTotalSections()}
          </p>
        </div>
      </div>

      {/* Main Content - Added top padding for fixed header */}
      <main className="relative z-10 container mx-auto px-6 py-12 pt-32">
        <div className="max-w-3xl mx-auto">
          <div className="bg-emerald-50/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-emerald-200/50 transition-all duration-300">
            {renderSection()}

            {/* Navigation Buttons */}
            <div className="flex flex-col gap-4 mt-8 pt-8 border-t border-emerald-200">
              {!canProceed() && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-amber-800 font-medium">
                    {currentSectionId === 'email-capture' && formData.wantsConsultation
                      ? '📧 Please provide your email address, Name and Company Name to continue'
                      : '👆 Please complete all required fields above to continue'}
                  </p>
                </div>
              )}
              <div className="flex gap-4">
                {getCurrentSectionNumber() > 1 && (
                  <button
                    onClick={handleBack}
                    className="flex-1 bg-white/40 hover:bg-white/60 text-[#1F4D3D] font-semibold py-4 px-6 rounded-xl transition duration-200 shadow-md hover:shadow-lg border-2 border-white/30 hover:border-white/50 backdrop-blur-sm"
                  >
                    ← Back
                  </button>
                )}
                {isLastSection() ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed() || isSubmitting}
                    className={`flex-1 font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg ${
                      canProceed() && !isSubmitting
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white hover:shadow-xl hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Survey ✓'}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className={`flex-1 font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg group relative ${
                      canProceed()
                        ? 'bg-gradient-to-r from-[#2D6A4F] to-[#1F4D3D] hover:from-[#1F4D3D] hover:to-[#2D6A4F] text-white hover:shadow-xl hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center justify-center">
                      Next
                      {canProceed() && (
                        <>
                          <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <span className="ml-2 text-xs opacity-70 hidden sm:inline">or press Enter ↵</span>
                        </>
                      )}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 border-t border-white/10 mt-8">
          <div className="text-center">
            <p className="text-sm text-emerald-200">
              Any questions? Contact us at{' '}
              <a href="mailto:javiersg@mit.edu" className="text-emerald-400 hover:text-emerald-300 font-medium">javiersg@mit.edu</a>
              {' '}or{' '}
              <a href="mailto:sergio51@mit.edu" className="text-emerald-400 hover:text-emerald-300 font-medium">sergio51@mit.edu</a>
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
