#!/usr/bin/env python3
"""
Verify TTS deployment on Railway
"""

import requests
import json
import sys
import time

def verify_tts_deployment(base_url):
    """Verify TTS functionality on deployed server"""
    print(f"🚀 Verifying TTS deployment at: {base_url}")
    
    # Test 1: General health check
    print("\n1. Testing general health check...")
    try:
        response = requests.get(f"{base_url}/api/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Server is healthy")
            if 'tts_service' in data:
                tts_health = data['tts_service']
                print(f"   🎤 TTS initialized: {tts_health.get('initialized', False)}")
                print(f"   🎵 Voices available: {tts_health.get('voices_available', 0)}")
            else:
                print(f"   ⚠️  TTS service info not found in health check")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Health check error: {e}")
        return False
    
    # Test 2: TTS-specific health check
    print("\n2. Testing TTS health check...")
    try:
        response = requests.get(f"{base_url}/api/tts/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                health = data.get('health', {})
                print(f"   ✅ TTS service is healthy")
                print(f"   🎤 Initialized: {health.get('initialized', False)}")
                print(f"   🎵 Voices: {health.get('voices_available', 0)}")
                print(f"   📁 Formats: {health.get('supported_formats', [])}")
            else:
                print(f"   ❌ TTS service unhealthy: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"   ❌ TTS health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ TTS health check error: {e}")
        return False
    
    # Test 3: Get available voices
    print("\n3. Testing voice availability...")
    try:
        response = requests.get(f"{base_url}/api/tts/voices", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('voices'):
                voices = data['voices']
                print(f"   ✅ Found {len(voices)} voices:")
                for i, voice in enumerate(voices[:3]):  # Show first 3
                    name = voice.get('name', f'Voice {i}')
                    gender = voice.get('gender', 'unknown')
                    print(f"      {i+1}. {name} ({gender})")
                if len(voices) > 3:
                    print(f"      ... and {len(voices) - 3} more")
            else:
                print(f"   ⚠️  No voices available: {data.get('error', 'Unknown error')}")
                # This might be expected on some server environments
        else:
            print(f"   ❌ Voice check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Voice check error: {e}")
        return False
    
    # Test 4: Simple TTS conversion
    print("\n4. Testing TTS conversion...")
    try:
        test_payload = {
            "text": "Hello from FileAlchemy! This is a test of our text-to-speech system.",
            "rate": 200,
            "volume": 0.8
        }
        
        response = requests.post(
            f"{base_url}/api/tts/convert",
            json=test_payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"   ✅ TTS conversion successful!")
                print(f"   📄 File: {data.get('filename', 'unknown')}")
                print(f"   📊 Size: {data.get('size', 0)} bytes")
                print(f"   🔗 URL: {data.get('download_url', 'none')}")
                
                # Test download
                if data.get('download_url'):
                    download_url = f"{base_url}{data['download_url']}"
                    download_response = requests.head(download_url, timeout=10)
                    if download_response.status_code == 200:
                        print(f"   ✅ Download URL accessible")
                    else:
                        print(f"   ⚠️  Download URL not accessible: {download_response.status_code}")
                
            else:
                print(f"   ❌ TTS conversion failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"   ❌ TTS conversion request failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   📄 Error details: {error_data}")
            except:
                print(f"   📄 Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"   ❌ TTS conversion error: {e}")
        return False
    
    print("\n✅ TTS deployment verification completed successfully!")
    print("🎉 Your text-to-speech feature is ready for production use!")
    return True

def main():
    if len(sys.argv) > 1:
        base_url = sys.argv[1].rstrip('/')
    else:
        # Default to Railway production URL
        base_url = "https://filealchemy-production.up.railway.app"
    
    print("🔍 TTS Deployment Verification Tool")
    print("=" * 50)
    
    success = verify_tts_deployment(base_url)
    
    if success:
        print("\n🎊 Deployment verification PASSED!")
        print("Your TTS feature is working correctly in production.")
    else:
        print("\n❌ Deployment verification FAILED!")
        print("Please check the server logs and fix any issues.")
        sys.exit(1)

if __name__ == "__main__":
    main()