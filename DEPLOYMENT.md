# Cross-Network Database Deployment Guide

This guide will help you deploy your Praise & Pay Portal with a cross-network database that can be accessed from anywhere.

## Quick Start

### Option 1: MongoDB Atlas (Recommended)
1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier is sufficient)
3. Get your connection string from Atlas
4. Update the server configuration
5. Deploy the backend server

### Option 2: Docker Deployment
1. Use the provided Docker configuration
2. Run with docker-compose for easy setup

## Step-by-Step Deployment

### 1. Set Up MongoDB Atlas (Cloud Database)

1. **Sign Up**: Go to https://www.mongodb.com/cloud/atlas and create a free account

2. **Create Cluster**:
   - Click "Build a Cluster"
   - Choose "M0 Sandbox" (free tier)
   - Select a cloud provider and region closest to your users
   - Give your cluster a name

3. **Configure Network Access**:
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0) for cross-network access
   - Or add specific IP ranges if preferred

4. **Create Database User**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create a username and strong password
   - Give read/write permissions

5. **Get Connection String**:
   - Go to "Clusters" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user's password

### 2. Configure Backend Server

1. **Navigate to Server Directory**:
```bash
cd server
```

2. **Install Dependencies**:
```bash
npm install
```

3. **Create Environment File**:
```bash
cp .env.example .env
```

4. **Edit .env File**:
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration (replace with your Atlas connection string)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/praise-portal

# CORS Configuration (update with your frontend URL)
FRONTEND_URL=https://your-username.github.io/Praise-Me-Please-

# Admin Configuration
DEFAULT_ADMIN_PASSWORD=admin123
```

5. **Test Locally**:
```bash
npm start
```
The server should start on http://localhost:3000

### 3. Deploy Backend Server

#### Option A: Heroku (Free Tier)
1. Install Heroku CLI
2. Create a new app: `heroku create your-app-name`
3. Set environment variables:
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/praise-portal
heroku config:set FRONTEND_URL=https://your-username.github.io/Praise-Me-Please-
```
4. Deploy: `git push heroku master`

#### Option B: Render (Free Tier)
1. Sign up at https://render.com
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Set environment variables in Render dashboard
5. Deploy automatically

#### Option C: Railway (Free Tier)
1. Sign up at https://railway.app
2. Create a new project
3. Import from GitHub
4. Set environment variables
5. Deploy

#### Option D: Docker (Self-Hosted)
1. Install Docker and Docker Compose
2. Run: `docker-compose up -d`
3. This will start both the app and MongoDB locally

### 4. Update Frontend Configuration

1. **Edit script.js**:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://your-backend-url.com/api'; // Update this with your deployed backend URL
```

2. **Deploy Frontend to GitHub Pages**:
   - Your frontend is already set up for GitHub Pages
   - Make sure GitHub Pages is enabled in your repository settings

### 5. Test Cross-Network Access

1. **Test API Health**:
   - Open your browser and go to `https://your-backend-url.com/api/health`
   - You should see: `{"success": true, "message": "Server is running"}`

2. **Test Frontend**:
   - Go to your GitHub Pages URL
   - Try submitting a praise
   - Check admin portal with credentials (admin/admin123)

3. **Test from Different Networks**:
   - Access your app from mobile data (different WiFi)
   - Ask a friend to test it
   - Verify data persists across sessions

## Security Considerations

### Production Security
1. **Change Default Password**: Change the admin password immediately after first login
2. **HTTPS Only**: Ensure your backend uses HTTPS (most hosting providers provide this)
3. **Environment Variables**: Never commit sensitive data to version control
4. **Rate Limiting**: The server includes rate limiting (100 requests per 15 minutes per IP)
5. **Input Validation**: All inputs are validated and sanitized

### Database Security
1. **MongoDB Atlas**: Uses encryption and security by default
2. **Network Whitelist**: Consider restricting to specific IP ranges instead of 0.0.0.0/0
3. **Strong Passwords**: Use strong passwords for database users
4. **Regular Backups**: Atlas provides automatic backups

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure `FRONTEND_URL` in .env matches your frontend URL exactly
   - Include https:// in the URL

2. **Database Connection Failed**:
   - Verify MongoDB Atlas connection string
   - Check IP whitelist includes your server's IP
   - Ensure database user has correct permissions

3. **Frontend Not Loading Data**:
   - Check browser console for errors
   - Verify API_BASE_URL in script.js points to correct backend
   - Test API endpoints directly

4. **Admin Login Issues**:
   - Default credentials: admin/admin123
   - Check if account is locked (wait 15 minutes after 5 failed attempts)
   - Verify backend is running

### Monitoring and Logs

1. **Server Logs**: Check your hosting provider's logs
2. **MongoDB Atlas**: Monitor in Atlas dashboard
3. **Browser Console**: Check for frontend JavaScript errors
4. **Network Tab**: Verify API calls are being made correctly

## Scaling Considerations

### When to Upgrade
1. **More Users**: Consider upgrading MongoDB Atlas tier
2. **High Traffic**: Add more web server instances
3. **Global Users**: Use CDN for frontend, consider multi-region database

### Performance Tips
1. **Database Indexing**: Already implemented for common queries
2. **Caching**: Consider Redis for frequently accessed data
3. **CDN**: Use Cloudflare or similar for frontend assets
4. **Compression**: Enable gzip compression on your server

## Backup and Recovery

### MongoDB Atlas
- Automatic backups are enabled by default
- Point-in-time recovery available in paid tiers
- Export data manually using the export endpoint

### Manual Backup
```bash
# Export all data as CSV
curl https://your-backend-url.com/api/export/csv > backup.csv
```

## Support

If you encounter issues:
1. Check the server logs
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Ensure MongoDB Atlas network access is configured properly
