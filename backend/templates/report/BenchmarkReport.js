const React = require('react');
const CoverPage = require('./components/CoverPage');
const ExecutiveSummary = require('./components/ExecutiveSummary');

/**
 * Main Benchmark Report Template
 * Generates a complete 10-12 page PDF report
 */
function BenchmarkReport({
  surveyResponse,
  benchmarkResults,
  reportDate = new Date().toISOString(),
}) {
  const { peerGroup, calculations, recommendations, benchmarks } = benchmarkResults;

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>{`Benchmark Report - ${surveyResponse.companyName}`}</title>
        <link rel="stylesheet" href="./styles/reportStyles.css" />
        <style>{`
          body { margin: 0; padding: 0; }
        `}</style>
      </head>
      <body>
        {/* Cover Page */}
        <CoverPage
          companyName={surveyResponse.companyName || 'Your Company'}
          industry={surveyResponse.q18_primary_industry}
          revenueRange={surveyResponse.q17_annual_revenue}
          contactName={surveyResponse.contactName}
          reportDate={reportDate}
        />

        <div className="page-break"></div>

        {/* Executive Summary */}
        <ExecutiveSummary
          peerGroup={peerGroup}
          calculations={calculations}
          recommendations={recommendations}
        />

        <div className="page-break"></div>

        {/* Section 1: Industry Snapshot */}
        <IndustrySnapshot
          peerGroup={peerGroup}
          benchmarks={benchmarks}
          tciData={calculations.tci}
        />

        <div className="page-break"></div>

        {/* Section 2: Payment Terms Analysis */}
        <PaymentTermsAnalysis
          paymentTerms={calculations.paymentTerms}
          peerGroup={peerGroup}
        />

        <div className="page-break"></div>

        {/* Section 3: Bad Debt Experience */}
        <BadDebtAnalysis
          badDebt={calculations.badDebt}
          peerGroup={peerGroup}
        />

        <div className="page-break"></div>

        {/* Section 4: TCI Landscape (if applicable) */}
        {calculations.tci.userUsesTCI && (
          <>
            <TCILandscape surveyResponse={surveyResponse} />
            <div className="page-break"></div>
          </>
        )}

        {/* Section 5: Personalized Recommendations */}
        <RecommendationsSection
          recommendations={recommendations}
          savings={calculations.savings}
        />

        <div className="page-break"></div>

        {/* Appendix: Methodology & Sources */}
        <Appendix benchmarkResults={benchmarkResults} />
      </body>
    </html>
  );
}

/**
 * Industry Snapshot Section
 */
