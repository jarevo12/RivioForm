'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users, Clock, CheckCircle, Mail, Calendar, LogOut } from 'lucide-react'
import { API_ENDPOINTS } from '../config/api'

interface SurveyResponse {
  _id: string
  email?: string
  contactName?: string
  companyName?: string
  q1_b2b_percentage: string
  q2_role?: string
  q2_role_other?: string
  q3_payment_terms?: string
  q4_bad_debt_experience?: string
  q5_bad_debt_amount?: string
  q6_bad_debt_impact?: number
  q7_changed_approach?: string
  q7a_changes_made?: string[]
  q7a_changes_other?: string
  q8_credit_assessment_methods?: string[]
  q9_ar_tracking_tools?: string[]
  q10_risk_mechanisms?: string[]
  q10_risk_mechanisms_other?: string
  q10a_tci_non_usage_reasons?: string[]
  q10a_tci_non_usage_reasons_other?: string
  q11_tci_duration?: string
  q12_tci_coverage?: string
  q12_tci_coverage_other?: string
  q13_tci_provider?: string[]
  q13_tci_provider_other?: string
  q14_tci_interaction_frequency?: string
  q15_tci_satisfaction?: number
  q16_tci_challenges?: string[]
  q16_tci_challenges_other?: string
  q17_annual_revenue?: string
  q18_primary_industry?: string
  q18_primary_industry_other?: string
  q19_company_headquarters?: string
  q19_company_headquarters_other?: string
  q20_international_sales_percentage?: string
  screenedOut: boolean
  usesTCI: boolean
  surveyPath?: string
  totalQuestions?: number
  completionTime?: number
  wantsStayInTouch: boolean
  wantsBenchmarkReport?: boolean
  wantsResearchReport?: boolean
  wantsConsultation: boolean
  consultationPhone?: string
  consultationBestTime?: string
  createdAt: string
  submittedAt: string
}

