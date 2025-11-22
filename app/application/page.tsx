'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { API_ENDPOINTS } from '../config/api'

// Define section types
type SectionId =
  | 'qualification'
  | 'payment-terms'
  | 'bad-debt-question'
  | 'bad-debt-details'
  | 'bad-debt-changes'
  | 'current-practices'
  | 'tci-questions'
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

    // Add TCI section if applicable
    if (usesTCI()) {
      sections.push('tci-questions')
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
    }
  }

  const handleBack = () => {
    const sections = getSectionOrder()
    const currentIndex = sections.indexOf(currentSectionId)

    if (currentIndex > 0) {
      setCurrentSectionId(sections[currentIndex - 1])
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

  // Render screened out message
  if (screenedOut) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-slate-800 rounded-2xl p-8 md:p-12 text-center shadow-2xl border border-slate-700">
            <h2 className="text-3xl font-semibold text-white mb-4">Thank You for Your Interest</h2>
            <p className="text-lg text-slate-300 mb-6">
              This survey focuses on B2B credit management practices. Based on your response,
              this survey may not be applicable to your business at this time.
            </p>
            <button
              onClick={() => {
                sessionStorage.clear()
                router.push('/landing')
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-green-900 border border-green-700 rounded-xl p-8 md:p-12 text-center mb-8">
              <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="text-3xl font-semibold text-white mb-4">Thank You!</h2>
              <p className="text-lg text-green-200 mb-4">
                Your insights will help shape better credit risk solutions.
              </p>
              <p className="text-md text-green-300">
                Your contribution joins <strong>500+ credit professionals</strong> who have shared their experiences.
              </p>
            </div>

            {formData.email && (
              <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
                <h3 className="text-xl font-semibold text-white mb-4">What Happens Next?</h3>
                <div className="text-left space-y-4 text-slate-300">
                  {formData.wantsBenchmarkReport && (
                    <p>• Personalized benchmark reports will be delivered within 2 weeks</p>
                  )}
                  {formData.wantsResearchReport && (
                    <p>• Full research report will arrive in ~6 weeks</p>
                  )}
                  {formData.wantsConsultation && (
                    <p>• We'll reach out to schedule your consultation in the next few days</p>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-6">
                  Your voice matters. Thank you for helping make credit management better for everyone!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderSection = () => {
    switch (currentSectionId) {
      case 'qualification':
        return (
          <div className="space-y-8">
            <div>
              <p className="text-sm text-slate-400 mb-6">Progress: Question 1 of ~17</p>
              <h2 className="text-2xl font-semibold text-white mb-4">
                What percentage of your company's sales are B2B (business-to-business)?
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'less-than-25', label: 'Less than 25%' },
                  { value: '25-50', label: '25-50%' },
                  { value: '51-75', label: '51-75%' },
                  { value: '76-100', label: '76-100%' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                    <input
                      type="radio"
                      name="q1"
                      value={option.value}
                      checked={formData.q1_b2b_percentage === option.value}
                      onChange={(e) => setFormData({ ...formData, q1_b2b_percentage: e.target.value })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="ml-3 text-white">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">What is your role?</h2>
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
                  <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                    <input
                      type="radio"
                      name="q2"
                      value={option.value}
                      checked={formData.q2_role === option.value}
                      onChange={(e) => setFormData({ ...formData, q2_role: e.target.value })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="ml-3 text-white">{option.label}</span>
                  </label>
                ))}
              </div>
              {formData.q2_role === 'other' && (
                <input
                  type="text"
                  placeholder="Please specify your role"
                  value={formData.q2_role_other}
                  onChange={(e) => setFormData({ ...formData, q2_role_other: e.target.value })}
                  className="mt-3 w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              )}
            </div>
          </div>
        )

      case 'payment-terms':
        return (
          <div className="space-y-8">
            <div>
              <p className="text-sm text-slate-400 mb-6">Progress: Section {getCurrentSectionNumber()} of {getTotalSections()}</p>
              <h2 className="text-2xl font-semibold text-white mb-4">
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
                  <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                    <input
                      type="radio"
                      name="q3"
                      value={option.value}
                      checked={formData.q3_payment_terms === option.value}
                      onChange={(e) => setFormData({ ...formData, q3_payment_terms: e.target.value })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="ml-3 text-white">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 'bad-debt-question':
        return (
          <div>
            <p className="text-sm text-slate-400 mb-6">Progress: Section {getCurrentSectionNumber()} of {getTotalSections()}</p>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Have you ever experienced significant payment defaults or bad debt from customers?
            </h2>
            <div className="space-y-3">
              {[
                { value: 'yes-multiple', label: 'Yes, multiple times' },
                { value: 'yes-once-or-twice', label: 'Yes, once or twice' },
                { value: 'no-never', label: 'No, never' },
                { value: 'prefer-not-say', label: 'Prefer not to say' },
              ].map((option) => (
                <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                  <input
                    type="radio"
                    name="q4"
                    value={option.value}
                    checked={formData.q4_bad_debt_experience === option.value}
                    onChange={(e) => setFormData({ ...formData, q4_bad_debt_experience: e.target.value })}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="ml-3 text-white">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'bad-debt-details':
        return (
          <div className="space-y-8">
            <div>
              <p className="text-sm text-slate-400 mb-6">Progress: Section {getCurrentSectionNumber()} of {getTotalSections()}</p>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Approximately how much has your company lost to bad debt over the past 5 years?
              </h2>
              <p className="text-sm text-slate-400 mb-4">
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
                  <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                    <input
                      type="radio"
                      name="q5"
                      value={option.value}
                      checked={formData.q5_bad_debt_amount === option.value}
                      onChange={(e) => setFormData({ ...formData, q5_bad_debt_amount: e.target.value })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="ml-3 text-white">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">
                How significantly did bad debt impact your business?
              </h2>
              <p className="text-sm text-slate-400 mb-4">1 = Minor inconvenience → 5 = Severe impact (threatened viability)</p>
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFormData({ ...formData, q6_bad_debt_impact: rating })}
                    className={`flex-1 py-4 px-6 rounded-lg font-semibold transition ${
                      formData.q6_bad_debt_impact === rating
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Did you change your credit risk management approach after these experiences?
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'yes-significant', label: 'Yes, made significant changes' },
                  { value: 'yes-minor', label: 'Yes, made minor adjustments' },
                  { value: 'no-same-approach', label: 'No, kept the same approach' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                    <input
                      type="radio"
                      name="q7"
                      value={option.value}
                      checked={formData.q7_changed_approach === option.value}
                      onChange={(e) => setFormData({ ...formData, q7_changed_approach: e.target.value })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="ml-3 text-white">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 'bad-debt-changes':
        return (
          <div>
            <p className="text-sm text-slate-400 mb-6">Progress: Section {getCurrentSectionNumber()} of {getTotalSections()}</p>
            <h2 className="text-2xl font-semibold text-white mb-2">
              What changes did you make?
            </h2>
            <p className="text-sm text-slate-400 mb-4">Select all that apply</p>
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
                <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                  <input
                    type="checkbox"
                    checked={formData.q7a_changes_made?.includes(option.value)}
                    onChange={(e) => handleCheckboxChange('q7a_changes_made', option.value, e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="ml-3 text-white">{option.label}</span>
                </label>
              ))}
            </div>
            {formData.q7a_changes_made?.includes('other') && (
              <input
                type="text"
                placeholder="Please specify other changes"
                value={formData.q7a_changes_other}
                onChange={(e) => setFormData({ ...formData, q7a_changes_other: e.target.value })}
                className="mt-3 w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}
          </div>
        )

      case 'current-practices':
        return (
          <div className="space-y-8">
            <div>
              <p className="text-sm text-slate-400 mb-6">Progress: Section {getCurrentSectionNumber()} of {getTotalSections()}</p>
              <h2 className="text-2xl font-semibold text-white mb-2">
                How do you determine credit terms for new customers?
              </h2>
              <p className="text-sm text-slate-400 mb-4">Select your top 3 methods</p>
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
                  <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                    <input
                      type="checkbox"
                      checked={formData.q8_credit_assessment_methods?.includes(option.value)}
                      onChange={(e) => handleCheckboxChange('q8_credit_assessment_methods', option.value, e.target.checked)}
                      disabled={!formData.q8_credit_assessment_methods?.includes(option.value) && (formData.q8_credit_assessment_methods?.length || 0) >= 3}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="ml-3 text-white">{option.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {formData.q8_credit_assessment_methods?.length || 0}/3 selected
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                What tools do you use to track Accounts Receivable?
              </h2>
              <p className="text-sm text-slate-400 mb-4">Select all that apply</p>
              <div className="space-y-3">
                {[
                  { value: 'erp-system', label: 'ERP system (SAP, Oracle, NetSuite, etc.)' },
                  { value: 'accounting-software', label: 'Accounting software (QuickBooks, Xero, Sage, etc.)' },
                  { value: 'ar-collections-software', label: 'Dedicated AR/Collections software' },
                  { value: 'spreadsheets', label: 'Spreadsheets (Excel/Google Sheets)' },
                  { value: 'no-specific-tools', label: "We don't use specific tools" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                    <input
                      type="checkbox"
                      checked={formData.q9_ar_tracking_tools?.includes(option.value)}
                      onChange={(e) => handleCheckboxChange('q9_ar_tracking_tools', option.value, e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="ml-3 text-white">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Which of these credit risk mechanisms does your company currently use?
              </h2>
              <p className="text-sm text-slate-400 mb-4">Select all that apply. Don't worry if you haven't heard of some—just skip those.</p>
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
                  <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                    <input
                      type="checkbox"
                      checked={formData.q10_risk_mechanisms?.includes(option.value)}
                      onChange={(e) => handleCheckboxChange('q10_risk_mechanisms', option.value, e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="ml-3 text-white">{option.label}</span>
                  </label>
                ))}
              </div>
              {formData.q10_risk_mechanisms?.includes('other') && (
                <input
                  type="text"
                  placeholder="Please specify other mechanisms"
                  value={formData.q10_risk_mechanisms_other}
                  onChange={(e) => setFormData({ ...formData, q10_risk_mechanisms_other: e.target.value })}
                  className="mt-3 w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              )}
            </div>
          </div>
        )

      case 'tci-questions':
        return (
          <div className="space-y-8">
            <div>
              <p className="text-sm text-slate-400 mb-6">Progress: Section {getCurrentSectionNumber()} of {getTotalSections()}</p>
              <h2 className="text-2xl font-semibold text-white mb-4">
                How long have you used trade credit insurance?
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'less-than-1-year', label: 'Less than 1 year' },
                  { value: '1-3-years', label: '1-3 years' },
                  { value: '3-5-years', label: '3-5 years' },
                  { value: 'over-5-years', label: 'Over 5 years' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                    <input
                      type="radio"
                      name="q11"
                      value={option.value}
                      checked={formData.q11_tci_duration === option.value}
                      onChange={(e) => setFormData({ ...formData, q11_tci_duration: e.target.value })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="ml-3 text-white">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">
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
                  <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                    <input
                      type="radio"
                      name="q12"
                      value={option.value}
                      checked={formData.q12_tci_coverage === option.value}
                      onChange={(e) => setFormData({ ...formData, q12_tci_coverage: e.target.value })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="ml-3 text-white">{option.label}</span>
                  </label>
                ))}
              </div>
              {formData.q12_tci_coverage === 'other' && (
                <input
                  type="text"
                  placeholder="Please specify coverage"
                  value={formData.q12_tci_coverage_other}
                  onChange={(e) => setFormData({ ...formData, q12_tci_coverage_other: e.target.value })}
                  className="mt-3 w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Who is your TCI provider?
              </h2>
              <p className="text-sm text-slate-400 mb-4">Please select all that apply</p>
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
                  <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                    <input
                      type="checkbox"
                      checked={formData.q13_tci_provider?.includes(option.value)}
                      onChange={(e) => handleCheckboxChange('q13_tci_provider', option.value, e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="ml-3 text-white">{option.label}</span>
                  </label>
                ))}
              </div>
              {formData.q13_tci_provider?.includes('other') && (
                <input
                  type="text"
                  placeholder="Please specify provider"
                  value={formData.q13_tci_provider_other}
                  onChange={(e) => setFormData({ ...formData, q13_tci_provider_other: e.target.value })}
                  className="mt-3 w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                How often do you interact with your insurer?
              </h2>
              <p className="text-sm text-slate-400 mb-4">
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
                  <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                    <input
                      type="radio"
                      name="q14"
                      value={option.value}
                      checked={formData.q14_tci_interaction_frequency === option.value}
                      onChange={(e) => setFormData({ ...formData, q14_tci_interaction_frequency: e.target.value })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="ml-3 text-white">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">
                How satisfied are you with your TCI provider overall?
              </h2>
              <p className="text-sm text-slate-400 mb-4">Very dissatisfied → Very satisfied</p>
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFormData({ ...formData, q15_tci_satisfaction: rating })}
                    className={`flex-1 py-4 px-6 rounded-lg font-semibold transition ${
                      formData.q15_tci_satisfaction === rating
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                What are your biggest challenges with trade credit insurance?
              </h2>
              <p className="text-sm text-slate-400 mb-4">Select up to 3</p>
              <div className="space-y-3">
                {[
                  { value: 'high-premiums', label: 'High premiums/cost' },
                  { value: 'slow-approval', label: 'Slow approval for credit limits' },
                  { value: 'complex-claims', label: 'Complex claims process' },
                  { value: 'coverage-gaps', label: 'Coverage gaps (certain customers/markets excluded)' },
                  { value: 'administrative-burden', label: 'Administrative burden/paperwork' },
                  { value: 'poor-communication', label: 'Poor communication or transparency' },
                  { value: 'difficult-integration', label: 'Difficult to integrate with our systems' },
                  { value: 'other', label: 'Other' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                    <input
                      type="checkbox"
                      checked={formData.q16_tci_challenges?.includes(option.value)}
                      onChange={(e) => handleCheckboxChange('q16_tci_challenges', option.value, e.target.checked)}
                      disabled={!formData.q16_tci_challenges?.includes(option.value) && (formData.q16_tci_challenges?.length || 0) >= 3}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="ml-3 text-white">{option.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {formData.q16_tci_challenges?.length || 0}/3 selected
              </p>
              {formData.q16_tci_challenges?.includes('other') && (
                <input
                  type="text"
                  placeholder="Please specify other challenges"
                  value={formData.q16_tci_challenges_other}
                  onChange={(e) => setFormData({ ...formData, q16_tci_challenges_other: e.target.value })}
                  className="mt-3 w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              )}
            </div>
          </div>
        )

      case 'company-profile':
        return (
          <div className="space-y-8">
            <div>
              <p className="text-sm text-slate-400 mb-6">Progress: Almost done! Final questions</p>
              <h2 className="text-2xl font-semibold text-white mb-4">
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
                  <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                    <input
                      type="radio"
                      name="q17"
                      value={option.value}
                      checked={formData.q17_annual_revenue === option.value}
                      onChange={(e) => setFormData({ ...formData, q17_annual_revenue: e.target.value })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="ml-3 text-white">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">
                What is your company's primary industry?
              </h2>
              <div className="space-y-3">
                {[
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
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                    <input
                      type="radio"
                      name="q18"
                      value={option.value}
                      checked={formData.q18_primary_industry === option.value}
                      onChange={(e) => setFormData({ ...formData, q18_primary_industry: e.target.value })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="ml-3 text-white">{option.label}</span>
                  </label>
                ))}
              </div>
              {formData.q18_primary_industry === 'other' && (
                <input
                  type="text"
                  placeholder="Please specify your industry"
                  value={formData.q18_primary_industry_other || ''}
                  onChange={(e) => setFormData({ ...formData, q18_primary_industry_other: e.target.value })}
                  className="mt-3 w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Where is your company headquartered?
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'united-states', label: 'United States' },
                  { value: 'canada', label: 'Canada' },
                  { value: 'united-kingdom', label: 'United Kingdom' },
                  { value: 'germany', label: 'Germany' },
                  { value: 'france', label: 'France' },
                  { value: 'netherlands', label: 'Netherlands' },
                  { value: 'belgium', label: 'Belgium' },
                  { value: 'spain', label: 'Spain' },
                  { value: 'italy', label: 'Italy' },
                  { value: 'switzerland', label: 'Switzerland' },
                  { value: 'australia', label: 'Australia' },
                  { value: 'china', label: 'China' },
                  { value: 'india', label: 'India' },
                  { value: 'japan', label: 'Japan' },
                  { value: 'singapore', label: 'Singapore' },
                  { value: 'other', label: 'Other' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                    <input
                      type="radio"
                      name="q19"
                      value={option.value}
                      checked={formData.q19_company_headquarters === option.value}
                      onChange={(e) => setFormData({ ...formData, q19_company_headquarters: e.target.value })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="ml-3 text-white">{option.label}</span>
                  </label>
                ))}
              </div>
              {formData.q19_company_headquarters === 'other' && (
                <input
                  type="text"
                  placeholder="Please specify your country"
                  value={formData.q19_company_headquarters_other || ''}
                  onChange={(e) => setFormData({ ...formData, q19_company_headquarters_other: e.target.value })}
                  className="mt-3 w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">
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
                  <label key={option.value} className="flex items-center p-4 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                    <input
                      type="radio"
                      name="q20"
                      value={option.value}
                      checked={formData.q20_international_sales_percentage === option.value}
                      onChange={(e) => setFormData({ ...formData, q20_international_sales_percentage: e.target.value })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="ml-3 text-white">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 'email-capture':
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-white mb-4">
                Thank You! Your Insights Will Help Shape Better Credit Risk Solutions.
              </h2>
              <p className="text-slate-300 mb-6">
                Your contribution joins <strong>500+ credit professionals</strong> who have shared their experiences.
              </p>
            </div>

            <div className="bg-slate-900 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Choose What You'd Like to Receive:
              </h3>

              <div className="space-y-4 mb-6">
                <label className="flex items-start p-4 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={formData.wantsBenchmarkReport}
                    onChange={(e) => setFormData({ ...formData, wantsBenchmarkReport: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded mt-1"
                  />
                  <div className="ml-3">
                    <div className="font-semibold text-white">Personalized Benchmark Report</div>
                    <div className="text-sm text-slate-400">
                      See how YOUR company compares to peers in your specific industry and size category
                    </div>
                  </div>
                </label>

                <label className="flex items-start p-4 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={formData.wantsResearchReport}
                    onChange={(e) => setFormData({ ...formData, wantsResearchReport: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded mt-1"
                  />
                  <div className="ml-3">
                    <div className="font-semibold text-white">Full Research Report</div>
                    <div className="text-sm text-slate-400">
                      Complete findings from all respondents, early access before public release
                    </div>
                  </div>
                </label>

                <label className="flex items-start p-4 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={formData.wantsConsultation}
                    onChange={(e) => setFormData({ ...formData, wantsConsultation: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded mt-1"
                  />
                  <div className="ml-3">
                    <div className="font-semibold text-white">Free Expert Consultation</div>
                    <div className="text-sm text-slate-400">
                      15-minute session with our research team to discuss your specific credit risk challenges
                    </div>
                  </div>
                </label>
              </div>

              {(formData.wantsBenchmarkReport || formData.wantsResearchReport || formData.wantsConsultation) && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email Address {(formData.wantsBenchmarkReport || formData.wantsResearchReport || formData.wantsConsultation) && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Company Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Your Company Ltd."
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  {formData.wantsConsultation && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.consultationPhone}
                          onChange={(e) => setFormData({ ...formData, consultationPhone: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Best Time to Contact (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Weekday mornings"
                          value={formData.consultationBestTime}
                          onChange={(e) => setFormData({ ...formData, consultationBestTime: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
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
        return formData.q1_b2b_percentage && formData.q2_role
      case 'payment-terms':
        return formData.q3_payment_terms && formData.q3_payment_terms !== ''
      case 'bad-debt-question':
        return formData.q4_bad_debt_experience
      case 'bad-debt-details':
        return formData.q5_bad_debt_amount && (formData.q6_bad_debt_impact ?? 0) > 0 && formData.q7_changed_approach
      case 'bad-debt-changes':
        return formData.q7a_changes_made && formData.q7a_changes_made.length > 0
      case 'current-practices':
        return (
          formData.q8_credit_assessment_methods && formData.q8_credit_assessment_methods.length > 0 &&
          formData.q9_ar_tracking_tools && formData.q9_ar_tracking_tools.length > 0 &&
          formData.q10_risk_mechanisms && formData.q10_risk_mechanisms.length > 0
        )
      case 'tci-questions':
        return (
          formData.q11_tci_duration &&
          formData.q12_tci_coverage &&
          formData.q13_tci_provider && formData.q13_tci_provider.length > 0 &&
          formData.q14_tci_interaction_frequency &&
          (formData.q15_tci_satisfaction ?? 0) > 0 &&
          formData.q16_tci_challenges && formData.q16_tci_challenges.length > 0
        )
      case 'company-profile':
        return (
          formData.q17_annual_revenue &&
          formData.q18_primary_industry &&
          formData.q19_company_headquarters &&
          formData.q20_international_sales_percentage
        )
      case 'email-capture':
        if (formData.wantsBenchmarkReport || formData.wantsResearchReport || formData.wantsConsultation) {
          return formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Progress Bar */}
      <div className="w-full bg-slate-900 border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Survey Progress</span>
            <span className="text-sm text-slate-400">{getCurrentProgress()}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCurrentProgress()}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Section {getCurrentSectionNumber()} of {getTotalSections()}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-800 rounded-2xl p-8 md:p-10 shadow-2xl border border-slate-700">
            {renderSection()}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 pt-8 border-t border-slate-700">
              {getCurrentSectionNumber() > 1 && (
                <button
                  onClick={handleBack}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                >
                  Back
                </button>
              )}
              {isLastSection() ? (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className={`flex-1 font-semibold py-3 px-6 rounded-lg transition duration-200 ${
                    canProceed() && !isSubmitting
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`flex-1 font-semibold py-3 px-6 rounded-lg transition duration-200 ${
                    canProceed()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
