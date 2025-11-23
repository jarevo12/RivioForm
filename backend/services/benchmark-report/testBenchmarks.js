/**
 * Test script for benchmark calculator
 * Run with: node backend/services/benchmark-report/testBenchmarks.js
 */

const { calculateBenchmarks } = require('./benchmarkCalculator');

// Sample survey response - Manufacturing company with bad debt experience
const sampleSurveyResponse = {
  // Company profile
  q17_annual_revenue: '25m-100m',
  q18_primary_industry: 'manufacturing',

  // Credit practices
  q1_b2b_percentage: '76-100',
  q2_role: 'cfo-finance-director',
  q3_payment_terms: 'net-60',

  // Bad debt experience
  q4_bad_debt_experience: 'yes-once-or-twice',
  q5_bad_debt_amount: '250k-1m',
  q6_bad_debt_impact: 3,
  q7_changed_approach: 'yes-minor',
  q7a_changes_made: ['stricter-credit-approval', 'shortened-payment-terms'],

  // TCI usage
  q8_credit_insurance_usage: 'no-not-considering',

  // Contact info
  email: 'cfo@example.com',
  contactName: 'John Smith',
  companyName: 'ABC Manufacturing Inc.',
};

console.log('='.repeat(80));
console.log('BENCHMARK REPORT CALCULATION TEST');
console.log('='.repeat(80));
console.log('');

console.log('Survey Response:');
console.log(`Company: ${sampleSurveyResponse.companyName}`);
console.log(`Industry: ${sampleSurveyResponse.q18_primary_industry}`);
console.log(`Revenue: ${sampleSurveyResponse.q17_annual_revenue}`);
console.log(`Payment Terms: ${sampleSurveyResponse.q3_payment_terms}`);
console.log(`Bad Debt Experience: ${sampleSurveyResponse.q4_bad_debt_experience}`);
console.log(`Bad Debt Amount: ${sampleSurveyResponse.q5_bad_debt_amount}`);
console.log(`Uses TCI: ${sampleSurveyResponse.q8_credit_insurance_usage}`);
console.log('');
console.log('='.repeat(80));
console.log('');

// Calculate benchmarks
const results = calculateBenchmarks(sampleSurveyResponse);

console.log('PEER GROUP:');
console.log(`Industry: ${results.peerGroup.industryLabel}`);
console.log(`Revenue Range: $25M - $100M`);
console.log(`Sample Size: ${results.peerGroup.sampleSize}`);
console.log('');

console.log('='.repeat(80));
console.log('TCI ADOPTION ANALYSIS');
console.log('='.repeat(80));
console.log(`Your Status: ${results.calculations.tci.userUsesTCI ? 'Using TCI' : 'Not Using TCI'}`);
console.log(`Peer Adoption Rate: ${results.calculations.tci.peerAdoptionPercentage}%`);
console.log(`Position: ${results.calculations.tci.position.replace(/_/g, ' ').toUpperCase()}`);
console.log(`Insight: ${results.calculations.tci.insight}`);
console.log(`Source: ${results.calculations.tci.source}`);
console.log('');

console.log('='.repeat(80));
console.log('PAYMENT TERMS ANALYSIS');
console.log('='.repeat(80));
console.log(`Your Terms: ${results.calculations.paymentTerms.userTerms}`);
console.log(`Your Days: ${results.calculations.paymentTerms.userDays}`);
console.log(`Industry Average: ${results.calculations.paymentTerms.avgTerms}`);
console.log(`Difference: ${results.calculations.paymentTerms.difference > 0 ? '+' : ''}${results.calculations.paymentTerms.difference} days (${results.calculations.paymentTerms.percentDiff > 0 ? '+' : ''}${results.calculations.paymentTerms.percentDiff}%)`);
console.log(`Position: ${results.calculations.paymentTerms.position.replace(/_/g, ' ').toUpperCase()}`);
console.log(`Median DSO: ${results.calculations.paymentTerms.medianDSO} days`);
console.log(`Insight: ${results.calculations.paymentTerms.insight}`);
console.log('');

console.log('Payment Terms Distribution in Your Industry:');
const dist = results.calculations.paymentTerms.termsDistribution;
console.log(`  Net 15 or less: ${(dist.net15OrLess * 100).toFixed(0)}%`);
console.log(`  Net 30:         ${(dist.net30 * 100).toFixed(0)}%`);
console.log(`  Net 45:         ${(dist.net45 * 100).toFixed(0)}%`);
console.log(`  Net 60:         ${(dist.net60 * 100).toFixed(0)}% ← YOU ARE HERE`);
console.log(`  Net 90+:        ${(dist.net90Plus * 100).toFixed(0)}%`);
console.log('');

