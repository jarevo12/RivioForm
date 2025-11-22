# Credit Risk Survey - Deployment Guide

Complete guide to deploy your Credit Risk Management Survey to Vercel (Frontend) and Render (Backend).

---

## Overview

- **Frontend**: Next.js Survey Application → Vercel (Free tier)
- **Backend**: Express.js API → Render (Free tier)
- **Database**: MongoDB Atlas (Already configured ✅)

---

## Quick Summary

1. **Deploy Backend to Render** (10 minutes)
2. **Deploy Frontend to Vercel** (5 minutes)
3. **Update CORS settings** (2 minutes)
4. **Test the survey** (5 minutes)

**Total Time**: ~25 minutes

---

## Part 1: Deploy Backend to Render

### Step 1: Commit Your Code

```bash
cd /workspaces/RivioForm
git add .
git commit -m "Deploy Credit Risk Survey to production"
git push origin survey-implementation
```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 3: Deploy Backend Service

1. **Click "New +" → "Web Service"**

2. **Connect Repository**
   - Select your `RivioForm` repository
   - Click "Connect"

3. **Configure Service**
   - **Name**: `rivio-survey-backend`
   - **Branch**: `survey-implementation`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. **Add Environment Variables**

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGODB_URI` | `mongodb+srv://javiersg_db_user:vFv09QHQJ8yRZzJp@clusterrivioform.rto1p9w.mongodb.net/` |
   | `ALLOWED_ORIGINS` | `https://your-app-name.vercel.app` (update after deploying frontend) |
   | `JWT_SECRET` | Run: `openssl rand -base64 32` and paste result |

5. **Click "Create Web Service"**

6. **Wait 5-10 minutes** - Monitor build logs

7. **Copy Your Backend URL**
   - Example: `https://rivio-survey-backend.onrender.com`
   - **Save this - you'll need it for the frontend!**

8. **Test Backend**
   ```bash
   curl https://your-backend-url.onrender.com/api/health
   ```
   Should return: `{"status":"ok",...}`

---

## Part 2: Configure MongoDB Atlas

### Update Network Access

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click "Network Access"
3. Click "Add IP Address"
4. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Click "Confirm"

✅ This allows Render's dynamic IPs to connect

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### Step 2: Deploy Frontend

1. **Click "Add New..." → "Project"**

2. **Import Repository**
   - Select your `RivioForm` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js ✅
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **IMPORTANT: Set Git Branch**
   - Click "Git" section
   - **Production Branch**: `survey-implementation`

5. **Add Environment Variables**

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend-url.onrender.com` |

   ⚠️ Replace with your **actual Render backend URL** from Part 1!

6. **Click "Deploy"**

7. **Wait 2-3 minutes**

8. **Copy Your Frontend URL**
   - Example: `https://rivio-survey.vercel.app`

---

## Part 4: Update Backend CORS

Now that you have both URLs, update the backend to allow frontend requests:

1. **Go to Render Dashboard**
2. **Open `rivio-survey-backend` service**
3. **Click "Environment" tab**
4. **Update `ALLOWED_ORIGINS`**:
   ```
   https://your-actual-vercel-url.vercel.app
   ```
5. **Click "Save Changes"**
6. **Wait 2-3 minutes** for automatic redeploy

---

## Part 5: Test Your Survey

### Test the Complete Flow

1. **Visit Landing Page**
   ```
   https://your-vercel-url.vercel.app/landing
   ```

2. **Start the Survey**
   - Click "START SURVEY"
   - Should redirect to `/application`

3. **Complete Survey**
   - Answer all questions through the conditional flow
   - Test different paths:
     - ✅ Screen out (B2B < 25%)
     - ✅ No bad debt path
     - ✅ Bad debt path
     - ✅ TCI user path
     - ✅ Full path with all questions

4. **Submit Survey**
   - Fill email capture (optional)
   - Click "Submit Survey"
   - Should see thank you screen

5. **Verify Backend Storage**
   - Open browser console (F12)
   - Check Network tab for successful POST to `/api/survey`
   - Status should be `201 Created`

### Check Survey Data

Option 1 - Via Admin Dashboard (if you kept it):
```
https://your-vercel-url.vercel.app/admin
```

Option 2 - Via Backend API (requires auth):
```bash
curl https://your-backend-url.onrender.com/api/survey/stats
```

---

## Environment Variables Reference

