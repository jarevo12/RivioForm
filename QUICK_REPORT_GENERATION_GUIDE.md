# Quick Report Generation Guide

## 🚀 Three Quick Commands You Need

### 1. Generate Report for Specific User
```bash
node backend/services/benchmark-report/generateReportFromDatabase.js <RESPONSE_ID>
```

### 2. Generate Reports for Recent Responses
```bash
node backend/services/benchmark-report/generateReportFromDatabase.js --recent 5
```

### 3. Generate Reports by Industry
```bash
node backend/services/benchmark-report/generateReportFromDatabase.js --filter industry=manufacturing
```

---

## 📋 Step-by-Step: First Time Generation

### Step 1: Get Survey Response IDs

**Option A - Via API:**
```bash
curl http://localhost:5000/api/survey | jq '.data[] | {id: ._id, company: .companyName, email: .email}'
```

**Option B - Via MongoDB:**
```bash
mongosh rivioform --eval "db.surveyresponses.find({screenedOut:false},{_id:1,companyName:1,email:1}).limit(10)"
```

### Step 2: Generate Report
```bash
# Copy one of the IDs from step 1 and run:
node backend/services/benchmark-report/generateReportFromDatabase.js 507f1f77bcf86cd799439011
```

### Step 3: Find Your PDF
```bash
# PDFs are saved here:
ls -lh reports/*.pdf
```

### Step 4: Review and Send
- Open the PDF
- Check company name and details are correct
- Verify recommendations make sense
- Email PDF to user

---

## 🔍 Finding Response IDs

### Quick Search by Email
```bash
curl "http://localhost:5000/api/survey?search=john@example.com"
```

### Quick Search by Company
```bash
curl "http://localhost:5000/api/survey?search=ABC+Manufacturing"
```

### Get Latest Submissions
```bash
curl "http://localhost:5000/api/survey?sortBy=createdAt&order=desc&limit=10"
```

---

## 📊 API Method (Alternative)

### Generate Single Report
```bash
curl -X POST http://localhost:5000/api/reports/benchmark/507f1f77bcf86cd799439011
```

### Preview Before Generating
```bash
curl http://localhost:5000/api/reports/benchmark/507f1f77bcf86cd799439011/preview
```

### Batch Generate
```bash
curl -X POST http://localhost:5000/api/reports/benchmark/batch \
  -H "Content-Type: application/json" \
  -d '{"filter":{"industry":"manufacturing"}}'
```

---

## 🎯 Common Filters

### By Industry
```bash
# Manufacturing
node backend/services/benchmark-report/generateReportFromDatabase.js --filter industry=manufacturing

# Wholesale
node backend/services/benchmark-report/generateReportFromDatabase.js --filter industry=wholesale-distribution

# Food & Beverage
node backend/services/benchmark-report/generateReportFromDatabase.js --filter industry=food-beverage
```

### By Revenue Range
```bash
# $5M - $25M
node backend/services/benchmark-report/generateReportFromDatabase.js --filter revenue=5m-25m

# $25M - $100M
node backend/services/benchmark-report/generateReportFromDatabase.js --filter revenue=25m-100m

# $100M - $500M
node backend/services/benchmark-report/generateReportFromDatabase.js --filter revenue=100m-500m
```

---

## ✅ Quality Checklist

Before sending reports to users:

- [ ] Company name is correct
- [ ] Contact name is accurate
- [ ] Email address is valid
- [ ] Industry and revenue match survey
- [ ] Recommendations are relevant
- [ ] ROI calculations are reasonable
- [ ] All pages rendered correctly
- [ ] Print quality is acceptable

---

## 🔧 Quick Troubleshooting

### "Survey response not found"
→ Check the ID is correct (24 hex characters)

### "Database connection failed"
→ Make sure MongoDB is running and MONGODB_URI is set in .env

### "PDF generation failed"
→ Install Chrome dependencies (see BENCHMARK_REPORT_USAGE_GUIDE.md)

### "Missing company name"
→ This survey response is incomplete, skip it or update database

---

## 📁 Output Location

All generated reports are saved to:
```
/workspaces/RivioForm/reports/
```

Filename format:
```
benchmark-report-{company-name}-{date}-{timestamp}.pdf
```

Example:
```
benchmark-report-abc-manufacturing-inc-2025-11-23-1763940576779.pdf
```

---

## 🎬 Complete Workflow Example

```bash
# 1. Check how many responses you have
curl http://localhost:5000/api/survey/stats

# 2. Get the 5 most recent responses
node backend/services/benchmark-report/generateReportFromDatabase.js --recent 5

# 3. Check the generated PDFs
ls -lht reports/*.pdf | head -5

# 4. Open first PDF to review
open reports/benchmark-report-*.pdf  # macOS
xdg-open reports/benchmark-report-*.pdf  # Linux

# 5. If good, send to users via email
```

---

## 💡 Pro Tips

1. **Start small**: Generate 1-2 reports first to verify quality
2. **Review before batch**: Check formatting with sample before generating 100 reports
3. **Filter wisely**: Use filters to target specific segments (e.g., high-value companies first)
4. **Monitor output**: Watch the console output for any errors during generation
5. **Keep backups**: Generated PDFs are your deliverables, back them up

---

## 📚 More Documentation

- **GENERATE_REPORTS_FROM_DATABASE.md** - Complete detailed guide
- **BENCHMARK_REPORT_USAGE_GUIDE.md** - System usage guide
- **BENCHMARK_REPORT_PLAN.md** - Architecture and design
- **BENCHMARK_REPORT_PHASE2_COMPLETE.md** - Implementation details

---

**Ready to generate your first report?**

```bash
# Get latest survey response and generate report
LATEST_ID=$(curl -s http://localhost:5000/api/survey?limit=1 | jq -r '.data[0]._id')
node backend/services/benchmark-report/generateReportFromDatabase.js $LATEST_ID
```
