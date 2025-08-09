#!/usr/bin/env python3
"""
Test script to verify TTS API endpoints
"""

import requests
import json
import time

# Test configuration
BASE_URL = "http://localhost:5000"  # Local development server
TEST_TEXT = "Hello! This is a test of the FileAlchemy text-to-speech system. It should work perfectly!"

def test_tts_api():
    print("🧪 Testing TTS API Endpoints...")
    
    # Test 1: Health check
    print("\n1. Testing TTS Health Check:")
    try:
        response = requests.get(f"{BASE_URL}/api/tts/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Health check successful")
            print(f"   📊 Health data: {json.dumps(data, indent=2)}")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Health check error: {e}")
        return False
    
    # Test 2: Get voices
    print("\n2. Testing Get Voices:")
    try:
        response = requests.get(f"{BASE_URL}/api/tts/voices", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Get voices successful")
            if data.get('success') and data.get('voices'):
                print(f"   🎤 Available voices: {len(data['voices'])}")
                for i, voice in enumerate(data['voices'][:2]):  # Show first 2
                    print(f"      Voice {i}: {voice.get('name', 'Unknown')}")
            else:
                print(f"   ⚠️  No voices available: {data}")
        else:
            print(f"   ❌ Get voices failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Get voices error: {e}")
        return False
    
    # Test 3: Convert text to speech
    print("\n3. Testing Text to Speech Conversion:")
    try:
        payload = {
            "text": TEST_TEXT,
            "rate": 200,
            "volume": 0.8
        }
        
        response = requests.post(
            f"{BASE_URL}/api/tts/convert", 
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ TTS conversion successful")
            print(f"   📄 Filename: {data.get('filename')}")
            print(f"   📊 File size: {data.get('size')} bytes")
            print(f"   🔗 Download URL: {data.get('download_url')}")
            
            # Test download
            if data.get('download_url'):
                print("\n4. Testing Audio File Download:")
                download_url = f"{BASE_URL}{data['download_url']}"
                download_response = requests.get(download_url, timeout=10)
                
                if download_response.status_code == 200:
                    print(f"   ✅ Download successful")
                    print(f"   📊 Downloaded size: {len(download_response.content)} bytes")
                    
                    # Save test file
                    with open("test_downloaded_audio.wav", "wb") as f:
                        f.write(download_response.content)
                    print(f"   💾 Saved as: test_downloaded_audio.wav")
                else:
                    print(f"   ❌ Download failed: {download_response.status_code}")
                    return False
            
        else:
            print(f"   ❌ TTS conversion failed: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ TTS conversion error: {e}")
        return False
    
    print("\n✅ All TTS API tests passed!")
    return True

if __name__ == "__main__":
    print("🚀 Starting TTS API tests...")
    print("⚠️  Make sure the Flask server is running on localhost:5000")
    print("   Run: python backend/api_server.py")
    
    # Wait a moment for user to start server if needed
    input("\nPress Enter when the server is ready...")
    
    success = test_tts_api()
    
    if success:
        print("\n🎉 All tests completed successfully!")
        print("🔊 You can now use the TTS feature in your web application!")
    else:
        print("\n❌ Some tests failed. Check the server logs for details.")