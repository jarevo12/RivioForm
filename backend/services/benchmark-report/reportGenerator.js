/**
 * Main Report Generator Service
 * Orchestrates benchmark calculation and PDF generation
 */

const { calculateBenchmarks } = require('./benchmarkCalculator');
const { createBenchmarkReport } = require('./pdfGenerator');

/**
 * Generate complete benchmark report for a survey response
 * @param {Object} surveyResponse - Complete survey response data
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} - Report generation results
 */
async function generateReport(surveyResponse, options = {}) {
  const {
    outputDir = './reports',
    includeEmail = true,
  } = options;

  try {
    console.log('='.repeat(80));
    console.log('BENCHMARK REPORT GENERATION');
    console.log('='.repeat(80));
    console.log(`Company: ${surveyResponse.companyName || 'Unknown'}`);
    console.log(`Industry: ${surveyResponse.q18_primary_industry}`);
    console.log(`Revenue: ${surveyResponse.q17_annual_revenue}`);
    console.log('');

    // Step 1: Calculate benchmarks
    console.log('[1/2] Calculating benchmarks...');
    const benchmarkResults = calculateBenchmarks(surveyResponse);
    console.log('✓ Benchmarks calculated');
    console.log(`  - Peer group: ${benchmarkResults.peerGroup.industry}`);
    console.log(`  - Recommendations: ${benchmarkResults.recommendations.length}`);
    console.log('');

    // Step 2: Generate PDF
    console.log('[2/2] Generating PDF report...');
    const pdfResult = await createBenchmarkReport(
      surveyResponse,
      benchmarkResults,
      outputDir
    );

    if (pdfResult.success) {
      console.log('✓ PDF generated successfully');
      console.log(`  - File: ${pdfResult.filename}`);
      console.log(`  - Path: ${pdfResult.pdfPath}`);
      console.log('');
    } else {
      console.error('✗ PDF generation failed');
      console.error(`  - Error: ${pdfResult.error}`);
      throw new Error(pdfResult.error);
    }

    // Step 3: Prepare results
    const results = {
      success: true,
      reportData: {
        surveyResponseId: surveyResponse._id || surveyResponse.id,
        companyName: surveyResponse.companyName,
        contactName: surveyResponse.contactName,
        email: includeEmail ? surveyResponse.email : null,
        generatedAt: new Date().toISOString(),
      },
      benchmarkResults: {
        peerGroup: benchmarkResults.peerGroup,
        recommendationsCount: benchmarkResults.recommendations.length,
        hasHighPriorityActions: benchmarkResults.recommendations.some(r => r.priority === 1),
      },
      pdfInfo: {
        filename: pdfResult.filename,
        path: pdfResult.pdfPath,
        size: null, // Would be populated with file size if needed
      },
    };

    console.log('='.repeat(80));
    console.log('REPORT GENERATION COMPLETE');
    console.log('='.repeat(80));
    console.log('');

    return results;

  } catch (error) {
    console.error('Error generating report:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack,
    };
  }
}

/**
 * Generate reports for multiple survey responses
 */
async function generateBatchReports(surveyResponses, options = {}) {
  console.log(`Generating reports for ${surveyResponses.length} survey responses...`);
  console.log('');

  const results = [];

  for (let i = 0; i < surveyResponses.length; i++) {
    console.log(`Processing ${i + 1}/${surveyResponses.length}...`);

    const result = await generateReport(surveyResponses[i], options);
    results.push(result);

    if (!result.success) {
      console.error(`Failed to generate report for response ${i + 1}`);
    }

    console.log('');
  }

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;

  console.log('='.repeat(80));
  console.log('BATCH GENERATION COMPLETE');
  console.log('='.repeat(80));
  console.log(`Total: ${results.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failureCount}`);
  console.log('');

  return {
    total: results.length,
    successful: successCount,
    failed: failureCount,
    results,
  };
}

/**
 * Get report preview (benchmarks only, no PDF)
 */
function getReportPreview(surveyResponse) {
  const benchmarkResults = calculateBenchmarks(surveyResponse);

  return {
    peerGroup: benchmarkResults.peerGroup,
    keyFindings: {
      tciAdoption: {
        user: benchmarkResults.calculations.tci.userUsesTCI,
        peers: benchmarkResults.calculations.tci.peerAdoptionPercentage,
        position: benchmarkResults.calculations.tci.position,
      },
      paymentTerms: {
        user: benchmarkResults.calculations.paymentTerms.userTerms,
        average: benchmarkResults.calculations.paymentTerms.avgTerms,
        difference: benchmarkResults.calculations.paymentTerms.difference,
      },
      badDebt: {
        experienced: benchmarkResults.calculations.badDebt.userHasBadDebt,
        peerRate: benchmarkResults.calculations.badDebt.peerExperiencePercentage,
      },
      potentialSavings: benchmarkResults.calculations.savings.potentialSavingsAnnual,
    },
    recommendations: benchmarkResults.recommendations.map(rec => ({
      priority: rec.priority,
      title: rec.title,
      summary: rec.why ? rec.why[0] : null,
    })),
  };
}

module.exports = {
  generateReport,
  generateBatchReports,
  getReportPreview,
};