### Backend (Render)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://javiersg_db_user:vFv09QHQJ8yRZzJp@clusterrivioform.rto1p9w.mongodb.net/
ALLOWED_ORIGINS=https://your-vercel-url.vercel.app
JWT_SECRET=your-random-32-char-secret
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://your-render-backend-url.onrender.com
```

---

## Survey-Specific Features to Test

### 1. Conditional Logic Paths

Test all 4 survey paths:

**Path 1: No bad debt, no TCI** (14 questions)
- Q1: 76-100%
- Q4: No, never
- Q10: Don't select "Trade Credit Insurance"

**Path 2: Bad debt, no TCI** (18 questions)
- Q1: 76-100%
- Q4: Yes, multiple times
- Q5-Q7a: Answer bad debt questions
- Q10: Don't select "Trade Credit Insurance"

**Path 3: No bad debt, with TCI** (20 questions)
- Q1: 76-100%
- Q4: No, never
- Q10: Select "Trade Credit Insurance"
- Q11-Q16: Answer TCI questions

**Path 4: Full path** (20 questions)
- Q1: 76-100%
- Q4: Yes, multiple times
- Q5-Q7a: Answer bad debt questions
- Q10: Select "Trade Credit Insurance"
- Q11-Q16: Answer TCI questions

### 2. State Persistence

Test that progress is saved:
1. Start survey, answer a few questions
2. Refresh page (F5)
3. Should resume at same section with answers preserved

### 3. Screen Out Logic

Test screen out:
- Q1: Select "Less than 25%"
- Should show screen-out message
- Click "Return to Home" → goes to landing

### 4. Email Capture

Test deliverable selection:
- Complete survey
- Select deliverables (Benchmark Report, Research Report, Consultation)
- Enter email
- Submit
- Email should be stored in database

---

## Common Issues & Solutions

### Issue 1: Survey won't submit

**Symptom**: Submit button disabled or shows error

**Solution**:
1. Open browser console (F12)
2. Check for validation errors
3. Ensure all required fields are filled
4. Check network tab for API errors

### Issue 2: Progress not saving

**Symptom**: Page refresh loses progress

**Solution**:
1. Check browser console for errors
2. Verify sessionStorage is enabled
3. Try incognito mode (some extensions block storage)

### Issue 3: CORS Errors

**Symptom**: "CORS policy" errors in console

**Solution**:
1. Verify `ALLOWED_ORIGINS` in Render matches exact Vercel URL
2. No trailing slash in URL
3. Wait for backend redeploy (takes 2-3 min after env change)

### Issue 4: Backend Cold Start (Slow First Load)

**Symptom**: First survey submission takes 30+ seconds

**Solution**:
- This is **normal** on Render free tier
- Service sleeps after 15 minutes of inactivity
- First request wakes it up (cold start)
- Subsequent requests are fast
- Upgrade to paid tier ($7/mo) for always-on

---

## Monitoring Survey Responses

### View Responses in MongoDB

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click "Browse Collections"
3. Select `surveyresponses` collection
4. View all submitted surveys

### Export Survey Data

Use the backend API endpoint:
```bash
curl https://your-backend-url.onrender.com/api/survey/export/csv > survey-responses.csv
```

### View Statistics

```bash
curl https://your-backend-url.onrender.com/api/survey/stats
```

Returns:
- Total responses
- Responses by path
- TCI users count
- Average completion time
- Email capture rate

---

## Automatic Deployments

### Deploy Updates

Every time you push to the `survey-implementation` branch:

```bash
git add .
git commit -m "Update survey questions"
git push origin survey-implementation
```

Both Vercel and Render will **automatically redeploy**!

### Vercel Preview Deployments

- Every PR gets a unique preview URL
- Perfect for testing changes before merging
- Preview URL format: `https://rivio-survey-git-feature.vercel.app`

---

## Custom Domain (Optional)

### Add Custom Domain to Frontend

1. Vercel Dashboard → Settings → Domains
2. Add your domain: `survey.yourcompany.com`
3. Update DNS as instructed
4. Update backend `ALLOWED_ORIGINS` to include custom domain

### Add Custom Domain to Backend

1. Render Dashboard → Settings → Custom Domain
2. Add API domain: `api-survey.yourcompany.com`
3. Update DNS records
4. Update Vercel `NEXT_PUBLIC_API_URL` to custom domain

---

## Cost Breakdown

| Service | Free Tier | Usage | Notes |
|---------|-----------|-------|-------|
| **Vercel** | 100GB bandwidth/month | Survey is lightweight | Usually stays free |
| **Render** | 750 hours/month | Sleeps after 15min | Free for low traffic |
| **MongoDB** | 512MB storage | ~5000 responses | Free for months |

**Survey Response Storage**: ~100KB per response
- 512MB = ~5,000 survey responses
- Should last several months on free tier

---

## Security Checklist

- ✅ MongoDB IP whitelist: 0.0.0.0/0
- ✅ Environment variables in Render/Vercel (not in code)
- ✅ CORS configured correctly
- ✅ Rate limiting enabled (5 submissions/hour per IP)
- ✅ Survey data anonymous (IP stored but optional email)
- ✅ Helmet.js security headers enabled
- ⚠️ Consider admin authentication if keeping dashboard

---

## URLs After Deployment

| Page | URL |
|------|-----|
| **Survey Welcome** | `https://your-app.vercel.app/landing` |
| **Survey Form** | `https://your-app.vercel.app/application` |
| **Backend Health** | `https://your-backend.onrender.com/api/health` |
| **Survey Stats** | `https://your-backend.onrender.com/api/survey/stats` |
| **Admin (optional)** | `https://your-app.vercel.app/admin` |

---

## Next Steps After Deployment

1. ✅ Test all 4 survey paths thoroughly
2. ✅ Share survey URL with target respondents
3. ✅ Monitor response rate in MongoDB
4. ✅ Download responses periodically (CSV export)
5. ✅ Set up alerts for errors (optional: Sentry)
6. ✅ Consider paid tier if traffic increases

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Next.js**: https://nextjs.org/docs

---

## Survey Launch Checklist

Before sharing with respondents:

- [ ] Test all 4 survey paths
- [ ] Test screen-out logic
- [ ] Test state persistence (refresh page)
- [ ] Test on mobile devices
- [ ] Test email capture
- [ ] Verify data appears in MongoDB
- [ ] Test export to CSV
- [ ] Check completion time (should be ~5 min)
- [ ] Proofread all questions
- [ ] Test thank you screen

---

**Your survey is ready to go live!** 🚀

**Estimated time to complete deployment: 25 minutes**

**Questions?** Check troubleshooting section or review logs in Render/Vercel dashboards.

---

**Created**: 2025-11-22
**Survey Version**: V4 (Enhanced Survey Script)
**Branch**: `survey-implementation`
