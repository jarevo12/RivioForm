# Generate Benchmark Reports from Survey Responses

This guide shows you how to generate personalized benchmark PDF reports from the survey responses stored in your MongoDB database.

---

## Three Ways to Generate Reports

### 1. Command Line Script (Recommended for Manual Review)
### 2. API Endpoints (For Integration)
### 3. Programmatic Usage (For Custom Scripts)

---

## Method 1: Command Line Script

The easiest way to generate reports manually.

### Usage

```bash
# Generate report for specific survey response (using MongoDB _id)
node backend/services/benchmark-report/generateReportFromDatabase.js 507f1f77bcf86cd799439011

# Generate reports for 5 most recent responses
node backend/services/benchmark-report/generateReportFromDatabase.js --recent 5

# Generate reports for all manufacturing companies
node backend/services/benchmark-report/generateReportFromDatabase.js --filter industry=manufacturing

# Generate reports for companies with revenue $25M-$100M
node backend/services/benchmark-report/generateReportFromDatabase.js --filter revenue=25m-100m

# Generate reports for all non-screened responses
node backend/services/benchmark-report/generateReportFromDatabase.js --all
```

### Available Filters

- `industry=VALUE` - Filter by industry
  - `manufacturing`
  - `wholesale-distribution`
  - `food-beverage`

- `revenue=VALUE` - Filter by revenue range
  - `5m-25m`
  - `25m-100m`
  - `100m-500m`
  - `500m-plus`

- `usesTCI=VALUE` - Filter by TCI usage
  - `true` or `false`

### Output

Reports are saved to: `/workspaces/RivioForm/reports/`

Filename format: `benchmark-report-{company-name}-{date}-{timestamp}.pdf`

---

## Method 2: API Endpoints

Use these endpoints to integrate report generation into your application workflow.

### Prerequisites

Make sure your backend server is running:

```bash
cd backend
npm start
```

### Endpoints

#### 1. Generate Report for Single Response

**Endpoint:** `POST /api/reports/benchmark/:id`

**Example:**
```bash
curl -X POST http://localhost:5000/api/reports/benchmark/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "message": "Benchmark report generated successfully",
  "data": {
    "reportId": "507f1f77bcf86cd799439011",
    "companyName": "ABC Manufacturing Inc.",
    "filename": "benchmark-report-abc-manufacturing-inc-2025-11-23-1763940576779.pdf",
    "path": "/workspaces/RivioForm/reports/benchmark-report-abc-manufacturing-inc-2025-11-23-1763940576779.pdf",
    "generatedAt": "2025-11-23T23:45:00.000Z",
    "recommendations": 2,
    "peerGroup": {
      "industry": "manufacturing",
      "industryLabel": "Manufacturing",
      "revenueRange": "25m-100m",
      "sampleSize": 147
    }
  }
}
```

#### 2. Get Report Preview (No PDF)

Preview benchmark calculations without generating PDF.

**Endpoint:** `GET /api/reports/benchmark/:id/preview`

**Example:**
```bash
curl http://localhost:5000/api/reports/benchmark/507f1f77bcf86cd799439011/preview
```

**Response:**
```json
{
  "success": true,
  "data": {
    "peerGroup": {
      "industry": "manufacturing",
      "revenueRange": "25m-100m"
    },
    "keyFindings": {
      "tciAdoption": {
        "user": false,
        "peers": 58,
        "position": "below_average"
      },
      "paymentTerms": {
        "user": "Net 60",
        "average": "Net 45",
        "difference": 15
      },
      "badDebt": {
        "experienced": true,
        "peerRate": 68
      },
      "potentialSavings": 91000
    },
    "recommendations": [
      {
        "priority": 1,
        "title": "Evaluate Trade Credit Insurance",
        "summary": "You've experienced some payment defaults"
      }
    ]
  }
}
```

#### 3. Generate Batch Reports

