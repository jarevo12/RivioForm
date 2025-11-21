# Deployment Checklist

Quick checklist to deploy RivioForm to Vercel + Render.

## Before You Start

- [ ] All code changes committed to Git
- [ ] GitHub repository up to date
- [ ] MongoDB Atlas cluster is active

---

## Backend Deployment (Render)

### 1. Deploy Service
- [ ] Sign up at [render.com](https://render.com)
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Set root directory: `backend`
- [ ] Set build command: `npm install`
- [ ] Set start command: `npm start`

### 2. Environment Variables (Render)
Add these in Render dashboard under "Environment":

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`
- [ ] `MONGODB_URI` = (your MongoDB Atlas connection string)
- [ ] `ALLOWED_ORIGINS` = (will update after frontend deployment)
- [ ] `JWT_SECRET` = (generate with: `openssl rand -base64 32`)

### 3. Deploy & Test
- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete (~5-10 min)
- [ ] Copy your Render URL (e.g., `https://rivio-backend.onrender.com`)
- [ ] Test health endpoint: `https://your-backend-url.onrender.com/api/health`
- [ ] Should return: `{"status":"ok",...}`

---

## MongoDB Configuration

- [ ] Go to MongoDB Atlas dashboard
- [ ] Navigate to "Network Access"
- [ ] Add IP: `0.0.0.0/0` (allow from anywhere)
- [ ] Save changes

---

## Frontend Deployment (Vercel)

### 1. Deploy Project
- [ ] Sign up at [vercel.com](https://vercel.com)
- [ ] Click "Add New..." → "Project"
- [ ] Import your GitHub repository
- [ ] Framework preset: Next.js (auto-detected)

### 2. Environment Variables (Vercel)
Add this in Vercel project settings:

- [ ] `NEXT_PUBLIC_API_URL` = (your Render backend URL from above)
  - Example: `https://rivio-backend.onrender.com`

### 3. Deploy & Test
- [ ] Click "Deploy"
- [ ] Wait for deployment (~2-3 min)
- [ ] Copy your Vercel URL (e.g., `https://rivio-form.vercel.app`)
- [ ] Test landing page: `https://your-app.vercel.app/landing`

---

## Final Configuration

### 1. Update Backend CORS
- [ ] Go back to Render dashboard
- [ ] Open your backend service
- [ ] Go to "Environment" tab
- [ ] Update `ALLOWED_ORIGINS` with your Vercel URL:
  - Example: `https://rivio-form.vercel.app`
- [ ] Save (service will auto-redeploy)

### 2. Wait for Backend Redeploy
- [ ] Wait ~2-3 minutes for backend to redeploy
- [ ] Check Render logs for successful restart

---

## Testing

### Test Complete Flow
- [ ] Visit: `https://your-app.vercel.app/landing`
- [ ] Enter email and click "Get Started"
- [ ] Fill out application form
- [ ] Submit form
- [ ] Check for success message
- [ ] Visit admin dashboard: `https://your-app.vercel.app/admin`
- [ ] Verify new application appears

### Check Browser Console
- [ ] Open DevTools (F12)
- [ ] Check Console tab for errors
- [ ] Verify no CORS errors
- [ ] Check Network tab for successful API calls

---

## Post-Deployment

### URLs to Save
Write down your deployed URLs:

- Frontend: `https://_________________.vercel.app`
- Backend: `https://_________________.onrender.com`
- Admin Dashboard: `https://_________________.vercel.app/admin`

### Share Your App
Your app is now live! Share the landing page URL with users:
- Landing page: `https://your-app.vercel.app/landing`

### Monitor
- [ ] Check Render logs for backend errors
- [ ] Check Vercel function logs for frontend errors
- [ ] Monitor MongoDB Atlas for database activity

---

## Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Check `ALLOWED_ORIGINS` in Render matches Vercel URL exactly |
| Backend unreachable | Verify Render service is running (not sleeping) |
| MongoDB connection fails | Ensure IP whitelist includes `0.0.0.0/0` |
| Slow first load | Normal on free tier - backend wakes from sleep |

---

## Optional: Custom Domain

### Add Custom Domain to Vercel
1. Go to project Settings → Domains
2. Add your domain (e.g., `app.yourdomain.com`)
3. Update DNS as instructed

### Add Custom Domain to Render
1. Go to service Settings → Custom Domain
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Update DNS as instructed

### Update Environment Variables
- Update Vercel `NEXT_PUBLIC_API_URL` to your custom backend domain
- Update Render `ALLOWED_ORIGINS` to your custom frontend domain

---

## Need Help?

Refer to the full deployment guide: `DEPLOYMENT_GUIDE.md`

---

**Estimated Time**: 20-30 minutes
**Cost**: Free (with limitations) or ~$36/month for paid tiers