function IndustrySnapshot({ peerGroup, benchmarks, tciData }) {
  return (
    <div>
      <div className="section-header">
        <span className="section-number">1</span>
        <h2 style={{ display: 'inline' }}>Your Industry Snapshot</h2>
      </div>

      <h3>Trade Credit Insurance Adoption</h3>
      <p>{peerGroup.industryLabel} Companies by Revenue Size</p>

      {/* TCI Adoption Chart (Text-based) */}
      <div className="chart-container">
        <div className="chart-title">TCI Adoption Rate by Company Size</div>
        <div style={{ marginTop: '20pt' }}>
          {renderBarChart([
            { label: '<$5M', value: 0.28, isYou: false },
            { label: '$5-25M', value: 0.42, isYou: false },
            { label: '$25-100M', value: 0.58, isYou: true },
            { label: '$100-500M', value: 0.74, isYou: false },
            { label: '>$500M', value: 0.82, isYou: false },
          ])}
        </div>
        <div className="source-citation">{tciData.source}</div>
      </div>

      <div className="info-box" style={{ marginTop: '20pt' }}>
        <h4>Key Insights</h4>
        <ul className="bullet-list">
          <li>{tciData.peerAdoptionPercentage}% of companies in your segment use TCI</li>
          <li>Adoption increases with company size</li>
          <li>Your peers cite payment defaults as #1 driver for adoption</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Payment Terms Analysis Section
 */
function PaymentTermsAnalysis({ paymentTerms, peerGroup }) {
  return (
    <div>
      <div className="section-header">
        <span className="section-number">2</span>
        <h2 style={{ display: 'inline' }}>Payment Terms Analysis</h2>
      </div>

      <h3>Standard Payment Terms - {peerGroup.industryLabel}</h3>

      {/* Payment Terms Distribution */}
      <div className="chart-container">
        <div style={{ marginTop: '15pt' }}>
          {renderDistributionBars(paymentTerms.termsDistribution, paymentTerms.userTerms)}
        </div>
      </div>

      <div className="highlight-box" style={{ marginTop: '20pt' }}>
        <h4>Your Payment Terms: {paymentTerms.userTerms}</h4>
        <div className="grid-2" style={{ marginTop: '12pt' }}>
          <div>
            <strong>Your DSO:</strong> {paymentTerms.userDays} days
          </div>
          <div>
            <strong>Industry Average:</strong> {paymentTerms.avgDays} days
          </div>
          <div>
            <strong>Difference:</strong> {paymentTerms.difference > 0 ? '+' : ''}{paymentTerms.difference} days
          </div>
          <div>
            <strong>Median DSO:</strong> {paymentTerms.medianDSO} days
          </div>
        </div>
      </div>

      {paymentTerms.position === 'extended' && (
        <div className="warning-box" style={{ marginTop: '20pt' }}>
          <h4>⚠ Risk Correlation</h4>
          <p><strong>Companies with Net 60+ terms experience:</strong></p>
          <ul>
            <li>2.3x higher bad debt rates</li>
            <li>40% longer collection cycles</li>
            <li>65% more likely to use TCI</li>
          </ul>
          <div className="source-citation">Dun & Bradstreet Trade Credit Survey 2023</div>
        </div>
      )}
    </div>
  );
}

/**
 * Bad Debt Analysis Section
 */
function BadDebtAnalysis({ badDebt, peerGroup }) {
  return (
    <div>
      <div className="section-header">
        <span className="section-number">3</span>
        <h2 style={{ display: 'inline' }}>Bad Debt Experience Benchmark</h2>
      </div>

      <h3>Payment Defaults in Your Peer Group</h3>
      <p>{peerGroup.industryLabel}, {peerGroup.revenueLabel}</p>

      <div className="chart-container" style={{ marginTop: '20pt' }}>
        <div className="chart-title">Bad Debt Experience Distribution</div>
        {renderExperienceChart(badDebt)}
      </div>

      <div className="highlight-box" style={{ marginTop: '20pt' }}>
        <h4>Your Position</h4>
        <div className="grid-2">
          <div>
            <strong>Your Experience:</strong><br />
            {badDebt.experiencedCount.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
          <div>
            <strong>Peer Average:</strong><br />
            {badDebt.peerExperiencePercentage}% experienced defaults
          </div>
          <div>
            <strong>Your Amount:</strong><br />
            {badDebt.badDebtAmount.replace(/-/g, ' ')}
          </div>
          <div>
            <strong>Peer Range:</strong><br />
            {badDebt.avgBadDebtRange}
          </div>
        </div>
      </div>

      {badDebt.badDebtImpact > 0 && (
        <div className="metric-card" style={{ marginTop: '20pt' }}>
          <h4>Business Impact Rating</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15pt' }}>
            {[1, 2, 3, 4, 5].map(rating => (
              <div key={rating} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  width: '40pt',
                  height: '40pt',
                  borderRadius: '50%',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16pt',
                  fontWeight: '700',
                  background: badDebt.badDebtImpact === rating ? 'var(--rivio-blue)' : 'var(--rivio-gray-light)',
                  color: badDebt.badDebtImpact === rating ? 'white' : 'var(--rivio-gray)',
                  border: badDebt.badDebtImpact === rating ? '3pt solid var(--rivio-blue)' : '1pt solid var(--rivio-gray)'
                }}>
                  {rating}
                </div>
                <div style={{ fontSize: '9pt', marginTop: '5pt', color: 'var(--rivio-gray)' }}>
                  {rating === 1 ? 'Low' : rating === 5 ? 'Severe' : ''}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '15pt', textAlign: 'center', color: 'var(--rivio-gray)' }}>
            Your Rating: {badDebt.badDebtImpact}/5 | Peer Average: 3.2
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * TCI Landscape Section
 */
function TCILandscape({ surveyResponse }) {
  return (
    <div>
      <div className="section-header">
        <span className="section-number">4</span>
        <h2 style={{ display: 'inline' }}>Trade Credit Insurance Landscape</h2>
      </div>

      <h3>Current TCI User Satisfaction</h3>
      <div className="info-box">
        <p>You indicated you are currently using trade credit insurance. Here's how your experience compares to other TCI users.</p>
      </div>

      {/* This section would show if user is TCI customer */}
      <div className="chart-container" style={{ marginTop: '20pt' }}>
        <div className="chart-title">TCI User Satisfaction Distribution</div>
        <div style={{ marginTop: '15pt' }}>
          <p className="text-center" style={{ fontSize: '14pt', fontWeight: '600', color: 'var(--rivio-green)' }}>
            Average Satisfaction: 4.1 / 5.0
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Recommendations Section
 */
function RecommendationsSection({ recommendations, savings }) {
  return (
    <div>
      <div className="section-header">
        <span className="section-number">5</span>
        <h2 style={{ display: 'inline' }}>Personalized Recommendations</h2>
      </div>

      <p>Based on your responses and industry benchmarks, we recommend the following actions:</p>

      {recommendations.map((rec, index) => (
        <div key={index} className="recommendation avoid-break" style={{ marginTop: '25pt' }}>
          <div className="recommendation-title">
            🎯 Priority {rec.priority}: {rec.title}
            <span className="recommendation-priority">Priority {rec.priority}</span>
          </div>

          {rec.why && rec.why.length > 0 && (
            <div className="recommendation-section">
              <span className="recommendation-label">Why This Matters:</span>
              <ul className="bullet-list">
                {rec.why.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {rec.potentialImpact && (
            <div className="impact-highlight">
              <strong>Potential Impact:</strong> {rec.potentialImpact}
              {rec.calculation && (
                <div style={{ marginTop: '8pt', fontSize: '10pt' }}>
                  Calculation: {rec.calculation}
                </div>
              )}
            </div>
          )}

          {rec.nextSteps && rec.nextSteps.length > 0 && (
            <div className="recommendation-section">
              <span className="recommendation-label">Next Steps:</span>
              <ul className="checklist">
                {rec.nextSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {rec.considerations && rec.considerations.length > 0 && (
            <div className="recommendation-section">
              <span className="recommendation-label">Consider:</span>
              <ul className="bullet-list">
                {rec.considerations.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {rec.peerPractices && (
            <div className="recommendation-section">
              <span className="recommendation-label">Peer Practices:</span>
              <div className="grid-2" style={{ marginTop: '8pt' }}>
                {Object.entries(rec.peerPractices).map(([practice, percent], i) => (
                  <div key={i}>
                    <strong>{practice}:</strong> {percent}
                  </div>
                ))}
              </div>
            </div>
          )}

          {rec.recommendedChanges && rec.recommendedChanges.length > 0 && (
            <div className="recommendation-section">
              <span className="recommendation-label">Recommended Changes:</span>
              <ul className="checklist">
                {rec.recommendedChanges.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="source-citation">{rec.source}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Appendix Section
 */
function Appendix({ benchmarkResults }) {
  const sources = {
    'atradius2024': {
      title: 'Atradius Payment Practices Barometer 2024 - North America',
      organization: 'Atradius',
      date: 'September 2024',
      url: 'https://atradius.us/dam/jcr:e6d39770-5f80-44d0-9117-f8a39388a605/payment-practices-barometer-north-america-us-en.pdf',
    },
    'fedReserve2024': {
      title: '2024 Report on Payments: Findings from the 2023 Small Business Credit Survey',
      organization: 'Federal Reserve Banks',
      date: 'December 2024',
      url: 'https://www.fedsmallbusiness.org/reports/survey/2024/2024-report-on-payments',
    },
    'highradius2024': {
      title: 'Decoding Bad Debt: Analysis of Fortune 1000 Companies',
      organization: 'HighRadius FINsider',
      date: '2024',
      url: 'https://www.highradius.com/finsider/bad-debt-ratios/',
    },
    'nacm2024': {
      title: 'NACM Credit Managers Index 2024',
      organization: 'National Association of Credit Management',
      date: '2024',
      url: 'https://nacm.org/cmi.html',
    },
    'grandview2024': {
      title: 'Trade Credit Insurance Market Size And Share Report, 2030',
      organization: 'Grand View Research',
      date: '2024',
      url: 'https://www.grandviewresearch.com/industry-analysis/trade-credit-insurance-market-report',
    },
  };

  return (
    <div className="appendix">
      <h2>Appendix</h2>

      <h3>Methodology</h3>
      <p>This report combines data from multiple sources:</p>

      <div className="info-box">
        <h4>1. Industry Benchmark Data</h4>
        <p>Data from published industry reports, government sources, and trade associations.</p>

        <h4 style={{ marginTop: '15pt' }}>2. Peer Group Analysis</h4>
        <p>Your peer group consists of companies with:</p>
        <ul>
          <li>Similar revenue range ({benchmarkResults.peerGroup.revenueLabel})</li>
          <li>Same primary industry ({benchmarkResults.peerGroup.industryLabel})</li>
          <li>B2B sales focus (>50% revenue from B2B)</li>
        </ul>
      </div>

      <h3 style={{ marginTop: '30pt' }}>Data Sources & References</h3>
      <ol className="reference-list">
        {Object.entries(sources).map(([key, source], index) => (
          <li key={key}>
            <strong>{source.organization}.</strong> ({source.date}). <em>{source.title}.</em>
            <br />
            Retrieved from <a href={source.url} className="reference-link">{source.url}</a>
          </li>
        ))}
      </ol>

      <h3 style={{ marginTop: '30pt' }}>Disclaimers</h3>
      <div className="info-box">
        <ul>
          <li>Benchmark data represents industry aggregates and may not reflect your specific circumstances</li>
          <li>Past performance does not guarantee future results</li>
          <li>Recommendations are general in nature; consult with financial and legal advisors for specific guidance</li>
        </ul>
      </div>

      <h3 style={{ marginTop: '30pt' }}>About Rivio</h3>
      <p>
        Rivio is reimagining trade credit insurance for modern businesses. Our technology-driven approach provides
        faster approvals, transparent pricing, and exceptional customer service.
      </p>
      <p style={{ marginTop: '12pt' }}>
        <strong>Learn more:</strong> www.rivio.com<br />
        <strong>Contact:</strong> hello@rivio.com
      </p>

      <div style={{ marginTop: '30pt', padding: '15pt', background: 'var(--rivio-gray-light)', borderRadius: '4pt', textAlign: 'center' }}>
        <p className="text-small text-muted">
          Report Generated: {new Date(benchmarkResults.metadata.calculatedAt).toLocaleDateString()}<br />
          Data Version: {benchmarkResults.metadata.dataVersion} | Last Updated: {benchmarkResults.metadata.lastDataUpdate}
        </p>
      </div>
    </div>
  );
}

/**
 * Helper Functions for Charts (Text-based representations)
 */
function renderBarChart(data) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div>
      {data.map((item, index) => (
        <div key={index} style={{ marginBottom: '12pt' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4pt' }}>
            <div style={{ width: '100pt', fontWeight: item.isYou ? '700' : '400' }}>
              {item.label} {item.isYou && '← YOU'}
            </div>
            <div style={{ flex: 1, background: 'var(--rivio-gray-light)', height: '25pt', borderRadius: '4pt', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                width: `${(item.value / maxValue) * 100}%`,
                height: '100%',
                background: item.isYou ? 'var(--rivio-blue)' : 'var(--rivio-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '8pt',
                color: 'white',
                fontWeight: '600'
              }}>
                {Math.round(item.value * 100)}%
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function renderDistributionBars(distribution, userTerms) {
  const data = [
    { label: 'Net 15 or less', value: distribution.net15OrLess, key: 'net-15-or-shorter' },
    { label: 'Net 30', value: distribution.net30, key: 'net-30' },
    { label: 'Net 45', value: distribution.net45, key: 'net-45' },
    { label: 'Net 60', value: distribution.net60, key: 'net-60' },
    { label: 'Net 90+', value: distribution.net90Plus, key: 'net-90-plus' },
  ];

  const isUserTerm = (key) => userTerms.toLowerCase().includes(key.replace('net-', '').replace('-or-shorter', ''));

  return (
    <div>
      {data.map((item, index) => (
        <div key={index} style={{ marginBottom: '15pt' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6pt' }}>
            <div style={{ width: '120pt', fontWeight: isUserTerm(item.key) ? '700' : '400' }}>
              {item.label} {isUserTerm(item.key) && '← YOU'}
            </div>
            <div style={{ flex: 1, background: 'var(--rivio-gray-light)', height: '30pt', borderRadius: '4pt', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                width: `${item.value * 100}%`,
                height: '100%',
                background: isUserTerm(item.key) ? 'var(--rivio-blue)' : 'var(--rivio-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '10pt',
                color: 'white',
                fontWeight: '600',
                fontSize: '11pt'
              }}>
                {Math.round(item.value * 100)}%
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function renderExperienceChart(badDebt) {
  return (
    <div style={{ padding: '20pt' }}>
      <p style={{ textAlign: 'center', fontSize: '16pt', fontWeight: '700', color: 'var(--rivio-blue)', marginBottom: '20pt' }}>
        {badDebt.peerExperiencePercentage}% of your peers have experienced payment defaults
      </p>
      <div className="info-box">
        <strong>Your Experience:</strong> {badDebt.experiencedCount.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </div>
    </div>
  );
}

module.exports = BenchmarkReport;
