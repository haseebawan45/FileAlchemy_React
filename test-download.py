#!/usr/bin/env python3
"""
Test download functionality on Railway
"""

import requests
import tempfile
import os
import time

def test_download_functionality():
    """Test the complete upload -> convert -> download flow"""
    base_url = 'https://filealchemy-production.up.railway.app'
    api_url = f'{base_url}/api'
    
    print("🧪 Testing Download Functionality")
    print("=" * 40)
    
    # Create a test file
    test_content = "This is a test file for conversion.\nLine 2 of the test file.\nEnd of test."
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as temp_file:
        temp_file.write(test_content)
        temp_file_path = temp_file.name
    
    try:
        print("📄 Created test file: test.txt")
        
        # Test single file conversion (synchronous)
        print("\n🔄 Testing synchronous conversion (TXT → PDF)...")
        
        with open(temp_file_path, 'rb') as f:
            files = {'file': ('test.txt', f, 'text/plain')}
            data = {
                'source_format': 'TXT',
                'target_format': 'PDF'
            }
            
            response = requests.post(f'{api_url}/convert', files=files, data=data, timeout=30)
            
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Conversion successful!")
            print(f"   Original: {result.get('original_filename')}")
            print(f"   Converted: {result.get('converted_filename')}")
            print(f"   Size: {result.get('size')} bytes")
            print(f"   Download URL: {result.get('download_url')}")
            
            # Test download
            download_url = f"{base_url}{result.get('download_url')}"
            print(f"\n📥 Testing download from: {download_url}")
            
            download_response = requests.get(download_url, timeout=30)
            print(f"Download status: {download_response.status_code}")
            
            if download_response.status_code == 200:
                print("✅ Download successful!")
                print(f"   Content-Type: {download_response.headers.get('Content-Type')}")
                print(f"   Content-Length: {download_response.headers.get('Content-Length')}")
                print(f"   Downloaded size: {len(download_response.content)} bytes")
                
                # Save downloaded file for verification
                with open('downloaded_test.pdf', 'wb') as f:
                    f.write(download_response.content)
                print("   Saved as: downloaded_test.pdf")
                
            else:
                print("❌ Download failed!")
                print(f"   Error: {download_response.text}")
                
        else:
            print("❌ Conversion failed!")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        # Cleanup
        try:
            os.unlink(temp_file_path)
        except:
            pass

def test_health_and_formats():
    """Test basic API endpoints"""
    base_url = 'https://filealchemy-production.up.railway.app'
    api_url = f'{base_url}/api'
    
    print("\n🏥 Testing API Health...")
    try:
        response = requests.get(f'{api_url}/health', timeout=10)
        if response.status_code == 200:
            health = response.json()
            print("✅ API is healthy")
            print(f"   Environment: {health.get('environment')}")
            print(f"   Port: {health.get('port')}")
        else:
            print("❌ API health check failed")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    print("\n📋 Testing Formats Endpoint...")
    try:
        response = requests.get(f'{api_url}/formats', timeout=10)
        if response.status_code == 200:
            formats = response.json()
            print("✅ Formats endpoint working")
            print(f"   Available formats: {len(formats.get('formats', {}))}")
        else:
            print("❌ Formats endpoint failed")
    except Exception as e:
        print(f"❌ Formats check error: {e}")

if __name__ == "__main__":
    test_health_and_formats()
    test_download_functionality()
    
    print("\n" + "=" * 40)
    print("🎯 Test completed!")
    print("🌐 Live app: https://filealchemy-production.up.railway.app")