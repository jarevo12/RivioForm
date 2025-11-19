# Rivio Backend API

Complete backend API for the Rivio trade credit insurance application form, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **RESTful API** - Complete CRUD operations for applicant management
- **MongoDB Integration** - Robust database with Mongoose ODM
- **Email Notifications** - Automated emails to admin and applicants
- **Input Validation** - Comprehensive request validation using express-validator
- **Rate Limiting** - Protection against abuse and spam
- **Error Handling** - Centralized error handling with detailed logging
- **Security** - Helmet.js, CORS, and security best practices
- **Logging** - Winston logger with file rotation
- **Health Checks** - Monitoring endpoints for system health

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0 (local or Atlas)
- npm >= 9.0.0

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - MongoDB connection string
   - SMTP credentials for email
   - Admin email address
   - CORS allowed origins

3. **Start MongoDB** (if running locally):
   ```bash
   # macOS/Linux
   mongod --dbpath /path/to/data/db

   # Windows
   mongod --dbpath C:\path\to\data\db

   # Or use MongoDB Atlas (cloud)
   ```

## 🏃 Running the Server

### Development Mode
```bash
npm run dev
```
Starts the server with nodemon (auto-restart on file changes)

### Production Mode
```bash
npm start
```

### Seed Database (Optional)
```bash
npm run seed
```
Adds sample applicant data for testing

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Health Checks
```http
GET /api/health                # Basic health check
GET /api/health/database       # Database health check
GET /api/health/detailed       # Detailed system health
```

#### Applicants

**Create Applicant**
```http
POST /api/applicants
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "organization": "ACME Corp",
  "position": "CFO",
  "phone": "+1 (555) 123-4567"  // Optional
}
```

**Get All Applicants**
```http
GET /api/applicants?page=1&limit=10&status=pending&search=john
```

Query Parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (pending, contacted, scheduled, completed, cancelled)
- `search` - Search in names, email, organization
- `sortBy` - Sort field (default: createdAt)
- `order` - Sort order: asc/desc (default: desc)

**Get Applicant by ID**
```http
GET /api/applicants/:id
```

**Update Applicant**
```http
PUT /api/applicants/:id
Content-Type: application/json

{
  "firstName": "Jane",
  "status": "contacted",
  "notes": "Contacted via email"
}
```

**Delete Applicant**
```http
DELETE /api/applicants/:id
```

**Get Statistics**
```http
GET /api/applicants/stats
```

**Mark as Contacted**
```http
POST /api/applicants/:id/contact
```

**Schedule Interview**
```http
POST /api/applicants/:id/schedule
Content-Type: application/json

{
  "interviewDate": "2025-12-01T14:00:00Z"
}
```

**Complete Interview**
```http
POST /api/applicants/:id/complete
```

**Send Gift Card**
```http
POST /api/applicants/:id/gift-card
```

## 🗂️ Project Structure

```
backend/
├── config/              # Configuration files
│   ├── database.js      # MongoDB connection
│   ├── email.js         # Email service (Nodemailer)
│   └── logger.js        # Winston logger
├── controllers/         # Request handlers
│   └── applicant.controller.js
├── middleware/          # Custom middleware
│   ├── errorHandler.js  # Global error handler
│   └── validators.js    # Request validation
├── models/             # Mongoose models
│   └── Applicant.js
├── routes/             # API routes
│   ├── applicant.routes.js
│   └── health.routes.js
├── utils/              # Utility functions
│   └── seedDatabase.js
├── logs/               # Log files (auto-generated)
│   ├── combined.log
│   └── error.log
├── .env.example        # Environment variables template
├── package.json
├── README.md
└── server.js           # Application entry point
```

## 🔒 Security Features

- **Helmet.js** - Sets various HTTP headers for security
- **CORS** - Configurable cross-origin resource sharing
- **Rate Limiting** - Prevents abuse (100 req/15min general, 5 req/hour for forms)
- **Input Validation** - Sanitizes and validates all inputs
- **MongoDB Injection Prevention** - Mongoose sanitization

## 📧 Email Configuration

The backend sends two emails on each submission:

1. **Admin Notification** - Sent to admin with applicant details
2. **Applicant Confirmation** - Sent to applicant confirming receipt

### Gmail Setup (Example)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use in `.env`:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

### Other Email Providers

- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`
- **AWS SES**: `email-smtp.region.amazonaws.com:587`

## 🧪 Testing

### Manual Testing with cURL

**Create an applicant:**
```bash
curl -X POST http://localhost:5000/api/applicants \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "organization": "Test Corp",
    "position": "Manager"
  }'
```

**Get all applicants:**
```bash
curl http://localhost:5000/api/applicants
```

**Health check:**
```bash
curl http://localhost:5000/api/health/detailed
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running:
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod --dbpath /path/to/data/db
```

### Email Not Sending
```
Error: Invalid login: 535 5.7.8 Username and Password not accepted
```
**Solution:**
- Use App-specific password for Gmail
- Check SMTP credentials in `.env`
- Verify SMTP settings for your provider

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
PORT=5001
```

## 🔄 Integration with Frontend

Update your Next.js frontend to use the API:

```typescript
// app/application/page.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await fetch('http://localhost:5000/api/applicants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.success) {
      setSubmitted(true);
    } else {
      // Handle errors
      console.error(data.message);
    }
  } catch (error) {
    console.error('Submission failed:', error);
  }
};
```

## 📊 Monitoring

### Logs Location
- **Combined logs**: `logs/combined.log`
- **Error logs**: `logs/error.log`

### View Logs in Real-time
```bash
tail -f logs/combined.log
```

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure production MongoDB (MongoDB Atlas recommended)
- [ ] Set up proper SMTP service (SendGrid, Mailgun, etc.)
- [ ] Configure correct `ALLOWED_ORIGINS`
- [ ] Set up reverse proxy (Nginx)
- [ ] Enable HTTPS
- [ ] Set up process manager (PM2)
- [ ] Configure firewall rules
- [ ] Set up monitoring (Datadog, New Relic, etc.)

### PM2 Deployment
```bash
npm install -g pm2
pm2 start server.js --name rivio-api
pm2 save
pm2 startup
```

## 📝 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment (development/production) | development | No |
| `PORT` | Server port | 5000 | No |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/rivio | Yes |
| `ALLOWED_ORIGINS` | CORS allowed origins | http://localhost:3000 | No |
| `SMTP_HOST` | SMTP server host | smtp.gmail.com | Yes |
| `SMTP_PORT` | SMTP server port | 587 | Yes |
| `SMTP_USER` | SMTP username/email | - | Yes |
| `SMTP_PASS` | SMTP password | - | Yes |
| `ADMIN_EMAIL` | Admin notification email | admin@rivio.com | Yes |

## 📄 License

MIT

## 👥 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for Rivio**
