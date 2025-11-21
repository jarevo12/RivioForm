# RivioForm - Deployment Guide

Complete guide to deploy your RivioForm application to Vercel (Frontend) and Render (Backend).

---

## Overview

- **Frontend**: Next.js → Vercel (Free tier)
- **Backend**: Express.js → Render (Free tier)
- **Database**: MongoDB Atlas (Already configured ✅)

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Your Code

1. Make sure all changes are committed to your Git repository
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended for easier integration)

### Step 3: Deploy Backend Service

1. **Click "New +" → "Web Service"**

2. **Connect Repository**
   - Select your GitHub repository
   - Click "Connect"

3. **Configure Service**
   - **Name**: `rivio-backend` (or any name you prefer)
   - **Region**: Choose closest to you (e.g., Oregon, Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. **Add Environment Variables**

   Click "Advanced" → "Add Environment Variable" and add these:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGODB_URI` | `mongodb+srv://javiersg_db_user:vFv09QHQJ8yRZzJp@clusterrivioform.rto1p9w.mongodb.net/` |
   | `ALLOWED_ORIGINS` | `https://your-app-name.vercel.app` (update after deploying frontend) |
   | `JWT_SECRET` | (generate a random string: `openssl rand -base64 32`) |

5. **Click "Create Web Service"**

6. **Wait for deployment** (5-10 minutes)
   - You'll see build logs
   - When complete, you'll get a URL like: `https://rivio-backend.onrender.com`

7. **Test Your Backend**
   - Visit: `https://your-backend-url.onrender.com/api/health`
   - Should return: `{"status":"ok","message":"Rivio Backend API is running"}`

8. **Important: Copy your backend URL** - you'll need it for the frontend!

---

## Part 2: Configure MongoDB Atlas

### Update Network Access

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
2. Click "Network Access" in left sidebar
3. Click "Add IP Address"
4. Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - This allows Render's dynamic IPs to connect
5. Click "Confirm"

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)

### Step 2: Deploy Frontend

1. **Click "Add New..." → "Project"**

2. **Import Repository**
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected ✅)
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

4. **Add Environment Variables**

   Click "Environment Variables" and add:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend-url.onrender.com` |

   Replace with your actual Render backend URL from Part 1!

5. **Click "Deploy"**

6. **Wait for deployment** (2-3 minutes)
   - When complete, you'll get a URL like: `https://your-app-name.vercel.app`

---

## Part 4: Final Configuration

### Update Backend CORS

1. **Go back to Render dashboard**
2. **Open your backend service**
3. **Go to "Environment" tab**
4. **Update `ALLOWED_ORIGINS`**:
   ```
   https://your-actual-vercel-url.vercel.app
   ```
   (Replace with your actual Vercel URL)

5. **Click "Save Changes"**
6. **Service will automatically redeploy** (~2-3 minutes)

### Update Frontend API Configuration

The frontend is already configured to use `NEXT_PUBLIC_API_URL` - Vercel will use the environment variable you set!

---

## Part 5: Test Your Deployed Application

### Test the Full Flow

1. **Visit your Vercel URL**: `https://your-app.vercel.app/landing`
2. **Submit an email** on the landing page
3. **Fill out the application form**
4. **Submit the form**
5. **Check the admin dashboard**: `https://your-app.vercel.app/admin`

### Verify Backend Connection

Open browser console (F12) and check for:
- ✅ No CORS errors
- ✅ Successful API calls to your Render backend
- ✅ Data appearing in admin dashboard

---

## Environment Variables Reference

### Backend (Render)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://javiersg_db_user:vFv09QHQJ8yRZzJp@clusterrivioform.rto1p9w.mongodb.net/
ALLOWED_ORIGINS=https://your-vercel-url.vercel.app
JWT_SECRET=your-generated-secret-here
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://your-render-backend-url.onrender.com
```

---

## Common Issues & Solutions

### Issue 1: CORS Errors

**Symptom**: Console shows "CORS policy" errors

**Solution**:
1. Check `ALLOWED_ORIGINS` in Render includes your exact Vercel URL
2. Make sure there's no trailing slash
3. Backend needs to redeploy after changing env vars

### Issue 2: "Cannot connect to backend"

**Symptom**: Frontend can't reach API

**Solution**:
1. Verify `NEXT_PUBLIC_API_URL` in Vercel is correct
2. Check your Render backend is running (not sleeping)
3. Test backend health: `https://your-backend.onrender.com/api/health`

