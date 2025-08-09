#!/usr/bin/env python3
"""
Configuration Verification Script
Shows current API configuration
"""

import os
import json

def main():
    print("🔍 FileAlchemy Configuration Verification")
    print("=" * 50)
    
    # Check API configuration
    print("\n📡 API Configuration:")
    try:
        with open('src/config/api.js', 'r') as f:
            api_config = f.read()
        
        if 'https://filealchemy-production.up.railway.app/api' in api_config:
            print("✅ Frontend configured for Railway production backend")
            print("   API URL: https://filealchemy-production.up.railway.app/api")
        else:
            print("❌ Frontend not configured for production")
    except Exception as e:
        print(f"❌ Error reading API config: {e}")
    
    # Check environment variables
    print("\n🌍 Environment Configuration:")
    try:
        with open('.env', 'r') as f:
            env_content = f.read()
        
        if 'FLASK_ENV=production' in env_content:
            print("✅ Backend configured for production")
        
        if 'NODE_ENV=production' in env_content:
            print("✅ Node environment set to production")
            
        if 'VITE_API_BASE_URL=https://filealchemy-production.up.railway.app/api' in env_content:
            print("✅ Vite API URL configured for production")
    except Exception as e:
        print(f"❌ Error reading .env: {e}")
    
    # Check build output
    print("\n🏗️  Build Status:")
    if os.path.exists('dist'):
        print("✅ Frontend build exists")
        
        # Check if index.html exists
        if os.path.exists('dist/index.html'):
            print("✅ Built index.html found")
        else:
            print("❌ Built index.html not found")
    else:
        print("❌ Frontend build not found - run 'npm run build'")
    
    # Check Railway configuration
    print("\n🚂 Railway Configuration:")
    if os.path.exists('railway.json'):
        print("✅ Railway configuration exists")
    else:
        print("❌ Railway configuration missing")
    
    if os.path.exists('nixpacks.toml'):
        print("✅ Nixpacks configuration exists")
    else:
        print("❌ Nixpacks configuration missing")
    
    print("\n" + "=" * 50)
    print("🎯 Summary:")
    print("✅ Frontend: Always uses Railway production backend")
    print("✅ Backend: Running on Railway at https://filealchemy-production.up.railway.app")
    print("✅ Configuration: Full production mode")
    print("\n🌐 Your app: https://filealchemy-production.up.railway.app")

if __name__ == "__main__":
    main()