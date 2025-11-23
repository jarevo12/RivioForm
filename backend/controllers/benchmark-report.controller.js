/**
 * Benchmark Report Controller
 * Business logic for generating benchmark reports
 */

const SurveyResponse = require('../models/SurveyResponse');
const { generateReport } = require('../services/benchmark-report/reportGenerator');
const logger = require('../config/logger');
const path = require('path');

/**
 * @desc    Generate benchmark report for a survey response
 * @route   POST /api/reports/benchmark/:id
 * @access  Private
 */
exports.generateBenchmarkReport = async (req, res, next) => {
  try {
    const responseId = req.params.id;

    // Fetch survey response
    const surveyResponse = await SurveyResponse.findById(responseId).lean();

    if (!surveyResponse) {
      return res.status(404).json({
        success: false,
        message: 'Survey response not found',
      });
    }

    // Don't generate for screened-out responses
    if (surveyResponse.screenedOut) {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate report for screened-out responses',
      });
    }

    // Output directory
    const outputDir = path.join(__dirname, '../../reports');

    // Generate report
    logger.info(`Generating benchmark report for response: ${responseId}`);

    const result = await generateReport(surveyResponse, { outputDir });

    if (result.success) {
      logger.info(`Benchmark report generated successfully: ${result.pdfInfo.filename}`);

      res.status(200).json({
        success: true,
        message: 'Benchmark report generated successfully',
        data: {
          reportId: result.reportData.surveyResponseId,
          companyName: result.reportData.companyName,
          filename: result.pdfInfo.filename,
          path: result.pdfInfo.path,
          generatedAt: result.reportData.generatedAt,
          recommendations: result.benchmarkResults.recommendationsCount,
          peerGroup: result.benchmarkResults.peerGroup,
        },
      });
    } else {
      logger.error(`Failed to generate benchmark report: ${result.error}`);

      res.status(500).json({
        success: false,
        message: 'Failed to generate benchmark report',
        error: result.error,
      });
    }

  } catch (error) {
    logger.error('Error generating benchmark report:', error);
    next(error);
  }
};

/**
 * @desc    Generate benchmark reports in batch
 * @route   POST /api/reports/benchmark/batch
 * @access  Private
 */
exports.generateBatchReports = async (req, res, next) => {
  try {
    const { responseIds, filter } = req.body;

    let surveyResponses;

    if (responseIds && Array.isArray(responseIds)) {
      // Generate for specific IDs
      surveyResponses = await SurveyResponse.find({
        _id: { $in: responseIds },
        screenedOut: false,
      }).lean();
    } else if (filter) {
      // Generate based on filter
      const query = { screenedOut: false };

      if (filter.industry) {
        query.q18_primary_industry = filter.industry;
      }
      if (filter.revenue) {
        query.q17_annual_revenue = filter.revenue;
      }
      if (filter.usesTCI !== undefined) {
        query.usesTCI = filter.usesTCI;
      }

      surveyResponses = await SurveyResponse.find(query).lean();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either responseIds array or filter object is required',
      });
    }

    if (surveyResponses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No survey responses found matching criteria',
      });
    }

    logger.info(`Generating batch reports for ${surveyResponses.length} responses`);

    const outputDir = path.join(__dirname, '../../reports');
    const results = [];

    for (const response of surveyResponses) {
      try {
        const result = await generateReport(response, { outputDir });
        results.push({
          responseId: response._id,
          companyName: response.companyName,
          success: result.success,
          filename: result.success ? result.pdfInfo.filename : null,
          error: result.success ? null : result.error,
        });
      } catch (error) {
        results.push({
          responseId: response._id,
          companyName: response.companyName,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    logger.info(`Batch generation complete: ${successCount} success, ${failureCount} failed`);

    res.status(200).json({
      success: true,
      message: `Generated ${successCount} out of ${results.length} reports`,
      data: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
        results,
      },
    });

  } catch (error) {
    logger.error('Error in batch report generation:', error);
    next(error);
  }
};

/**
 * @desc    Get report preview (calculations only, no PDF)
 * @route   GET /api/reports/benchmark/:id/preview
 * @access  Private
 */
exports.getReportPreview = async (req, res, next) => {
  try {
    const responseId = req.params.id;

    const surveyResponse = await SurveyResponse.findById(responseId).lean();

    if (!surveyResponse) {
      return res.status(404).json({
        success: false,
        message: 'Survey response not found',
      });
    }

    if (surveyResponse.screenedOut) {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate preview for screened-out responses',
      });
    }

    const { getReportPreview } = require('../services/benchmark-report/reportGenerator');
    const preview = getReportPreview(surveyResponse);

    res.status(200).json({
      success: true,
      data: preview,
    });

  } catch (error) {
    logger.error('Error generating report preview:', error);
    next(error);
  }
};

module.exports = exports;
