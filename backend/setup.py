#!/usr/bin/env python3
"""
Setup script for FileAlchemy Backend
Installs dependencies and checks system requirements
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def run_command(command, description=""):
    """Run a command and handle errors"""
    print(f"Running: {description or command}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        if e.stderr:
            print(f"Error output: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def check_pip():
    """Check if pip is available"""
    try:
        subprocess.run([sys.executable, "-m", "pip", "--version"], 
                      check=True, capture_output=True)
        print("✅ pip is available")
        return True
    except subprocess.CalledProcessError:
        print("❌ pip is not available")
        return False

def install_requirements(minimal=True):
    """Install Python requirements"""
    requirements_file = Path(__file__).parent / ("requirements-minimal.txt" if minimal else "requirements.txt")
    if not requirements_file.exists():
        print(f"❌ {requirements_file.name} not found")
        return False
    
    print(f"📦 Installing Python dependencies ({'minimal' if minimal else 'full'} version)...")
    command = f"{sys.executable} -m pip install -r {requirements_file}"
    return run_command(command, f"Installing {requirements_file.name}")

def check_ffmpeg():
    """Check if FFmpeg is available for media conversion"""
    try:
        subprocess.run(["ffmpeg", "-version"], 
                      check=True, capture_output=True)
        print("✅ FFmpeg is available for media conversion")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠️  FFmpeg not found - media conversion will be disabled")
        print("   To enable media conversion, install FFmpeg:")
        
        system = platform.system().lower()
        if system == "windows":
            print("   - Download from: https://ffmpeg.org/download.html")
            print("   - Or use chocolatey: choco install ffmpeg")
        elif system == "darwin":  # macOS
            print("   - Use Homebrew: brew install ffmpeg")
        elif system == "linux":
            print("   - Ubuntu/Debian: sudo apt install ffmpeg")
            print("   - CentOS/RHEL: sudo yum install ffmpeg")
        
        return False

def check_system_dependencies():
    """Check system-specific dependencies"""
    system = platform.system().lower()
    print(f"🖥️  Detected system: {platform.system()} {platform.release()}")
    
    if system == "linux":
        print("ℹ️  For optimal performance on Linux, ensure these packages are installed:")
        print("   - Ubuntu/Debian: sudo apt install python3-dev libjpeg-dev zlib1g-dev")
        print("   - CentOS/RHEL: sudo yum install python3-devel libjpeg-devel zlib-devel")
    
    return True

def create_directories():
    """Create necessary directories"""
    directories = ["temp_uploads", "temp_converted"]
    for directory in directories:
        dir_path = Path(__file__).parent / directory
        dir_path.mkdir(exist_ok=True)
        print(f"✅ Created directory: {directory}")
    return True

def test_conversion_service():
    """Test the conversion service"""
    print("🧪 Testing conversion service...")
    try:
        from file_converter import FileConversionService
        service = FileConversionService()
        formats = service.list_supported_formats()
        
        print("✅ Conversion service loaded successfully")
        print("📋 Available converters:")
        for conv_type, format_dict in formats.items():
            input_formats = format_dict.get('input', [])
            output_formats = format_dict.get('output', [])
            if input_formats and output_formats:
                print(f"   {conv_type.capitalize()}: {len(input_formats)} input, {len(output_formats)} output formats")
        
        return True
    except Exception as e:
        print(f"❌ Error testing conversion service: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 FileAlchemy Backend Setup")
    print("=" * 40)
    
    # Check system requirements
    if not check_python_version():
        sys.exit(1)
    
    if not check_pip():
        sys.exit(1)
    
    # Install dependencies
    if not install_requirements():
        print("❌ Failed to install requirements")
        sys.exit(1)
    
    # Check optional dependencies
    check_ffmpeg()
    check_system_dependencies()
    
    # Create directories
    create_directories()
    
    # Test the service
    if not test_conversion_service():
        print("❌ Setup completed with errors")
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\n📝 Next steps:")
    print("1. Start the backend server:")
    print("   python api_server.py")
    print("\n2. Start the frontend development server:")
    print("   cd .. && npm run dev")
    print("\n3. Open http://localhost:5173 in your browser")
    print("\n💡 The backend will run on http://localhost:5000")
    print("   The frontend will automatically detect and use the backend")

if __name__ == "__main__":
    main()