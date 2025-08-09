#!/usr/bin/env python3
"""
Production Setup Script for FileAlchemy
Validates and prepares the application for Railway deployment
"""

import os
import sys
import json
import subprocess
from pathlib import Path

def check_file_exists(file_path, description):
    """Check if a file exists and print status"""
    if Path(file_path).exists():
        print(f"✅ {description}: {file_path}")
        return True
    else:
        print(f"❌ Missing {description}: {file_path}")
        return False

def validate_package_json():
    """Validate package.json configuration"""
    try:
        with open('package.json', 'r') as f:
            package_data = json.load(f)
        
        required_scripts = ['build', 'dev', 'preview']
        missing_scripts = []
        
        for script in required_scripts:
            if script not in package_data.get('scripts', {}):
                missing_scripts.append(script)
        
        if missing_scripts:
            print(f"❌ Missing npm scripts: {', '.join(missing_scripts)}")
            return False
        else:
            print("✅ Package.json scripts are configured correctly")
            return True
            
    except Exception as e:
        print(f"❌ Error reading package.json: {e}")
        return False

def validate_backend_requirements():
    """Validate backend requirements.txt"""
    try:
        with open('backend/requirements.txt', 'r') as f:
            requirements = f.read()
        
        essential_packages = ['Flask', 'Flask-CORS', 'Pillow']
        missing_packages = []
        
        for package in essential_packages:
            if package.lower() not in requirements.lower():
                missing_packages.append(package)
        
        if missing_packages:
            print(f"❌ Missing essential packages: {', '.join(missing_packages)}")
            return False
        else:
            print("✅ Backend requirements look good")
            return True
            
    except Exception as e:
        print(f"❌ Error reading requirements.txt: {e}")
        return False

def test_frontend_build():
    """Test if frontend can build successfully"""
    print("🔨 Testing frontend build...")
    try:
        result = subprocess.run(['npm', 'run', 'build'], 
                              capture_output=True, text=True, check=True, shell=True)
        print("✅ Frontend build successful")
        
        # Check if dist directory was created
        if Path('dist').exists():
            print("✅ Build output directory created")
            return True
        else:
            print("❌ Build output directory not found")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Frontend build failed: {e}")
        if e.stderr:
            print(f"Error details: {e.stderr}")
        return False

def test_backend_startup():
    """Test if backend can start (quick test)"""
    print("🐍 Testing backend startup...")
    try:
        # Quick syntax check
        result = subprocess.run([sys.executable, '-m', 'py_compile', 'backend/api_server.py'], 
                              capture_output=True, text=True, check=True)
        print("✅ Backend syntax check passed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Backend syntax check failed: {e}")
        return False

def check_environment_files():
    """Check environment configuration files"""
    env_files = [
        ('.env.example', 'Environment template'),
        ('railway.json', 'Railway configuration'),
        ('nixpacks.toml', 'Nixpacks configuration'),
        ('Procfile', 'Process file')
    ]
    
    all_good = True
    for file_path, description in env_files:
        if not check_file_exists(file_path, description):
            all_good = False
    
    return all_good

def generate_deployment_checklist():
    """Generate a deployment checklist"""
    checklist = """
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
"""
    
    print(checklist)
    
    # Save checklist to file
    with open('DEPLOYMENT_CHECKLIST.md', 'w', encoding='utf-8') as f:
        f.write(checklist)
    print("📋 Deployment checklist saved to DEPLOYMENT_CHECKLIST.md")

def main():
    """Main validation function"""
    print("🔍 FileAlchemy Production Setup Validation")
    print("=" * 50)
    
    all_checks_passed = True
    
    # File existence checks
    print("\n📁 Checking required files...")
    required_files = [
        ('backend/api_server.py', 'Backend API server'),
        ('backend/requirements.txt', 'Backend requirements'),
        ('package.json', 'Frontend package configuration'),
        ('src/App.jsx', 'Frontend main component'),
        ('railway.json', 'Railway configuration'),
        ('nixpacks.toml', 'Build configuration'),
        ('Procfile', 'Process configuration')
    ]
    
    for file_path, description in required_files:
        if not check_file_exists(file_path, description):
            all_checks_passed = False
    
    # Configuration validation
    print("\n⚙️  Validating configurations...")
    if not validate_package_json():
        all_checks_passed = False
    
    if not validate_backend_requirements():
        all_checks_passed = False
    
    # Build tests
    print("\n🔨 Running build tests...")
    if not test_frontend_build():
        all_checks_passed = False
    
    if not test_backend_startup():
        all_checks_passed = False
    
    # Final status
    print("\n" + "=" * 50)
    if all_checks_passed:
        print("🎉 All checks passed! Ready for Railway deployment.")
        print("\n📋 Generating deployment checklist...")
        generate_deployment_checklist()
        
        print("\n🚀 To deploy to Railway:")
        print("1. Run: python deploy-railway.py")
        print("2. Or manually: railway up")
        
    else:
        print("❌ Some checks failed. Please fix the issues above before deploying.")
        sys.exit(1)

if __name__ == "__main__":
    main()