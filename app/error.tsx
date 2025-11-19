'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <svg className="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Something Went Wrong</h2>
        <p className="text-slate-300 mb-6">
          We're having trouble loading this page. This is likely a temporary issue.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-200 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/landing'}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition duration-200 focus:outline-none focus:ring-4 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Go to Home
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-slate-400 text-sm cursor-pointer hover:text-slate-300">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 text-xs text-red-300 bg-slate-800 p-4 rounded overflow-auto max-h-48">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
