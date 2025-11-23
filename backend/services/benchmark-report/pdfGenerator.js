/**
 * PDF Generator Service
 * Converts HTML report to PDF using Puppeteer
 */

// Register Babel to transpile JSX on-the-fly
require('@babel/register')({
  extensions: ['.js', '.jsx'],
  presets: ['@babel/preset-react'],
});

const puppeteer = require('puppeteer');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const fs = require('fs').promises;
const path = require('path');

const BenchmarkReport = require('../../templates/report/BenchmarkReport');

/**
 * Generate PDF from benchmark results
 */
async function generateBenchmarkPDF(surveyResponse, benchmarkResults, outputPath) {
  try {
    console.log('Starting PDF generation...');

    // Step 1: Render React component to HTML
    const reportElement = React.createElement(BenchmarkReport, {
      surveyResponse,
      benchmarkResults,
      reportDate: new Date().toISOString(),
    });

    const htmlContent = ReactDOMServer.renderToStaticMarkup(reportElement);

    // Step 2: Read CSS file
    const cssPath = path.join(__dirname, '../../templates/report/styles/reportStyles.css');
    const cssContent = await fs.readFile(cssPath, 'utf8');

    // Step 3: Combine HTML with inline CSS
    const fullHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Benchmark Report - ${surveyResponse.companyName || 'Report'}</title>
  <style>
    ${cssContent}
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>
    `;

    // Step 4: Launch Puppeteer
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
      ],
    });

    const page = await browser.newPage();

    // Set content
    console.log('Setting page content...');
    await page.setContent(fullHTML, {
      waitUntil: 'networkidle0',
    });

    // Wait a bit for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate PDF
    console.log('Generating PDF...');
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      preferCSSPageSize: true,
    });

    await browser.close();

    console.log(`PDF generated successfully: ${outputPath}`);
    return outputPath;

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Generate filename for report
 */
function generateReportFilename(surveyResponse) {
  const companySlug = (surveyResponse.companyName || 'company')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const date = new Date().toISOString().split('T')[0];
  const timestamp = Date.now();

  return `benchmark-report-${companySlug}-${date}-${timestamp}.pdf`;
}

/**
 * Main function to generate report from survey response
 */
async function createBenchmarkReport(surveyResponse, benchmarkResults, outputDir = './reports') {
  try {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Generate filename
    const filename = generateReportFilename(surveyResponse);
    const outputPath = path.join(outputDir, filename);

    // Generate PDF
    const pdfPath = await generateBenchmarkPDF(surveyResponse, benchmarkResults, outputPath);

    return {
      success: true,
      pdfPath,
      filename,
    };

  } catch (error) {
    console.error('Error creating benchmark report:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  generateBenchmarkPDF,
  createBenchmarkReport,
  generateReportFilename,
};
