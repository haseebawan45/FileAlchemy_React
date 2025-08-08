#!/usr/bin/env python3
"""
Development startup script for FileAlchemy
Starts both backend and frontend servers
"""

import os
import sys
import subprocess
import threading
import time
import signal
from pathlib import Path

# Global process references
backend_process = None
frontend_process = None

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print("\n🛑 Shutting down servers...")
    
    if backend_process:
        backend_process.terminate()
        print("✅ Backend server stopped")
    
    if frontend_process:
        frontend_process.terminate()
        print("✅ Frontend server stopped")
    
    sys.exit(0)

def check_requirements():
    """Check if required files exist"""
    backend_dir = Path("backend")
    frontend_files = ["package.json", "src"]
    
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False
    
    if not (backend_dir / "api_server.py").exists():
        print("❌ Backend API server not found")
        return False
    
    for file in frontend_files:
        if not Path(file).exists():
            print(f"❌ Frontend file/directory not found: {file}")
            return False
    
    return True

def start_backend():
    """Start the backend server"""
    global backend_process
    
    print("🐍 Starting Python backend server...")
    
    try:
        # Change to backend directory
        backend_dir = Path("backend")
        
        # Start the backend server
        backend_process = subprocess.Popen(
            [sys.executable, "api_server.py"],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        # Monitor backend output in a separate thread
        def monitor_backend():
            for line in backend_process.stdout:
                print(f"[Backend] {line.strip()}")
        
        backend_thread = threading.Thread(target=monitor_backend, daemon=True)
        backend_thread.start()
        
        # Wait a moment for backend to start
        time.sleep(2)
        
        if backend_process.poll() is None:
            print("✅ Backend server started on http://localhost:5000")
            return True
        else:
            print("❌ Backend server failed to start")
            return False
            
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return False

def start_frontend():
    """Start the frontend development server"""
    global frontend_process
    
    print("⚛️  Starting React frontend server...")
    
    try:
        # Check if node_modules exists
        if not Path("node_modules").exists():
            print("📦 Installing frontend dependencies...")
            install_process = subprocess.run(["npm", "install"], check=True, shell=True)
            if install_process.returncode != 0:
                print("❌ Failed to install frontend dependencies")
                return False
        
        # Start the frontend server
        frontend_process = subprocess.Popen(
            ["npm", "run", "dev"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1,
            shell=True  # Required for Windows
        )
        
        # Monitor frontend output in a separate thread
        def monitor_frontend():
            for line in frontend_process.stdout:
                line = line.strip()
                if line:
                    print(f"[Frontend] {line}")
        
        frontend_thread = threading.Thread(target=monitor_frontend, daemon=True)
        frontend_thread.start()
        
        # Wait for frontend to start
        time.sleep(3)
        
        if frontend_process.poll() is None:
            print("✅ Frontend server started on http://localhost:5173")
            return True
        else:
            print("❌ Frontend server failed to start")
            return False
            
    except Exception as e:
        print(f"❌ Error starting frontend: {e}")
        return False

def check_backend_health():
    """Check if backend is responding"""
    try:
        import requests
        response = requests.get("http://localhost:5000/api/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def main():
    """Main function"""
    print("🚀 FileAlchemy Development Server Startup")
    print("=" * 50)
    
    # Set up signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    
    # Check requirements
    if not check_requirements():
        print("❌ Requirements check failed")
        sys.exit(1)
    
    # Start backend
    if not start_backend():
        print("❌ Failed to start backend server")
        sys.exit(1)
    
    # Wait for backend to be ready
    print("⏳ Waiting for backend to be ready...")
    for i in range(10):
        if check_backend_health():
            print("✅ Backend is ready!")
            break
        time.sleep(1)
    else:
        print("⚠️  Backend health check failed, but continuing...")
    
    # Start frontend
    if not start_frontend():
        print("❌ Failed to start frontend server")
        if backend_process:
            backend_process.terminate()
        sys.exit(1)
    
    print("\n🎉 Both servers are running!")
    print("📱 Frontend: http://localhost:5173")
    print("🔧 Backend API: http://localhost:5000")
    print("❤️  Health Check: http://localhost:5000/api/health")
    print("\n💡 Press Ctrl+C to stop both servers")
    
    # Keep the script running
    try:
        while True:
            time.sleep(1)
            
            # Check if processes are still running
            if backend_process and backend_process.poll() is not None:
                print("❌ Backend process died")
                break
                
            if frontend_process and frontend_process.poll() is not None:
                print("❌ Frontend process died")
                break
                
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)

if __name__ == "__main__":
    main()