Generate multiple reports at once.

**Endpoint:** `POST /api/reports/benchmark/batch`

**Example 1: Specific Response IDs**
```bash
curl -X POST http://localhost:5000/api/reports/benchmark/batch \
  -H "Content-Type: application/json" \
  -d '{
    "responseIds": [
      "507f1f77bcf86cd799439011",
      "507f191e810c19729de860ea"
    ]
  }'
```

**Example 2: Filter by Criteria**
```bash
curl -X POST http://localhost:5000/api/reports/benchmark/batch \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "industry": "manufacturing",
      "revenue": "25m-100m"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Generated 8 out of 10 reports",
  "data": {
    "total": 10,
    "successful": 8,
    "failed": 2,
    "results": [
      {
        "responseId": "507f1f77bcf86cd799439011",
        "companyName": "ABC Manufacturing Inc.",
        "success": true,
        "filename": "benchmark-report-abc-manufacturing-inc-2025-11-23-1763940576779.pdf",
        "error": null
      },
      {
        "responseId": "507f191e810c19729de860ea",
        "companyName": "Global Distributors LLC",
        "success": false,
        "filename": null,
        "error": "Missing required field: companyName"
      }
    ]
  }
}
```

---

## Method 3: Programmatic Usage

Use the report generator directly in your Node.js code.

### Example 1: Generate from Database

```javascript
const mongoose = require('mongoose');
const SurveyResponse = require('./backend/models/SurveyResponse');
const { generateReport } = require('./backend/services/benchmark-report/reportGenerator');

async function generateReportForResponse(responseId) {
  // Connect to database
  await mongoose.connect(process.env.MONGODB_URI);

  // Fetch survey response
  const surveyResponse = await SurveyResponse.findById(responseId).lean();

  if (!surveyResponse) {
    throw new Error('Survey response not found');
  }

  // Generate report
  const result = await generateReport(surveyResponse, {
    outputDir: './reports',
  });

  if (result.success) {
    console.log('Report generated:', result.pdfInfo.path);
  } else {
    console.error('Failed:', result.error);
  }

  await mongoose.connection.close();
}

// Run it
generateReportForResponse('507f1f77bcf86cd799439011');
```

### Example 2: Generate for Multiple Responses

```javascript
async function generateReportsForIndustry(industry) {
  await mongoose.connect(process.env.MONGODB_URI);

  // Find all responses for industry
  const responses = await SurveyResponse.find({
    q18_primary_industry: industry,
    screenedOut: false,
  }).lean();

  console.log(`Found ${responses.length} responses for ${industry}`);

  // Generate reports
  for (const response of responses) {
    const result = await generateReport(response, {
      outputDir: './reports',
    });

    console.log(
      result.success
        ? `✓ ${response.companyName}`
        : `✗ ${response.companyName}: ${result.error}`
    );
  }

  await mongoose.connection.close();
}

generateReportsForIndustry('manufacturing');
```

---

## Step-by-Step Workflow

### Recommended Process for Manual Review

1. **Check Database for New Responses**
   ```bash
   # Via MongoDB shell
   mongosh
   use rivioform
   db.surveyresponses.find({ screenedOut: false }).count()
   ```

2. **Generate Reports for Recent Responses**
   ```bash
   node backend/services/benchmark-report/generateReportFromDatabase.js --recent 10
   ```

3. **Review Generated PDFs**
   - Open PDFs in `/reports/` directory
   - Check company name, contact info
   - Verify calculations are correct
   - Review recommendations for accuracy

4. **Quality Check**
   - [ ] Company details accurate
   - [ ] Peer group relevant
   - [ ] ROI calculations reasonable
   - [ ] All sources cited
   - [ ] Professional appearance
   - [ ] No calculation errors

5. **Send to Users**
   - Email PDF to user's email address (from survey response)
   - Use professional email template
   - Include brief explanation of report value

---

## Finding Survey Response IDs

