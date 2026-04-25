# Praise & Pay Portal - Backend Server

A Node.js/Express backend API for the Praise & Pay Portal with MongoDB database support.

## Features

- RESTful API for praise management
- Secure admin authentication with bcrypt
- MongoDB database with Mongoose ODM
- Rate limiting and security middleware
- CORS support for cross-origin requests
- CSV data export functionality
- Health check endpoint
- Graceful shutdown handling

## Prerequisites

- Node.js 14+ 
- MongoDB 4.4+ (local or MongoDB Atlas)
- npm or yarn

## Installation

1. Install dependencies:
```bash
cd server
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` file with your configuration:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/praise-portal
# For MongoDB Atlas (cloud database):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/praise-portal

# CORS Configuration
FRONTEND_URL=http://localhost:8080
# For production:
# FRONTEND_URL=https://your-username.github.io/your-repo-name

# Admin Configuration
DEFAULT_ADMIN_PASSWORD=admin123
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### Praise Management
- `GET /api/praises` - Get all praises
- `GET /api/praises/recent?limit=5` - Get recent praises (default limit: 5)
- `POST /api/praises` - Submit new praise
- `GET /api/stats` - Get statistics

### Admin Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/change-password` - Change admin password

### Data Export
- `GET /api/export/csv` - Export all praises as CSV

### System
- `GET /api/health` - Health check

## Database Schema

### Praise Collection
```javascript
{
  name: String (required, max 100 chars),
  message: String (required, max 1000 chars),
  level: String (required, enum: ['Basic', 'Premium', 'Elite']),
  amount: Number (required, min: 0),
  emoji: String (required),
  timestamp: Date (default: current date),
  ipAddress: String,
  userAgent: String
}
```

### AdminSettings Collection
```javascript
{
  adminPassword: String (hashed with bcrypt),
  lastUpdated: Date,
  loginAttempts: Number,
  lastLoginAttempt: Date,
  lockoutUntil: Date
}
```

## Security Features

- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes per IP)
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Account lockout after failed login attempts (5 attempts, 15 minute lockout)

## Deployment Options

### 1. Local Development
1. Install MongoDB locally
2. Set `MONGODB_URI=mongodb://localhost:27017/praise-portal`
3. Run `npm run dev`

### 2. MongoDB Atlas (Cloud Database)
1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Set `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/praise-portal`
5. Add your IP to the whitelist in Atlas settings

### 3. Cloud Deployment (Heroku, Render, etc.)
1. Deploy the server to your preferred platform
2. Set environment variables in your deployment platform
3. Update `FRONTEND_URL` to match your frontend deployment URL
4. Ensure your MongoDB connection is accessible from the cloud

## Cross-Network Access

To enable cross-network database access:

1. **For MongoDB Atlas**: 
   - Configure IP whitelist to allow `0.0.0.0/0` (all IPs) or specific ranges
   - Enable network access from your server's IP

2. **For Self-Hosted MongoDB**:
   - Bind MongoDB to `0.0.0.0` instead of `127.0.0.1`
   - Configure firewall to allow port 27017
   - Set up authentication in MongoDB

3. **Update Frontend API URL**:
   - In `script.js`, update `API_BASE_URL` to point to your server URL
   - Example: `const API_BASE_URL = 'https://your-server-url.com/api';`

## Monitoring

The server includes:
- Request logging with timestamps and IP addresses
- Health check endpoint at `/api/health`
- Error handling and logging
- Graceful shutdown on SIGTERM/SIGINT

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment mode | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/praise-portal |
| FRONTEND_URL | Allowed frontend URL for CORS | http://localhost:8080 |
| DEFAULT_ADMIN_PASSWORD | Initial admin password | admin123 |

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB is running
   - Verify connection string format
   - Ensure network access to MongoDB

2. **CORS Errors**
   - Update `FRONTEND_URL` to match your frontend URL
   - Check that frontend URL includes protocol (http/https)

3. **Authentication Issues**
   - Verify admin password in database
   - Check for account lockout after failed attempts

4. **Rate Limiting**
   - Default: 100 requests per 15 minutes per IP
   - Adjust rate limiting settings in `server.js` if needed
