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
  q3_payment_terms?: string
  q4_bad_debt_experience?: string
  q5_bad_debt_amount?: string
  q6_bad_debt_impact?: number
  q17_annual_revenue?: string
  q18_primary_industry?: string
  q19_company_headquarters?: string
  screenedOut: boolean
  usesTCI: boolean
  surveyPath?: string
  totalQuestions?: number
  completionTime?: number
  wantsStayInTouch: boolean
  wantsConsultation: boolean
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <p className="text-slate-400 text-sm">TCI Users</p>
                  <p className="text-3xl font-bold text-purple-400 mt-2">{stats.tciUsers}</p>
                </div>
                <Calendar className="w-12 h-12 text-purple-400" />
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
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Uses TCI</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Survey Path</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {responses.map((response) => (
                    <tr key={response._id} className="hover:bg-slate-700/50 transition">
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
                      <td className="px-6 py-4 text-sm">
                        {response.usesTCI ? (
                          <span className="text-green-400 font-medium">Yes</span>
                        ) : (
                          <span className="text-slate-500">No</span>
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
      </main>
    </div>
  )
}