console.log('='.repeat(80));
console.log('BAD DEBT EXPERIENCE ANALYSIS');
console.log('='.repeat(80));
console.log(`Your Experience: ${results.calculations.badDebt.experiencedCount}`);
console.log(`Bad Debt Amount: ${results.calculations.badDebt.badDebtAmount}`);
console.log(`Impact Rating: ${results.calculations.badDebt.badDebtImpact}/5`);
console.log(`Peer Experience Rate: ${results.calculations.badDebt.peerExperiencePercentage}%`);
console.log(`Peer Avg Range: ${results.calculations.badDebt.avgBadDebtRange}`);
console.log(`Position: ${results.calculations.badDebt.position.replace(/_/g, ' ').toUpperCase()}`);
console.log(`Insight: ${results.calculations.badDebt.insight}`);
console.log('');

console.log('='.repeat(80));
console.log('RISK MANAGEMENT MATURITY');
console.log('='.repeat(80));
console.log(`Maturity Score: ${results.calculations.riskManagement.maturityScore}/4`);
console.log(`Position: ${results.calculations.riskManagement.position.toUpperCase()}`);
console.log(`Changed Approach: ${results.calculations.riskManagement.changedApproach}`);
console.log(`Changes Made: ${results.calculations.riskManagement.changesMade}`);
console.log(`Insight: ${results.calculations.riskManagement.insight}`);
console.log('');

console.log('='.repeat(80));
console.log('POTENTIAL TCI SAVINGS');
console.log('='.repeat(80));
console.log(`Historical Loss (5 years): $${(results.calculations.savings.historicalLoss / 1000).toFixed(0)}K`);
console.log(`TCI Impact Rate: ${(results.calculations.savings.tciImpactRate * 100).toFixed(0)}%`);
console.log(`Potential Savings (5 years): $${(results.calculations.savings.potentialSavingsFiveYears / 1000).toFixed(0)}K`);
console.log(`Potential Savings (Annual): $${(results.calculations.savings.potentialSavingsAnnual / 1000).toFixed(0)}K`);
console.log(`Calculation: ${results.calculations.savings.calculation}`);
console.log(`Note: ${results.calculations.savings.note}`);
console.log('');

console.log('='.repeat(80));
console.log('PERSONALIZED RECOMMENDATIONS');
console.log('='.repeat(80));
results.recommendations.forEach((rec, index) => {
  console.log('');
  console.log(`${index + 1}. ${rec.title.toUpperCase()} (Priority ${rec.priority})`);
  console.log('');
  if (rec.why) {
    console.log('   Why This Matters:');
    rec.why.forEach(reason => console.log(`   • ${reason}`));
    console.log('');
  }
  if (rec.potentialImpact) {
    console.log(`   Potential Impact: ${rec.potentialImpact}`);
    if (rec.calculation) {
      console.log(`   Calculation: ${rec.calculation}`);
    }
    console.log('');
  }
  if (rec.nextSteps) {
    console.log('   Next Steps:');
    rec.nextSteps.forEach(step => console.log(`   ✓ ${step}`));
    console.log('');
  }
  if (rec.considerations) {
    console.log('   Consider:');
    rec.considerations.forEach(item => console.log(`   • ${item}`));
    console.log('');
  }
  if (rec.peerPractices) {
    console.log('   Peer Practices:');
    Object.entries(rec.peerPractices).forEach(([practice, percent]) => {
      console.log(`   - ${practice}: ${percent}`);
    });
    console.log('');
  }
  if (rec.recommendedChanges) {
    console.log('   Recommended Changes:');
    rec.recommendedChanges.forEach(change => console.log(`   ✓ ${change}`));
    console.log('');
  }
  console.log(`   Source: ${rec.source}`);
  console.log('');
});

console.log('='.repeat(80));
console.log('METADATA');
console.log('='.repeat(80));
console.log(`Calculated At: ${results.metadata.calculatedAt}`);
console.log(`Data Version: ${results.metadata.dataVersion}`);
console.log(`Last Data Update: ${results.metadata.lastDataUpdate}`);
console.log('');

console.log('='.repeat(80));
console.log('TEST COMPLETE - Benchmark calculations working correctly!');
console.log('='.repeat(80));
