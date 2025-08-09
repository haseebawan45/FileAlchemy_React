# Railway Deployment Guide for FileAlchemy

## Overview
This guide covers deploying your FileAlchemy application (React frontend + Flask backend) to Railway.

## Architecture
- **Backend**: Flask API server serving file conversion endpoints
- **Frontend**: React SPA built with Vite, served as static files
- **Deployment**: Single service deployment with backend serving both API and static frontend

## Pre-Deployment Checklist

### 1. Environment Variables Setup
Set these environment variables in Railway dashboard:

```bash
# Required
PORT=5000                    # Railway sets this automatically
NODE_ENV=production
FLASK_ENV=production

# Optional - CORS Configuration
ALLOWED_ORIGINS=https://your-app.railway.app

# Firebase Configuration (if using Firebase features)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 2. Railway CLI Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project (run in project root)
railway link
```

## Deployment Steps

### Option 1: Deploy via Railway CLI
```bash
# From your project root
railway up
```

### Option 2: Deploy via GitHub Integration
1. Push your code to GitHub
2. Connect your GitHub repo in Railway dashboard
3. Railway will auto-deploy on pushes to main branch

## Configuration Files Explained

### `railway.json`
- Defines build and deployment configuration
- Sets health check endpoint
- Configures restart policy

### `nixpacks.toml`
- Specifies system dependencies (Python, Node.js)
- Defines build phases
- Sets startup command

### `Procfile`
- Backup startup command definition
- Used if nixpacks.toml is not present

## Production Architecture

```
Railway Container:
├── Python Backend (Flask) - Port $PORT
│   ├── API endpoints (/api/*)
│   ├── Static file serving (/)
│   └── File conversion service
└── Built React Frontend (served as static files)
```

## Key Production Changes Made

### Backend Changes:
1. **Dynamic Port Binding**: Uses `PORT` environment variable
2. **CORS Configuration**: Environment-based CORS setup
3. **Production Mode**: Disabled debug mode in production
4. **Static File Serving**: Backend serves built frontend files

### Frontend Changes:
1. **Dynamic API URL**: Uses `VITE_API_BASE_URL` environment variable
2. **Production Build**: Optimized build configuration
3. **Environment Variables**: Proper environment variable handling

## Monitoring & Health Checks

- **Health Endpoint**: `https://your-app.railway.app/api/health`
- **Logs**: Available in Railway dashboard
- **Metrics**: Railway provides built-in monitoring

## File Storage Considerations

⚠️ **Important**: Railway containers have ephemeral storage. Uploaded files are lost on container restarts.

### Recommendations:
1. **For Production**: Integrate cloud storage (AWS S3, Google Cloud Storage)
2. **Current Setup**: Files are cleaned up automatically after 1 hour
3. **Scaling**: Consider Redis for job storage instead of in-memory

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Python dependencies in `backend/requirements.txt`
   - Verify Node.js version compatibility

2. **Runtime Errors**:
   - Check Railway logs for detailed error messages
   - Verify environment variables are set correctly

3. **CORS Issues**:
   - Set `ALLOWED_ORIGINS` environment variable
   - Check frontend API URL configuration

4. **File Upload Issues**:
   - Verify file size limits (Railway has request size limits)
   - Check temporary directory permissions

### Debug Commands:
```bash
# View logs
railway logs

# Check environment variables
railway variables

# SSH into container (if needed)
railway shell
```

## Performance Optimization

### Backend:
- File cleanup runs every 5 minutes
- Consider implementing file size limits
- Monitor memory usage for large file conversions

### Frontend:
- Static files are served with proper caching headers
- Bundle splitting implemented for better loading
- Consider CDN for static assets in production

## Security Considerations

1. **File Validation**: Backend validates file types and sizes
2. **CORS**: Properly configured for production domain
3. **Environment Variables**: Sensitive data stored as environment variables
4. **File Cleanup**: Automatic cleanup prevents disk space issues

## Scaling Considerations

For high-traffic scenarios, consider:
1. **Database**: Replace in-memory job storage with Redis/PostgreSQL
2. **File Storage**: Use cloud storage services
3. **Load Balancing**: Railway supports horizontal scaling
4. **Caching**: Implement response caching for format endpoints

## Cost Optimization

- Railway charges based on usage
- Implement proper file cleanup to minimize storage costs
- Monitor resource usage in Railway dashboard
- Consider implementing request rate limiting

## Next Steps After Deployment

1. Test all conversion features
2. Monitor performance and error rates
3. Set up proper logging and monitoring
4. Consider implementing user authentication
5. Add analytics and usage tracking