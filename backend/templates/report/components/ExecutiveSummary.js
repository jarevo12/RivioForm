const React = require('react');

/**
 * Executive Summary Component
 */
function ExecutiveSummary({ peerGroup, calculations, recommendations }) {
  const { tci, paymentTerms, badDebt, riskManagement } = calculations;

  return (
    <div className="avoid-break">
      <div className="section-header">
        <h2>Executive Summary</h2>
      </div>

      {/* Peer Group Overview */}
      <div className="highlight-box">
        <h4>Your Position vs. Peers</h4>
        <div className="grid-2" style={{ marginTop: '12pt' }}>
          <div>
            <strong>Company Profile</strong>
            <ul style={{ marginTop: '8pt', marginLeft: '0', listStyle: 'none' }}>
              <li>✓ Industry: {peerGroup.industryLabel}</li>
              <li>✓ Revenue: {peerGroup.revenueLabel}</li>
              <li>✓ Peer Group: {peerGroup.sampleSize}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Key Findings */}
      <div style={{ marginTop: '20pt' }}>
        <h3>Credit Risk Profile</h3>

        {/* TCI Usage */}
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8pt' }}>
            <StatusIcon status={tci.userUsesTCI ? 'good' : 'warning'} />
            <strong>Trade Credit Insurance Usage</strong>
          </div>
          <div style={{ marginLeft: '22pt' }}>
            <div>○ You: {tci.userUsesTCI ? 'Using TCI' : 'Not using TCI'}</div>
            <div>○ Industry: {tci.peerAdoptionPercentage}% adoption rate</div>
            <div className={getStatusClass(tci.position)}>
              ○ Status: {formatPosition(tci.position)}
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8pt' }}>
            <StatusIcon status={paymentTerms.position === 'extended' ? 'warning' : 'good'} />
            <strong>Payment Terms</strong>
          </div>
          <div style={{ marginLeft: '22pt' }}>
            <div>○ You: {paymentTerms.userTerms}</div>
            <div>○ Industry Average: {paymentTerms.avgTerms}</div>
            <div className={getStatusClass(paymentTerms.position)}>
              ○ Status: {paymentTerms.insight}
            </div>
          </div>
        </div>

        {/* Bad Debt Experience */}
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8pt' }}>
            <StatusIcon status={badDebt.position === 'better_than_peers' ? 'good' : 'warning'} />
            <strong>Bad Debt Experience</strong>
          </div>
          <div style={{ marginLeft: '22pt' }}>
            <div>○ You: {badDebt.userHasBadDebt ? 'Experienced defaults' : 'No defaults'}</div>
            <div>○ Industry: {badDebt.peerExperiencePercentage}% experienced defaults</div>
            <div className={getStatusClass(badDebt.position)}>
              ○ Status: {formatPosition(badDebt.position)}
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8pt' }}>
            <StatusIcon status={riskManagement.position === 'mature' ? 'good' : 'warning'} />
            <strong>Risk Management Maturity</strong>
          </div>
          <div style={{ marginLeft: '22pt' }}>
            <div>○ You: {formatPosition(riskManagement.position)}</div>
            <div>○ Changes Made: {riskManagement.changesMade} adjustments</div>
            <div className={getStatusClass(riskManagement.position)}>
              ○ Status: {riskManagement.position === 'mature' ? 'Top quartile' : 'Opportunity for improvement'}
            </div>
          </div>
        </div>
      </div>

      {/* Top Recommendations */}
      <div style={{ marginTop: '25pt' }}>
        <h3>Top {recommendations.length} Recommendations</h3>
        {recommendations.slice(0, 3).map((rec, index) => (
          <div key={index} className="info-box" style={{ marginTop: '12pt' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8pt' }}>
              <span style={{
                display: 'inline-block',
                width: '24pt',
                height: '24pt',
                borderRadius: '50%',
                background: 'var(--rivio-blue)',
                color: 'white',
                textAlign: 'center',
                lineHeight: '24pt',
                fontWeight: '700',
                marginRight: '10pt'
              }}>
                {index + 1}
              </span>
              <strong style={{ fontSize: '13pt', color: 'var(--rivio-blue)' }}>
                {rec.title}
              </strong>
            </div>
            <div style={{ marginLeft: '34pt' }}>
              {rec.why && rec.why.length > 0 && (
                <div style={{ marginTop: '6pt' }}>
                  {rec.why[0]}
                </div>
              )}
              {rec.potentialImpact && (
                <div style={{
                  marginTop: '10pt',
                  padding: '8pt',
                  background: 'var(--rivio-green-light)',
                  borderRadius: '4pt',
                  fontWeight: '600'
                }}>
                  {rec.potentialImpact}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusIcon({ status }) {
  const statusClass = status === 'good' ? 'good' : status === 'alert' ? 'alert' : 'warning';
  return <span className={`status-icon ${statusClass}`}></span>;
}

function getStatusClass(position) {
  if (position === 'mature' || position === 'better_than_peers' || position === 'shorter') {
    return 'status-good';
  }
  if (position === 'worse_than_peers' || position === 'extended') {
    return 'status-alert';
  }
  return 'status-warning';
}

function formatPosition(position) {
  return position
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

module.exports = ExecutiveSummary;
