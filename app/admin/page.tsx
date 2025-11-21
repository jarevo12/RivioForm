'use client'

import { useState, useEffect } from 'react'
import { Search, Users, Clock, CheckCircle, Mail, Calendar } from 'lucide-react'
import { API_ENDPOINTS } from '../config/api'

interface Applicant {
  _id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  organization: string
  position: string
  phone?: string
  status: string
  giftCardSent: boolean
  ipAddress: string
  userAgent: string
  createdAt: string
  updatedAt: string
  interviewScheduledAt?: string
  interviewCompletedAt?: string
}

interface Stats {
  total: number
  byStatus: Array<{
    _id: string
    count: number
  }>
  giftCardsSent: number
}

export default function AdminDashboard() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [currentTime, setCurrentTime] = useState<string>('')

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
  }, [currentPage, statusFilter])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch applicants
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      })
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const [applicantsRes, statsRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.applicants}?${params}`),
        fetch(API_ENDPOINTS.applicantStats)
      ])

      if (applicantsRes.ok) {
        const applicantsData = await applicantsRes.json()
        setApplicants(applicantsData.data)
        setTotalPages(applicantsData.pagination.pages)
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

  const getStatusCount = (status: string): number => {
    if (!stats) return 0
    const statusData = stats.byStatus.find(s => s._id === status)
    return statusData ? statusData.count : 0
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchData()
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

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-900 text-yellow-200 border-yellow-700',
      contacted: 'bg-blue-900 text-blue-200 border-blue-700',
      scheduled: 'bg-purple-900 text-purple-200 border-purple-700',
      completed: 'bg-green-900 text-green-200 border-green-700',
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Rivio Admin Dashboard</h1>
              <p className="text-slate-400 mt-1">Manage applicants and track interviews</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Last updated</p>
              <p className="text-white font-medium">{currentTime || '--:--:--'}</p>
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
                  <p className="text-slate-400 text-sm">Total Applicants</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                </div>
                <Users className="w-12 h-12 text-blue-400" />
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Pending</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-2">{getStatusCount('pending')}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-400" />
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Scheduled</p>
                  <p className="text-3xl font-bold text-purple-400 mt-2">{getStatusCount('scheduled')}</p>
                </div>
                <Calendar className="w-12 h-12 text-purple-400" />
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{getStatusCount('completed')}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-400" />
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
                  placeholder="Search by name, email, or organization..."
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
              <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applicants Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-slate-300">Loading applicants...</p>
              </div>
            ) : applicants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No applicants found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-900 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Organization</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Applied</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Gift Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {applicants.map((applicant) => (
                    <tr key={applicant._id} className="hover:bg-slate-700/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{applicant.fullName}</div>
                        {applicant.phone && (
                          <div className="text-sm text-slate-400">{applicant.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-300">
                          <Mail className="w-4 h-4 mr-2 text-slate-500" />
                          {applicant.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {applicant.organization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {applicant.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(applicant.status)}`}>
                          {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {formatDate(applicant.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {applicant.giftCardSent ? (
                          <span className="text-green-400 font-medium">✓ Sent</span>
                        ) : (
                          <span className="text-slate-500">Not sent</span>
                        )}
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