### Method 1: MongoDB Shell

```bash
mongosh
use rivioform

# List recent responses with IDs
db.surveyresponses.find(
  { screenedOut: false },
  { _id: 1, companyName: 1, email: 1, createdAt: 1 }
).sort({ createdAt: -1 }).limit(10)
```

### Method 2: API Endpoint

```bash
# Get all responses
curl http://localhost:5000/api/survey

# Search by company name
curl "http://localhost:5000/api/survey?search=ABC+Manufacturing"

# Filter by industry
curl "http://localhost:5000/api/survey?industry=manufacturing"
```

### Method 3: Export to CSV

```bash
curl http://localhost:5000/api/survey/export/csv > responses.csv
```

Then open CSV file to find response IDs in first column.

---

## Troubleshooting

### Issue: "Survey response not found"

**Cause:** Invalid MongoDB ObjectId or response doesn't exist

**Solution:**
1. Verify the ID is correct (24 hex characters)
2. Check if response exists in database
3. Make sure you're connected to correct database

### Issue: "Cannot generate report for screened-out responses"

**Cause:** User didn't qualify for survey (< 25% B2B)

**Solution:** Only generate reports for `screenedOut: false` responses

### Issue: "Missing required field: companyName"

**Cause:** Survey response doesn't have company name

**Solution:**
1. Update survey response to add missing fields
2. Or skip this response (user didn't provide info)

### Issue: Database connection failed

**Cause:** MongoDB not running or wrong connection string

**Solution:**
1. Check MongoDB is running: `systemctl status mongodb`
2. Verify `MONGODB_URI` in `.env` file
3. Test connection: `mongosh $MONGODB_URI`

### Issue: Puppeteer browser launch failed

**Cause:** Missing Chrome dependencies

**Solution:**
```bash
# Linux
sudo apt-get install -y \
  chromium-browser \
  libx11-xcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxi6 \
  libxtst6 \
  libnss3 \
  libcups2 \
  libxss1 \
  libxrandr2 \
  libasound2 \
  libpangocairo-1.0-0 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libgtk-3-0
```

---

## Performance Considerations

### Generation Time
- Single report: ~5 seconds
- Batch of 10: ~50 seconds
- Batch of 100: ~8-10 minutes

### Recommendations
- For manual review: Generate 10-20 at a time
- For automated delivery: Use queue system (future enhancement)
- Monitor memory usage for large batches

---

## Environment Variables

Make sure these are set in your `.env` file:

```env
# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/rivioform

# Optional: Custom report output directory
REPORT_OUTPUT_DIR=/custom/path/to/reports
```

---

## Next Steps

### Phase 3: Automation (Future)

Once you're comfortable with the manual process:

1. **Auto-generate on survey completion**
   - Trigger report generation when survey is submitted
   - Queue for background processing

2. **Email delivery integration**
   - Automatically send reports to users
   - Track opens and downloads

3. **Admin dashboard**
   - View all generated reports
   - Re-generate if needed
   - Track which reports have been sent

4. **Scheduled batches**
   - Generate reports daily/weekly
   - Review queue before sending

---

## Summary

**For one-off reports:**
```bash
node backend/services/benchmark-report/generateReportFromDatabase.js <responseId>
```

**For recent batch:**
```bash
node backend/services/benchmark-report/generateReportFromDatabase.js --recent 10
```

**For specific industry:**
```bash
node backend/services/benchmark-report/generateReportFromDatabase.js --filter industry=manufacturing
```

**Reports saved to:** `/workspaces/RivioForm/reports/`

**Review → Quality Check → Send to User**

---

Need help? Check the other documentation files:
- `BENCHMARK_REPORT_USAGE_GUIDE.md` - General usage guide
- `BENCHMARK_REPORT_PLAN.md` - System architecture
- `BENCHMARK_REPORT_PHASE2_COMPLETE.md` - Implementation details
