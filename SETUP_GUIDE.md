# RivioForm - Setup & Launch Guide

This guide contains all the commands needed to run the RivioForm application.

## 📋 Prerequisites

Make sure you have the following installed:
- Node.js (v18 or higher)
- npm (v9 or higher)
- Git

---

## 🚀 Quick Start

### 1. Backend Setup & Launch

```bash
# Navigate to the backend directory
cd /workspaces/RivioForm/backend

# Install dependencies (only needed first time or after package.json changes)
npm install

# Start the backend server in development mode
npm run dev
```

**Expected Output:**
```
✅ MongoDB connected: ac-ovhkda5-shard-00-00.rto1p9w.mongodb.net
✅ Database connected successfully
🚀 Rivio Backend Server running on port 5000
📍 Environment: development
🔗 API Base URL: http://localhost:5000/api
```

**Alternative Commands:**
- Production mode: `npm start`
- Run tests: `npm test`
- Seed database: `npm run seed`

---

### 2. Frontend Setup & Launch

```bash
# Navigate to the project root directory
cd /workspaces/RivioForm

# Install dependencies (only needed first time or after package.json changes)
npm install

# Start the Next.js development server
npm run dev
```

**Expected Output:**
```
▲ Next.js 16.0.3 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://10.0.1.129:3000

✓ Starting...
✓ Ready in 624ms
```

**Alternative Commands:**
- Build for production: `npm run build`
- Start production server: `npm start`
- Run linter: `npm run lint`

---

## 🌐 Access URLs

Once both servers are running, you can access:

| Page | URL | Description |
|------|-----|-------------|
| **Landing Page** | http://localhost:3000/landing | Main landing page with email form |
| **Application Form** | http://localhost:3000/application | Full application form (accessed after landing) |
| **Admin Dashboard** | http://localhost:3000/admin | View all applicants and statistics |
| **Backend API** | http://localhost:5000/api | Backend API endpoints |
| **Health Check** | http://localhost:5000/api/health | Backend health status |

---

## 📝 Running Both Servers Simultaneously

### Option 1: Using Two Terminal Windows

**Terminal 1 - Backend:**
```bash
cd /workspaces/RivioForm/backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /workspaces/RivioForm && npm run dev
```

### Option 2: Using Background Processes (Single Terminal)

```bash
# Start backend in background
cd /workspaces/RivioForm/backend && npm run dev &

# Start frontend in foreground
cd /workspaces/RivioForm && npm run dev
```

To stop background processes:
```bash
# Find the process IDs
ps aux | grep node

# Kill the processes
kill <PID>
```

---

## 🔧 Environment Configuration

### Backend Environment Variables

Location: `/workspaces/RivioForm/backend/.env`

Key variables:
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://javiersg_db_user:vFv09QHQJ8yRZzJp@clusterrivioform.rto1p9w.mongodb.net/
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000
```

### Frontend Configuration

Location: `/workspaces/RivioForm/next.config.js`

```javascript
allowedDevOrigins: [
  'http://127.0.0.1:3000',
  'http://localhost:3000',
  'http://10.0.0.6:3000',
  'http://10.0.1.129:3000'
]
```

---

## 🛠️ Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is already in use
lsof -i :5000

# Kill the process using port 5000
kill -9 <PID>

# Restart MongoDB connection (if needed)
cd /workspaces/RivioForm/backend && npm run dev
```

### Frontend won't start
```bash
# Check if port 3000 is already in use
lsof -i :3000

# Kill the process using port 3000
kill -9 <PID>

# Clear Next.js cache and restart
rm -rf .next
npm run dev
```

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes your current IP
- Check that credentials in `.env` are correct
- Ensure MongoDB cluster is running

### CORS Errors
- Make sure backend `ALLOWED_ORIGINS` includes `http://localhost:3000`
- Verify frontend is accessing `http://localhost:5000` (not `http://127.0.0.1:5000`)

---

## 📊 API Endpoints Reference

### Public Endpoints
- `POST /api/applicants` - Submit new application
- `GET /api/health` - Health check

### Admin Endpoints (for dashboard)
- `GET /api/applicants` - Get all applicants (with pagination)
- `GET /api/applicants/stats` - Get statistics
- `GET /api/applicants/:id` - Get single applicant
- `PUT /api/applicants/:id` - Update applicant
- `DELETE /api/applicants/:id` - Delete applicant
- `POST /api/applicants/:id/contact` - Mark as contacted
- `POST /api/applicants/:id/schedule` - Schedule interview
- `POST /api/applicants/:id/complete` - Mark interview complete
- `POST /api/applicants/:id/gift-card` - Mark gift card sent

---

## 📦 Project Structure

```
RivioForm/
├── app/                    # Next.js app directory
│   ├── landing/           # Landing page
│   ├── application/       # Application form page
│   └── admin/             # Admin dashboard
├── backend/               # Express.js backend
│   ├── config/           # Database, logger, email config
│   ├── controllers/      # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Validation & error handling
│   └── server.js         # Main server file
└── package.json          # Frontend dependencies
```

---

## 🔄 Daily Workflow

1. **Start working:**
   ```bash
   # Terminal 1: Start backend
   cd /workspaces/RivioForm/backend && npm run dev

   # Terminal 2: Start frontend
   cd /workspaces/RivioForm && npm run dev
   ```

2. **During development:**
   - Both servers auto-reload on file changes
   - Backend logs appear in Terminal 1
   - Frontend logs appear in Terminal 2

3. **View data:**
   - Open http://localhost:3000/admin
   - Or check MongoDB Atlas dashboard

4. **Shutdown:**
   - Press `Ctrl+C` in both terminals
   - Or close the terminal windows

---

## 📝 Testing the Application

### Test Form Submission
1. Go to http://localhost:3000/landing
2. Enter an email and click "Get Started"
3. Fill out the application form
4. Submit and verify success message

### Verify Data Storage
1. Go to http://localhost:3000/admin
2. You should see the new applicant listed
3. Statistics should update automatically

### Check Backend Logs
Look for this in the backend terminal:
```
info: New applicant created: user@example.com
POST /api/applicants 201
```

---

## 🔐 Security Notes

- The `.env` file contains sensitive credentials (not committed to git)
- MongoDB credentials are for development only
- Rate limiting: 5 form submissions per hour per IP
- API requests: 100 per 15 minutes per IP

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review backend logs for error messages
3. Verify all environment variables are set correctly
4. Ensure MongoDB Atlas cluster is accessible

---

**Last Updated:** 2025-11-20
**Version:** 1.1.0
