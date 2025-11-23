/**
 * Generate Sample Benchmark Report
 * Run with: node backend/services/benchmark-report/generateSampleReport.js
 */

const { generateReport } = require('./reportGenerator');
const path = require('path');

// Sample survey responses for different scenarios

// Scenario 1: Manufacturing company with bad debt, not using TCI
const manufacturingCompany = {
  // Company profile
  q17_annual_revenue: '25m-100m',
  q18_primary_industry: 'manufacturing',
  companyName: 'ABC Manufacturing Inc.',
  contactName: 'John Smith',
  email: 'john.smith@abcmanufacturing.com',

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
};

// Scenario 2: Wholesale company using TCI, satisfied
const wholesaleCompany = {
  q17_annual_revenue: '100m-500m',
  q18_primary_industry: 'wholesale-distribution',
  companyName: 'Global Distributors LLC',
  contactName: 'Sarah Johnson',
  email: 'sarah.johnson@globaldist.com',

  q1_b2b_percentage: '76-100',
  q2_role: 'credit-manager',
  q3_payment_terms: 'net-45',

  q4_bad_debt_experience: 'yes-once-or-twice',
  q5_bad_debt_amount: '1m-5m',
  q6_bad_debt_impact: 4,
  q7_changed_approach: 'yes-significant',
  q7a_changes_made: ['stricter-credit-approval', 'trade-credit-insurance', 'ar-management-software'],

  q8_credit_insurance_usage: 'yes-fully',
};

// Scenario 3: Food & Beverage company, no bad debt
const foodBeverageCompany = {
  q17_annual_revenue: '5m-25m',
  q18_primary_industry: 'food-beverage',
  companyName: 'Fresh Foods Co.',
  contactName: 'Michael Chen',
  email: 'mchen@freshfoods.com',

  q1_b2b_percentage: '51-75',
  q2_role: 'ceo-owner',
  q3_payment_terms: 'net-30',

  q4_bad_debt_experience: 'no-never',
  q5_bad_debt_amount: '',
  q6_bad_debt_impact: 0,
  q7_changed_approach: '',
  q7a_changes_made: [],

  q8_credit_insurance_usage: 'no-not-considering',
};

// Main function
async function main() {
  const scenarios = [
    { name: 'Manufacturing (Bad Debt, No TCI)', data: manufacturingCompany },
    { name: 'Wholesale (Using TCI)', data: wholesaleCompany },
    { name: 'Food & Beverage (No Bad Debt)', data: foodBeverageCompany },
  ];

  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(20) + 'SAMPLE REPORT GENERATION' + ' '.repeat(34) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  console.log('');
  console.log(`Generating ${scenarios.length} sample benchmark reports...`);
  console.log('');

  const outputDir = path.join(__dirname, '../../../reports/samples');

  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];
    console.log('─'.repeat(80));
    console.log(`SCENARIO ${i + 1}: ${scenario.name}`);
    console.log('─'.repeat(80));
    console.log('');

    try {
      const result = await generateReport(scenario.data, { outputDir });

      if (result.success) {
        console.log('✓ Report generated successfully!');
        console.log('');
        console.log('Report Details:');
        console.log(`  Company: ${result.reportData.companyName}`);
        console.log(`  Contact: ${result.reportData.contactName}`);
        console.log(`  Industry: ${result.benchmarkResults.peerGroup.industry}`);
        console.log(`  Recommendations: ${result.benchmarkResults.recommendationsCount}`);
        console.log(`  PDF: ${result.pdfInfo.filename}`);
        console.log('');
      } else {
        console.error('✗ Report generation failed');
        console.error(`  Error: ${result.error}`);
        console.log('');
      }
    } catch (error) {
      console.error('✗ Unexpected error:', error.message);
      console.log('');
    }
  }

  console.log('═'.repeat(80));
  console.log('ALL SAMPLE REPORTS GENERATED');
  console.log('═'.repeat(80));
  console.log('');
  console.log(`Reports saved to: ${outputDir}`);
  console.log('');
  console.log('Next Steps:');
  console.log('  1. Review the generated PDF reports');
  console.log('  2. Check formatting and content accuracy');
  console.log('  3. Verify all sources are properly cited');
  console.log('  4. Test printing to ensure print-friendly format');
  console.log('');
}

// Run the script
main().catch(console.error);
