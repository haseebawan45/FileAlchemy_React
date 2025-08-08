#!/usr/bin/env python3
"""
Test script for PDF to image conversion via API
"""

import requests
import os
import tempfile
from pathlib import Path

def create_test_pdf():
    """Create a simple test PDF with multiple pages"""
    try:
        import fitz  # PyMuPDF
        
        # Create a simple PDF with 2 pages
        doc = fitz.open()  # Create new PDF
        
        for page_num in range(2):
            page = doc.new_page()  # Add new page
            
            # Add some text to the page
            text = f"Test Page {page_num + 1}\n\nThis is a test PDF for API conversion."
            
            # Insert text
            page.insert_text(
                (50, 100),  # Position
                text,
                fontsize=16,
                color=(0, 0, 0)  # Black color
            )
        
        # Save the test PDF
        test_pdf_path = "test_api.pdf"
        doc.save(test_pdf_path)
        doc.close()
        
        print(f"✅ Created test PDF: {test_pdf_path}")
        return test_pdf_path
        
    except Exception as e:
        print(f"❌ Failed to create test PDF: {e}")
        return None

def test_api_pdf_conversion():
    """Test PDF to images conversion via API"""
    print("🧪 Testing PDF to Images Conversion via API")
    print("=" * 50)
    
    # Create test PDF
    test_pdf = create_test_pdf()
    if not test_pdf:
        return False
    
    try:
        # Test API health first
        print("🔍 Checking API health...")
        health_response = requests.get("http://localhost:5000/api/health", timeout=5)
        if health_response.status_code != 200:
            print("❌ API server is not responding")
            return False
        print("✅ API server is healthy")
        
        # Test single file conversion endpoint
        print(f"📄 Converting {test_pdf} to JPEG via API...")
        
        with open(test_pdf, 'rb') as f:
            files = {'file': f}
            data = {
                'source_format': 'PDF',
                'target_format': 'JPEG'
            }
            
            response = requests.post(
                "http://localhost:5000/api/convert",
                files=files,
                data=data,
                timeout=30
            )
        
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                print("✅ API conversion successful!")
                print(f"📦 Converted filename: {result['converted_filename']}")
                print(f"📊 File size: {result['size']} bytes")
                print(f"🔗 Download URL: {result['download_url']}")
                
                # Test download
                download_url = f"http://localhost:5000{result['download_url']}"
                download_response = requests.get(download_url, timeout=10)
                
                if download_response.status_code == 200:
                    print("✅ Download successful!")
                    print(f"📊 Downloaded {len(download_response.content)} bytes")
                    
                    # Save and check if it's a valid ZIP
                    with open("downloaded_result.zip", "wb") as f:
                        f.write(download_response.content)
                    
                    import zipfile
                    try:
                        with zipfile.ZipFile("downloaded_result.zip", 'r') as zf:
                            files = zf.namelist()
                            print(f"📁 ZIP contains {len(files)} files:")
                            for file in files:
                                print(f"   - {file}")
                        
                        # Cleanup
                        os.remove("downloaded_result.zip")
                        return True
                    except zipfile.BadZipFile:
                        print("❌ Downloaded file is not a valid ZIP")
                        return False
                else:
                    print(f"❌ Download failed: {download_response.status_code}")
                    return False
            else:
                print(f"❌ API conversion failed: {result.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ API request failed: {response.status_code}")
            try:
                error_info = response.json()
                print(f"Error details: {error_info}")
            except:
                print(f"Response text: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ API request failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    finally:
        # Cleanup
        if os.path.exists(test_pdf):
            os.remove(test_pdf)
            print(f"🧹 Cleaned up: {test_pdf}")

if __name__ == "__main__":
    success = test_api_pdf_conversion()
    if success:
        print("\n🎉 API PDF to images conversion test PASSED!")
    else:
        print("\n❌ API PDF to images conversion test FAILED!")
        print("Make sure the API server is running: python api_server.py")