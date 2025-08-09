
🚀 RAILWAY DEPLOYMENT CHECKLIST
================================

Pre-Deployment:
□ All files validated ✅
□ Frontend builds successfully ✅
□ Backend syntax check passed ✅
□ Railway CLI installed
□ Git repository is clean

Railway Setup:
□ Create new Railway project
□ Link local repository: railway link
□ Set environment variables:
  □ NODE_ENV=production
  □ FLASK_ENV=production
  □ VITE_FIREBASE_* (if using Firebase)

Deployment:
□ Run: railway up
□ Monitor logs: railway logs
□ Test health endpoint: /api/health
□ Test frontend loading
□ Test file conversion functionality

Post-Deployment:
□ Set up custom domain (optional)
□ Configure monitoring
□ Test all conversion formats
□ Set up backup/monitoring

Environment Variables to Set in Railway:
- NODE_ENV=production
- FLASK_ENV=production
- ALLOWED_ORIGINS=https://your-app.railway.app
- VITE_FIREBASE_API_KEY=your_key (if using Firebase)
- VITE_FIREBASE_AUTH_DOMAIN=your_domain (if using Firebase)
- VITE_FIREBASE_PROJECT_ID=your_project_id (if using Firebase)

Commands for Deployment:
1. railway login
2. railway link (or railway new if creating new project)
3. railway up
4. railway logs (to monitor)
5. railway domain (to get URL)

Troubleshooting:
- Check logs: railway logs
- Check variables: railway variables
- Restart service: railway up --detach
- Shell access: railway shell