interface Stats {
  total: number
  screenedOut: number
  completed: number
  byPath: Array<{
    _id: string
    count: number
  }>
  byIndustry: Array<{
    _id: string
    count: number
  }>
  tciUsers: number
  surveyReportRequests: number
  challengeMappingRequests: number
  avgCompletionTime: number
  emailCaptureRate: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pathFilter, setPathFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminUsername, setAdminUsername] = useState('')
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Authentication check
  useEffect(() => {
    const token = sessionStorage.getItem('adminToken')
    const username = sessionStorage.getItem('adminUsername')

    if (!token) {
      router.push('/admin/login')
      return
    }

    setIsAuthenticated(true)
    setAdminUsername(username || 'Admin')
  }, [router])

  useEffect(() => {
    // Set initial time on client-side only to avoid hydration mismatch
    setCurrentTime(new Date().toLocaleTimeString())

    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchData()
  }, [currentPage, pathFilter])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch survey responses
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      })
      if (pathFilter !== 'all') {
        params.append('surveyPath', pathFilter)
      }
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const [responsesRes, statsRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.survey}?${params}`),
        fetch(`${API_ENDPOINTS.survey}/stats`)
      ])

      if (responsesRes.ok) {
        const responsesData = await responsesRes.json()
        setResponses(responsesData.data)
        setTotalPages(responsesData.pagination.pages)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      } else {
        console.error('Failed to fetch stats:', await statsRes.text())
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPathCount = (path: string): number => {
    if (!stats) return 0
    const pathData = stats.byPath.find(p => p._id === path)
    return pathData ? pathData.count : 0
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchData()
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken')
    sessionStorage.removeItem('adminUsername')
    router.push('/admin/login')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCompletionTime = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  const getPathBadge = (path?: string) => {
    const colors = {
      'no-bad-debt-no-tci': 'bg-blue-900 text-blue-200 border-blue-700',
      'bad-debt-no-tci': 'bg-orange-900 text-orange-200 border-orange-700',
      'no-bad-debt-with-tci': 'bg-purple-900 text-purple-200 border-purple-700',
      'full-path': 'bg-green-900 text-green-200 border-green-700',
      'screened-out': 'bg-red-900 text-red-200 border-red-700',
    }
    return colors[path as keyof typeof colors] || 'bg-gray-900 text-gray-200 border-gray-700'
  }

  const formatFieldValue = (value: any) => {
    if (value === undefined || value === null || value === '') return 'N/A'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (Array.isArray(value)) return value.join(', ')
    if (typeof value === 'string') {
      // Format enum values to be more readable
      return value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }
    return String(value)
  }

  // Don't render until authentication is checked
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Survey Response Dashboard</h1>
              <p className="text-slate-400 mt-1">Credit Risk Management Survey Results</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-slate-400">Logged in as</p>
                <p className="text-white font-medium">{adminUsername}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Last updated</p>
                <p className="text-white font-medium">{currentTime || '--:--:--'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Responses</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                </div>
                <Users className="w-12 h-12 text-blue-400" />
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{stats.completed}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Survey Report</p>
                  <p className="text-3xl font-bold text-cyan-400 mt-2">{stats.surveyReportRequests || 0}</p>
                </div>
                <Mail className="w-12 h-12 text-cyan-400" />
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Mapping Sessions</p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">{stats.challengeMappingRequests || 0}</p>
                </div>
                <Calendar className="w-12 h-12 text-orange-400" />
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">TCI Users</p>
                  <p className="text-3xl font-bold text-purple-400 mt-2">{stats.tciUsers}</p>
                </div>
                <Users className="w-12 h-12 text-purple-400" />
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Time</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-2">{formatCompletionTime(Math.round(stats.avgCompletionTime))}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-400" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                Search
              </button>
            </form>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Survey Path</label>
              <select
                value={pathFilter}
                onChange={(e) => { setPathFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All Paths</option>
                <option value="no-bad-debt-no-tci">No Bad Debt, No TCI</option>
                <option value="bad-debt-no-tci">Bad Debt, No TCI</option>
                <option value="no-bad-debt-with-tci">No Bad Debt, With TCI</option>
                <option value="full-path">Full Path (Bad Debt + TCI)</option>
                <option value="screened-out">Screened Out</option>
              </select>
            </div>
          </div>
        </div>

        {/* Survey Responses Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-slate-300">Loading responses...</p>
              </div>
            ) : responses.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No responses found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-900 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Industry</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Bad Debt</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Survey Report</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Mapping Session</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Survey Path</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {responses.map((response) => (
                    <tr
                      key={response._id}
                      onClick={() => { setSelectedResponse(response); setShowDetailModal(true); }}
                      className="hover:bg-slate-700/50 transition cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">{response.contactName || 'N/A'}</div>
                        {response.email && (
                          <div className="flex items-center text-xs text-slate-400 mt-1">
                            <Mail className="w-3 h-3 mr-1" />
                            {response.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {response.companyName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {formatFieldValue(response.q2_role)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {formatFieldValue(response.q18_primary_industry)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {formatFieldValue(response.q17_annual_revenue)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {formatFieldValue(response.q4_bad_debt_experience)}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        {response.wantsStayInTouch ? (
                          <span className="text-cyan-400 font-medium">✓</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        {response.wantsConsultation ? (
                          <span className="text-orange-400 font-medium">✓</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPathBadge(response.surveyPath)}`}>
                          {formatFieldValue(response.surveyPath)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(response.submittedAt)}
                        <div className="text-xs text-slate-500 mt-1">
                          {formatCompletionTime(response.completionTime)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-slate-900 px-6 py-4 border-t border-slate-700 flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Response Modal */}
        {showDetailModal && selectedResponse && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
            <div className="min-h-screen px-4 py-8 flex items-center justify-center">
              <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-5xl w-full shadow-2xl">
                {/* Modal Header */}
                <div className="bg-slate-900 border-b border-slate-700 px-8 py-6 flex items-center justify-between rounded-t-xl">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Survey Response Details</h2>
                    <p className="text-slate-400 mt-1">
                      {selectedResponse.contactName || 'Anonymous'} • {selectedResponse.companyName || 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => { setShowDetailModal(false); setSelectedResponse(null); }}
                    className="text-slate-400 hover:text-white transition p-2 hover:bg-slate-700 rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                  {/* Contact Information */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Name</p>
                        <p className="text-white font-medium">{selectedResponse.contactName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Email</p>
                        <p className="text-white font-medium">{selectedResponse.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Company</p>
                        <p className="text-white font-medium">{selectedResponse.companyName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Survey Path</p>
                        <p className="text-white font-medium">{formatFieldValue(selectedResponse.surveyPath)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Qualification Questions */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">Qualification</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-400">Q1: B2B Sales Percentage</p>
                        <p className="text-white">{formatFieldValue(selectedResponse.q1_b2b_percentage)}</p>
                      </div>
                      {!selectedResponse.screenedOut && (
                        <div>
                          <p className="text-sm text-slate-400">Q2: Role</p>
                          <p className="text-white">{formatFieldValue(selectedResponse.q2_role)}</p>
                          {selectedResponse.q2_role_other && (
                            <p className="text-slate-300 text-sm mt-1">Other: {selectedResponse.q2_role_other}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Credit Management */}
                  {!selectedResponse.screenedOut && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">Credit Management</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-400">Q3: Payment Terms</p>
                          <p className="text-white">{formatFieldValue(selectedResponse.q3_payment_terms)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Q4: Bad Debt Experience</p>
                          <p className="text-white">{formatFieldValue(selectedResponse.q4_bad_debt_experience)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bad Debt Section - Conditional */}
                  {(selectedResponse.q4_bad_debt_experience === 'yes-multiple' || selectedResponse.q4_bad_debt_experience === 'yes-once-or-twice') && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">Bad Debt Details</h3>
                      <div className="space-y-4">
                        {selectedResponse.q5_bad_debt_amount && (
                          <div>
                            <p className="text-sm text-slate-400">Q5: Bad Debt Amount</p>
                            <p className="text-white">{formatFieldValue(selectedResponse.q5_bad_debt_amount)}</p>
                          </div>
                        )}
                        {selectedResponse.q6_bad_debt_impact && (
                          <div>
                            <p className="text-sm text-slate-400">Q6: Bad Debt Impact (1-5)</p>
                            <p className="text-white">{selectedResponse.q6_bad_debt_impact}</p>
                          </div>
                        )}
                        {selectedResponse.q7_changed_approach && (
                          <div>
                            <p className="text-sm text-slate-400">Q7: Changed Credit Approach</p>
                            <p className="text-white">{formatFieldValue(selectedResponse.q7_changed_approach)}</p>
                          </div>
                        )}
                        {selectedResponse.q7a_changes_made && selectedResponse.q7a_changes_made.length > 0 && (
                          <div>
                            <p className="text-sm text-slate-400">Q7a: Changes Made</p>
                            <p className="text-white">{formatFieldValue(selectedResponse.q7a_changes_made)}</p>
                            {selectedResponse.q7a_changes_other && (
                              <p className="text-slate-300 text-sm mt-1">Other: {selectedResponse.q7a_changes_other}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Current Practices */}
                  {!selectedResponse.screenedOut && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">Current Practices</h3>
                      <div className="space-y-4">
                        {selectedResponse.q8_credit_assessment_methods && (
                          <div>
                            <p className="text-sm text-slate-400">Q8: Credit Assessment Methods</p>
                            <p className="text-white">{formatFieldValue(selectedResponse.q8_credit_assessment_methods)}</p>
                          </div>
                        )}
                        {selectedResponse.q9_ar_tracking_tools && (
                          <div>
                            <p className="text-sm text-slate-400">Q9: AR Tracking Tools</p>
                            <p className="text-white">{formatFieldValue(selectedResponse.q9_ar_tracking_tools)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Risk Mitigation */}
                  {!selectedResponse.screenedOut && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">Risk Mitigation</h3>
                      <div className="space-y-4">
                        {selectedResponse.q10_risk_mechanisms && (
                          <div>
                            <p className="text-sm text-slate-400">Q10: Risk Mechanisms</p>
                            <p className="text-white">{formatFieldValue(selectedResponse.q10_risk_mechanisms)}</p>
                            {selectedResponse.q10_risk_mechanisms_other && (
                              <p className="text-slate-300 text-sm mt-1">Other: {selectedResponse.q10_risk_mechanisms_other}</p>
                            )}
                          </div>
                        )}
                        {selectedResponse.q10a_tci_non_usage_reasons && selectedResponse.q10a_tci_non_usage_reasons.length > 0 && (
                          <div>
                            <p className="text-sm text-slate-400">Q10a: TCI Non-Usage Reasons</p>
                            <p className="text-white">{formatFieldValue(selectedResponse.q10a_tci_non_usage_reasons)}</p>
                            {selectedResponse.q10a_tci_non_usage_reasons_other && (
                              <p className="text-slate-300 text-sm mt-1">Other: {selectedResponse.q10a_tci_non_usage_reasons_other}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TCI Deep Dive - Conditional */}
                  {selectedResponse.usesTCI && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">TCI Deep Dive</h3>
                      <div className="space-y-4">
                        {selectedResponse.q11_tci_duration && (
                          <div>
                            <p className="text-sm text-slate-400">Q11: TCI Duration</p>
                            <p className="text-white">{formatFieldValue(selectedResponse.q11_tci_duration)}</p>
                          </div>
                        )}
                        {selectedResponse.q12_tci_coverage && (
                          <div>
                            <p className="text-sm text-slate-400">Q12: TCI Coverage</p>
                            <p className="text-white">{formatFieldValue(selectedResponse.q12_tci_coverage)}</p>
                            {selectedResponse.q12_tci_coverage_other && (
                              <p className="text-slate-300 text-sm mt-1">Other: {selectedResponse.q12_tci_coverage_other}</p>
                            )}
                          </div>
                        )}
                        {selectedResponse.q13_tci_provider && (
                          <div>
                            <p className="text-sm text-slate-400">Q13: TCI Provider</p>
                            <p className="text-white">{formatFieldValue(selectedResponse.q13_tci_provider)}</p>
                            {selectedResponse.q13_tci_provider_other && (
                              <p className="text-slate-300 text-sm mt-1">Other: {selectedResponse.q13_tci_provider_other}</p>
                            )}
                          </div>
                        )}
                        {selectedResponse.q14_tci_interaction_frequency && (
                          <div>
                            <p className="text-sm text-slate-400">Q14: TCI Interaction Frequency</p>
                            <p className="text-white">{formatFieldValue(selectedResponse.q14_tci_interaction_frequency)}</p>
                          </div>
                        )}
                        {selectedResponse.q15_tci_satisfaction && (
                          <div>
                            <p className="text-sm text-slate-400">Q15: TCI Satisfaction (1-5)</p>
                            <p className="text-white">{selectedResponse.q15_tci_satisfaction}</p>
                          </div>
                        )}
                        {selectedResponse.q16_tci_challenges && (
                          <div>
                            <p className="text-sm text-slate-400">Q16: TCI Challenges</p>
                            <p className="text-white">{formatFieldValue(selectedResponse.q16_tci_challenges)}</p>
                            {selectedResponse.q16_tci_challenges_other && (
                              <p className="text-slate-300 text-sm mt-1">Other: {selectedResponse.q16_tci_challenges_other}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Company Profile */}
                  {!selectedResponse.screenedOut && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">Company Profile</h3>
                      <div className="space-y-4">
                        {selectedResponse.q17_annual_revenue && (
                          <div>
                            <p className="text-sm text-slate-400">Q17: Annual Revenue</p>
                            <p className="text-white">{formatFieldValue(selectedResponse.q17_annual_revenue)}</p>
                          </div>
                        )}
                        {selectedResponse.q18_primary_industry && (
                          <div>
                            <p className="text-sm text-slate-400">Q18: Primary Industry</p>
                            <p className="text-white">{formatFieldValue(selectedResponse.q18_primary_industry)}</p>
                            {selectedResponse.q18_primary_industry_other && (
                              <p className="text-slate-300 text-sm mt-1">Other: {selectedResponse.q18_primary_industry_other}</p>
                            )}
                          </div>
                        )}
                        {selectedResponse.q19_company_headquarters && (
                          <div>
                            <p className="text-sm text-slate-400">Q19: Company Headquarters</p>
                            <p className="text-white">{formatFieldValue(selectedResponse.q19_company_headquarters)}</p>
                            {selectedResponse.q19_company_headquarters_other && (
                              <p className="text-slate-300 text-sm mt-1">Other: {selectedResponse.q19_company_headquarters_other}</p>
                            )}
                          </div>
                        )}
                        {selectedResponse.q20_international_sales_percentage && (
                          <div>
                            <p className="text-sm text-slate-400">Q20: International Sales %</p>
                            <p className="text-white">{formatFieldValue(selectedResponse.q20_international_sales_percentage)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Deliverables */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">Requested Deliverables</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <span className="text-slate-300">Survey Report</span>
                        {selectedResponse.wantsStayInTouch ? (
                          <span className="text-cyan-400 font-medium">✓ Yes</span>
                        ) : (
                          <span className="text-slate-500">No</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <span className="text-slate-300">Challenge Mapping Session</span>
                        {selectedResponse.wantsConsultation ? (
                          <span className="text-orange-400 font-medium">✓ Yes</span>
                        ) : (
                          <span className="text-slate-500">No</span>
                        )}
                      </div>
                      {selectedResponse.wantsConsultation && selectedResponse.consultationPhone && (
                        <div className="p-3 bg-slate-700/50 rounded-lg">
                          <p className="text-sm text-slate-400">Phone</p>
                          <p className="text-white">{selectedResponse.consultationPhone}</p>
                        </div>
                      )}
                      {selectedResponse.wantsConsultation && selectedResponse.consultationBestTime && (
                        <div className="p-3 bg-slate-700/50 rounded-lg">
                          <p className="text-sm text-slate-400">Best Time to Contact</p>
                          <p className="text-white">{selectedResponse.consultationBestTime}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">Survey Metadata</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Submitted At</p>
                        <p className="text-white">{formatDate(selectedResponse.submittedAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Completion Time</p>
                        <p className="text-white">{formatCompletionTime(selectedResponse.completionTime)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Total Questions</p>
                        <p className="text-white">{selectedResponse.totalQuestions || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Response ID</p>
                        <p className="text-white text-xs font-mono">{selectedResponse._id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-slate-900 border-t border-slate-700 px-8 py-4 rounded-b-xl flex justify-end">
                  <button
                    onClick={() => { setShowDetailModal(false); setSelectedResponse(null); }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
