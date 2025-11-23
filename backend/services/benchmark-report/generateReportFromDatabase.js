/**
 * Generate Benchmark Reports from Database Survey Responses
 *
 * This script connects to the MongoDB database, retrieves survey responses,
 * and generates personalized benchmark PDF reports.
 *
 * Usage:
 *   node backend/services/benchmark-report/generateReportFromDatabase.js [responseId]
 *   node backend/services/benchmark-report/generateReportFromDatabase.js --all
 *   node backend/services/benchmark-report/generateReportFromDatabase.js --recent 10
 *   node backend/services/benchmark-report/generateReportFromDatabase.js --filter industry=manufacturing
 *   node backend/services/benchmark-report/generateReportFromDatabase.js --filter revenue=25m-100m
 */

const mongoose = require('mongoose');
const path = require('path');
const { generateReport } = require('./reportGenerator');
const SurveyResponse = require('../../models/SurveyResponse');

// Load environment variables if .env exists
try {
  require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
} catch (err) {
  console.log('No .env file found, using environment variables');
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    return { mode: 'help' };
  }

  if (args[0] === '--all') {
    return { mode: 'all' };
  }

  if (args[0] === '--recent') {
    return { mode: 'recent', count: parseInt(args[1]) || 10 };
  }

  if (args[0] === '--filter') {
    const [filterType, filterValue] = args[1].split('=');
    return { mode: 'filter', filterType, filterValue };
  }

  // If it's a MongoDB ObjectId (24 hex characters), treat as specific ID
  if (args[0].match(/^[0-9a-fA-F]{24}$/)) {
    return { mode: 'single', responseId: args[0] };
  }

  return { mode: 'help' };
}

// Display help
function showHelp() {
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(16) + 'BENCHMARK REPORT GENERATOR - DATABASE MODE' + ' '.repeat(20) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  console.log('');
  console.log('Generate personalized benchmark reports from survey responses in the database');
  console.log('');
  console.log('USAGE:');
  console.log('  node backend/services/benchmark-report/generateReportFromDatabase.js [OPTIONS]');
  console.log('');
  console.log('OPTIONS:');
  console.log('  <responseId>                    Generate report for specific survey response ID');
  console.log('  --all                           Generate reports for ALL survey responses');
  console.log('  --recent N                      Generate reports for N most recent responses');
  console.log('  --filter industry=VALUE         Filter by industry (manufacturing, wholesale-distribution, food-beverage)');
  console.log('  --filter revenue=VALUE          Filter by revenue range (e.g., 25m-100m)');
  console.log('  --filter usesTCI=VALUE          Filter by TCI usage (true/false)');
  console.log('');
  console.log('EXAMPLES:');
  console.log('  # Generate report for specific response');
  console.log('  node backend/services/benchmark-report/generateReportFromDatabase.js 507f1f77bcf86cd799439011');
  console.log('');
  console.log('  # Generate reports for 5 most recent responses');
  console.log('  node backend/services/benchmark-report/generateReportFromDatabase.js --recent 5');
  console.log('');
  console.log('  # Generate reports for all manufacturing companies');
  console.log('  node backend/services/benchmark-report/generateReportFromDatabase.js --filter industry=manufacturing');
  console.log('');
  console.log('  # Generate reports for companies with revenue $25M-$100M');
  console.log('  node backend/services/benchmark-report/generateReportFromDatabase.js --filter revenue=25m-100m');
  console.log('');
  console.log('OUTPUT:');
  console.log('  Reports are saved to: /workspaces/RivioForm/reports/');
  console.log('');
}

// Connect to MongoDB
async function connectDatabase() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rivioform';

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ Connected to MongoDB');
    console.log(`  Database: ${mongoose.connection.db.databaseName}`);
    console.log('');
  } catch (error) {
    console.error('✗ Failed to connect to MongoDB:', error.message);
    console.log('');
    console.log('Make sure:');
    console.log('  1. MongoDB is running');
    console.log('  2. MONGODB_URI is set in your .env file');
    console.log('  3. The database contains survey responses');
    console.log('');
    process.exit(1);
  }
}

// Fetch survey responses based on mode
async function fetchResponses(config) {
  const { mode, responseId, count, filterType, filterValue } = config;

  let query = { screenedOut: false }; // Don't generate reports for screened-out responses
  let limit = null;

  switch (mode) {
    case 'single':
      return [await SurveyResponse.findById(responseId).lean()];

    case 'all':
      return await SurveyResponse.find(query).lean();

    case 'recent':
      limit = count || 10;
      return await SurveyResponse.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    case 'filter':
      if (filterType === 'industry') {
        query.q18_primary_industry = filterValue;
      } else if (filterType === 'revenue') {
        query.q17_annual_revenue = filterValue;
      } else if (filterType === 'usesTCI') {
        query.usesTCI = filterValue === 'true';
      }
      return await SurveyResponse.find(query).lean();

    default:
      return [];
  }
}

// Main execution
async function main() {
  const config = parseArgs();

  if (config.mode === 'help') {
    showHelp();
    process.exit(0);
  }

  console.log('═'.repeat(80));
  console.log('BENCHMARK REPORT GENERATION - DATABASE MODE');
  console.log('═'.repeat(80));
  console.log('');

  // Connect to database
  await connectDatabase();

  // Fetch responses
  console.log('Fetching survey responses...');
  const responses = await fetchResponses(config);

  if (!responses || responses.length === 0) {
    console.log('✗ No survey responses found matching the criteria');
    console.log('');
    await mongoose.connection.close();
    process.exit(0);
  }

  console.log(`✓ Found ${responses.length} survey response(s)`);
  console.log('');

  // Output directory
  const outputDir = path.join(__dirname, '../../../reports');

  // Generate reports
  console.log('─'.repeat(80));
  console.log('GENERATING REPORTS');
  console.log('─'.repeat(80));
  console.log('');

  const results = {
    total: responses.length,
    successful: 0,
    failed: 0,
    reports: [],
  };

  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];

    console.log(`[${i + 1}/${responses.length}] Processing: ${response.companyName || response.email || 'Unknown'}`);
    console.log('');

    try {
      const result = await generateReport(response, { outputDir });

      if (result.success) {
        results.successful++;
        results.reports.push({
          responseId: response._id,
          companyName: response.companyName,
          email: response.email,
          pdfPath: result.pdfInfo.path,
        });
        console.log('✓ Success');
      } else {
        results.failed++;
        console.log(`✗ Failed: ${result.error}`);
      }
    } catch (error) {
      results.failed++;
      console.log(`✗ Error: ${error.message}`);
    }

    console.log('');
  }

  // Summary
  console.log('═'.repeat(80));
  console.log('GENERATION COMPLETE');
  console.log('═'.repeat(80));
  console.log(`Total Processed: ${results.total}`);
  console.log(`Successful: ${results.successful}`);
  console.log(`Failed: ${results.failed}`);
  console.log('');

  if (results.successful > 0) {
    console.log('Generated Reports:');
    results.reports.forEach((report, index) => {
      console.log(`  ${index + 1}. ${report.companyName || report.email}`);
      console.log(`     → ${report.pdfPath}`);
    });
    console.log('');
  }

  // Close database connection
  await mongoose.connection.close();
  console.log('✓ Database connection closed');
  console.log('');
}

// Run with error handling
main().catch(error => {
  console.error('Unexpected error:', error);
  mongoose.connection.close();
  process.exit(1);
});
