# Admin Authentication Setup Guide

The admin dashboard is now protected with username/password authentication.

---

## Quick Setup

### Default Credentials (For Testing)

**Username**: `admin`
**Password**: `admin123`

⚠️ **IMPORTANT**: Change these credentials before deploying to production!

---

## For Production (Render Deployment)

### Step 1: Generate a Secure Password Hash

Run this command on your local machine:

```bash
cd backend
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR-SECURE-PASSWORD-HERE', 10).then(console.log);"
```

Replace `YOUR-SECURE-PASSWORD-HERE` with your desired password.

**Example output:**
```
$2a$10$8.LLl8wI23.Zr9oBU8e0Y.1VBwKuq/JfLu9hGDOgjQSuz.S.6tNYe
```

### Step 2: Add Environment Variables to Render

1. Go to your Render dashboard → Backend service
2. Click **Environment** tab
3. Add these two new environment variables:

| Key | Value |
|-----|-------|
| `ADMIN_USERNAME` | `admin` (or your preferred username) |
| `ADMIN_PASSWORD` | The hash from Step 1 |

**Example:**
- `ADMIN_USERNAME` = `admin`
- `ADMIN_PASSWORD` = `$2a$10$8.LLl8wI23.Zr9oBU8e0Y.1VBwKuq/JfLu9hGDOgjQSuz.S.6tNYe`

4. Click **Save**
5. Wait for Render to auto-redeploy (~2-3 minutes)

---

## How to Access Admin Dashboard

### 1. Navigate to Login Page

```
https://your-vercel-url.vercel.app/admin/login
```

Or try to access `/admin` directly - you'll be redirected to login.

### 2. Enter Credentials

- **Username**: The value you set in `ADMIN_USERNAME`
- **Password**: The **plain text** password (NOT the hash)

For example, if you used `admin123` to generate the hash:
- Username: `admin`
- Password: `admin123`

### 3. Access Dashboard

After successful login, you'll be redirected to:
```
https://your-vercel-url.vercel.app/admin
```

---

## Features

### ✅ Secure Login
- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens for session management
- Tokens expire after 7 days

### ✅ Session Persistence
- Stay logged in across browser refreshes
- Uses sessionStorage (cleared when browser closes)

### ✅ Logout
- Click the **Logout** button in the top-right corner
- Or close your browser to end the session

### ✅ Protected Routes
- `/admin` - Requires authentication
- `/admin/login` - Public login page
- `/landing` - Public landing page
- `/application` - Public application form

---

## Changing Your Password

### Option 1: Update in Render (Recommended)

1. Generate a new password hash locally:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('new-password', 10).then(console.log);"
   ```

2. Go to Render → Environment → `ADMIN_PASSWORD`
3. Replace with the new hash
4. Save (auto-redeploys)

### Option 2: Change Username

1. Go to Render → Environment → `ADMIN_USERNAME`
2. Update to your preferred username
3. Save

---

## Security Best Practices

### ✅ DO:
- Use a strong password (12+ characters, mixed case, numbers, symbols)
- Change default credentials immediately
- Keep your password private
- Log out after using the admin dashboard

### ❌ DON'T:
- Share your admin credentials
- Use the same password as other services
- Store passwords in plain text
- Commit credentials to Git

---

## Troubleshooting

### "Invalid credentials" error

**Check:**
1. Username matches `ADMIN_USERNAME` exactly (case-sensitive)
2. Password is the **plain text** password, NOT the hash
3. Environment variables are set in Render
4. Render has finished redeploying after adding variables

### Login page keeps redirecting back

**Solution:**
- Check browser console (F12) for errors
- Verify backend is running: `https://rivioform.onrender.com/api/health`
- Check CORS settings include your Vercel URL

### Can't stay logged in

**Cause:** sessionStorage is cleared

**Solutions:**
- Browser closed → sessionStorage cleared (expected behavior)
- Incognito mode → sessionStorage cleared on close
- Normal use: Should persist across page refreshes

### Backend returns 500 error on login

**Check Render logs:**
1. Render dashboard → Your service → Logs
2. Look for authentication errors
3. Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set

---

## Default Setup (For Testing Only)

If you want to test locally with default credentials:

### Backend `.env` file:
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=$2a$10$8.LLl8wI23.Zr9oBU8e0Y.1VBwKuq/JfLu9hGDOgjQSuz.S.6tNYe
```

This hash corresponds to password: `admin123`

**Login with:**
- Username: `admin`
- Password: `admin123`

---

## Technical Details

### Authentication Flow

1. User enters credentials on `/admin/login`
2. Frontend sends POST to `/api/auth/login`
3. Backend verifies username and hashed password
4. Backend returns JWT token (expires in 7 days)
5. Frontend stores token in sessionStorage
6. Admin dashboard checks for token on load
7. No token → redirect to login
8. Valid token → show dashboard

### API Endpoints

**POST `/api/auth/login`**
- Body: `{ username, password }`
- Returns: `{ success, data: { token, username } }`

**POST `/api/auth/verify`** (optional, for future use)
- Body: `{ token }`
- Returns: `{ success, data: { username, role } }`

---

## Multiple Admin Users (Future Enhancement)

Currently supports one admin account. To add multiple admins:

1. Create a User model in MongoDB
2. Add user management endpoints
3. Update login to check database instead of env vars
4. Add user creation/management UI

For now, single admin is secure and simple!

---

**Last Updated**: 2025-11-21
**Version**: 1.0.0
