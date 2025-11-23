const React = require('react');

/**
 * Cover Page Component
 */
function CoverPage({ companyName, industry, revenueRange, contactName, reportDate }) {
  return (
    <div className="cover-page">
      {/* Logo placeholder - will be replaced with actual logo */}
      <div className="cover-logo">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="rivioGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#1e40af', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#14b8a6', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path
            d="M 40 60 Q 60 20, 100 40 T 160 60 Q 140 100, 100 120 T 40 140 Q 60 100, 100 80 Z"
            fill="url(#rivioGradient)"
          />
        </svg>
      </div>

      <h1 className="cover-title">
        Trade Credit Insurance<br />
        Benchmark Report
      </h1>

      <div className="cover-subtitle">
        Industry Insights & Personalized Recommendations
      </div>

      <div style={{ margin: '40pt 0' }}>
        <div className="cover-company">{companyName}</div>
        <div className="cover-details">
          {industry.charAt(0).toUpperCase() + industry.slice(1).replace(/-/g, ' ')}
        </div>
        <div className="cover-details">
          Revenue: {formatRevenueRange(revenueRange)}
        </div>
      </div>

      {contactName && (
        <div className="cover-details" style={{ marginTop: '20pt' }}>
          Prepared for: {contactName}
        </div>
      )}

      <div className="cover-date">
        Report Date: {new Date(reportDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>

      <div className="cover-confidential">
        Confidential
      </div>
    </div>
  );
}

function formatRevenueRange(range) {
  const ranges = {
    'under-5m': 'Under $5 million',
    '5m-25m': '$5 million - $25 million',
    '25m-100m': '$25 million - $100 million',
    '100m-500m': '$100 million - $500 million',
    'over-500m': 'Over $500 million',
  };
  return ranges[range] || range;
}

module.exports = CoverPage;
