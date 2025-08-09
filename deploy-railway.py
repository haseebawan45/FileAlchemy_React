#!/usr/bin/env python3
"""
Railway Deployment Script for FileAlchemy
Builds frontend and deploys to Railway
"""

import os
import sys
import subprocess
import time

def run_command(command, description, shell=True):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=shell, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed")
        if result.stdout.strip():
            print(f"   Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed")
        if e.stdout:
            print(f"   Output: {e.stdout}")
        if e.stderr:
            print(f"   Error: {e.stderr}")
        return False

def check_railway_cli():
    """Check if Railway CLI is installed"""
    try:
        result = subprocess.run(['railway', '--version'], capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print(f"✅ Railway CLI found: {result.stdout.strip()}")
            return True
        else:
            print("❌ Railway CLI not found")
            return False
    except FileNotFoundError:
        print("❌ Railway CLI not installed")
        return False

def main():
    """Main deployment function"""
    print("🚀 FileAlchemy Railway Deployment")
    print("=" * 40)
    
    # Check Railway CLI
    if not check_railway_cli():
        print("\n📥 Install Railway CLI:")
        print("   npm install -g @railway/cli")
        print("   Then run: railway login")
        sys.exit(1)
    
    # Build frontend
    if not run_command("npm run build", "Building frontend"):
        sys.exit(1)
    
    # Check if dist directory exists
    if not os.path.exists('dist'):
        print("❌ Build output directory 'dist' not found")
        sys.exit(1)
    
    print("✅ Frontend built successfully")
    
    # Deploy to Railway
    print("\n🚂 Deploying to Railway...")
    if not run_command("railway up", "Deploying to Railway"):
        print("❌ Deployment failed")
        sys.exit(1)
    
    print("\n🎉 Deployment completed!")
    print("🌐 Your app should be live at: https://filealchemy-production.up.railway.app")
    print("⏳ It may take a few minutes for changes to propagate")
    
    # Run comprehensive test
    print("\n🧪 Running post-deployment test...")
    time.sleep(10)  # Wait for deployment to propagate
    
    try:
        subprocess.run([sys.executable, "comprehensive_test.py"], check=True)
    except subprocess.CalledProcessError:
        print("⚠️  Post-deployment test failed, but deployment may still be successful")
        print("   Check https://filealchemy-production.up.railway.app manually")

if __name__ == "__main__":
    main()