### Issue 3: MongoDB Connection Failed

**Symptom**: Backend logs show "MongooseError"

**Solution**:
1. Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
2. Verify `MONGODB_URI` is correct in Render
3. Check MongoDB cluster is running

### Issue 4: Backend is Slow on First Load

**Symptom**: First request takes 30+ seconds

**Solution**:
- This is normal on Render's free tier
- Service "sleeps" after 15 minutes of inactivity
- First request wakes it up (cold start)
- Consider paid tier ($7/mo) for always-on service

---

## Automatic Deployments

### Auto-Deploy on Git Push

Both Vercel and Render auto-deploy when you push to your repository!

```bash
# Make changes to your code
git add .
git commit -m "Update application"
git push origin main

# Vercel and Render will automatically deploy the changes
```

### Preview Deployments (Vercel)

- Every branch gets a preview URL
- Perfect for testing before merging to main
- Example: `https://your-app-git-feature-branch.vercel.app`

---

## Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Go to Vercel project → Settings → Domains
2. Add your domain (e.g., `rivioform.com`)
3. Update DNS records as instructed
4. Update backend `ALLOWED_ORIGINS` to include your domain

### Add Custom Domain to Render

1. Go to Render service → Settings → Custom Domain
2. Add your API domain (e.g., `api.rivioform.com`)
3. Update DNS records as instructed
4. Update Vercel `NEXT_PUBLIC_API_URL` to your custom domain

---

## Monitoring & Logs

### View Backend Logs (Render)

1. Go to Render dashboard
2. Open your service
3. Click "Logs" tab
4. View real-time logs

### View Frontend Logs (Vercel)

1. Go to Vercel dashboard
2. Open your project
3. Click "Deployments" → Select deployment → "View Function Logs"

### Monitor Database (MongoDB Atlas)

1. Go to MongoDB Atlas
2. Click "Metrics" tab
3. View connections, operations, storage

---

## Cost Breakdown

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Vercel** | 100GB bandwidth/month | $20/mo (Pro) |
| **Render** | 750 hours/month (sleeps after 15min) | $7/mo (always-on) |
| **MongoDB Atlas** | 512MB storage | $9/mo (2GB) |
| **Total** | $0/month | ~$36/month |

Free tier is perfect for:
- Personal projects
- Demos
- Low-traffic applications
- Development/testing

---

## Scaling Considerations

### When to Upgrade

**Vercel**: When you exceed bandwidth or need team features

**Render**: When:
- Cold starts become annoying (15min sleep)
- You need better performance
- Traffic increases significantly

**MongoDB**: When storage exceeds 512MB

---

## Security Checklist

- ✅ MongoDB Atlas IP whitelist configured
- ✅ Environment variables set (not hardcoded)
- ✅ CORS properly configured
- ✅ Rate limiting enabled (already in your backend)
- ✅ Helmet.js security headers (already in your backend)
- ⚠️ Consider adding authentication for admin dashboard
- ⚠️ Rotate MongoDB credentials periodically

---

## Next Steps

After deployment:

1. ✅ Test the entire application flow
2. ✅ Share the Vercel URL with users
3. ✅ Monitor logs for errors
4. ✅ Set up error tracking (optional: Sentry)
5. ✅ Configure email notifications (Nodemailer already set up)

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Next.js Docs**: https://nextjs.org/docs

---

## URLs Checklist

After deployment, you'll have:

| Service | URL | Example |
|---------|-----|---------|
| **Frontend** | Your Vercel URL | `https://rivio-form.vercel.app` |
| **Backend API** | Your Render URL | `https://rivio-backend.onrender.com` |
| **Landing Page** | `/landing` | `https://rivio-form.vercel.app/landing` |
| **Application** | `/application` | `https://rivio-form.vercel.app/application` |
| **Admin Dashboard** | `/admin` | `https://rivio-form.vercel.app/admin` |
| **API Health** | `/api/health` | `https://rivio-backend.onrender.com/api/health` |

---

**Ready to deploy?** Follow the steps in order, and you'll have your app live in under 30 minutes!

**Questions?** Check the troubleshooting section or review the logs in Render/Vercel dashboards.

**Last Updated**: 2025-11-21
**Version**: 1.0.0
