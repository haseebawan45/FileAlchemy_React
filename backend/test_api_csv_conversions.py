#!/usr/bin/env python3
"""
Test CSV and data conversions through the web API
Ensures CSV to PDF and other data conversions work via web interface
"""

import requests
import os
import json
from pathlib import Path

def create_test_files():
    """Create test files for API testing"""
    files = {}
    
    # Create test CSV
    csv_content = """Product,Price,Category,Stock
Laptop,999.99,Electronics,25
Mouse,29.99,Electronics,150
Keyboard,79.99,Electronics,75
Monitor,299.99,Electronics,40
Headphones,149.99,Electronics,60"""
    
    with open("api_test.csv", 'w', encoding='utf-8') as f:
        f.write(csv_content)
    files['csv'] = "api_test.csv"
    
    # Create test JSON
    json_data = [
        {"Name": "Alice", "Age": 30, "Department": "Engineering", "Salary": 75000},
        {"Name": "Bob", "Age": 25, "Department": "Marketing", "Salary": 65000},
        {"Name": "Charlie", "Age": 35, "Department": "Sales", "Salary": 70000}
    ]
    
    with open("api_test.json", 'w', encoding='utf-8') as f:
        json.dump(json_data, f, indent=2)
    files['json'] = "api_test.json"
    
    return files

def test_api_conversion(input_file, source_format, target_format, test_name):
    """Test a single conversion through the API"""
    print(f"  🔄 Testing {test_name}...")
    
    try:
        with open(input_file, 'rb') as f:
            files = {'file': f}
            data = {
                'source_format': source_format,
                'target_format': target_format
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
                print(f"    ✅ {test_name}: SUCCESS ({result['size']} bytes)")
                
                # Test download
                download_url = f"http://localhost:5000{result['download_url']}"
                download_response = requests.get(download_url, timeout=10)
                
                if download_response.status_code == 200:
                    print(f"    ✅ Download: SUCCESS ({len(download_response.content)} bytes)")
                    
                    # Validate specific formats
                    if target_format.upper() == 'PDF':
                        if download_response.content.startswith(b'%PDF-'):
                            print(f"    ✅ Valid PDF file downloaded")
                        else:
                            print(f"    ❌ Invalid PDF file")
                            return False
                    
                    elif target_format.upper() == 'JSON':
                        try:
                            json.loads(download_response.content.decode('utf-8'))
                            print(f"    ✅ Valid JSON file downloaded")
                        except json.JSONDecodeError:
                            print(f"    ❌ Invalid JSON file")
                            return False
                    
                    return True
                else:
                    print(f"    ❌ Download: FAILED ({download_response.status_code})")
                    return False
            else:
                print(f"    ❌ {test_name}: FAILED - {result.get('error', 'Unknown error')}")
                return False
        else:
            print(f"    ❌ {test_name}: API ERROR ({response.status_code})")
            try:
                error_info = response.json()
                print(f"    Error details: {error_info}")
            except:
                print(f"    Response text: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"    ❌ {test_name}: EXCEPTION - {e}")
        return False

def main():
    """Main API test for CSV and data conversions"""
    print("🌐 CSV & Data Conversions - Web API Test")
    print("=" * 50)
    
    # Check API health
    try:
        response = requests.get("http://localhost:5000/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ API server is healthy")
        else:
            print("❌ API server health check failed")
            print("💡 Start the API server: python api_server.py")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to API server: {e}")
        print("💡 Start the API server: python api_server.py")
        return False
    
    # Create test files
    print("\n📁 Creating test files...")
    test_files = create_test_files()
    
    # Test key data conversions
    print("\n🧪 Testing Data Conversions via API:")
    results = {}
    
    # CSV conversions (the main focus)
    if 'csv' in test_files:
        print("\n📊 CSV Conversions:")
        results['CSV→PDF'] = test_api_conversion(test_files['csv'], 'CSV', 'PDF', 'CSV to PDF')
        results['CSV→XLSX'] = test_api_conversion(test_files['csv'], 'CSV', 'XLSX', 'CSV to XLSX')
        results['CSV→JSON'] = test_api_conversion(test_files['csv'], 'CSV', 'JSON', 'CSV to JSON')
        results['CSV→TXT'] = test_api_conversion(test_files['csv'], 'CSV', 'TXT', 'CSV to TXT')
    
    # JSON conversions
    if 'json' in test_files:
        print("\n🔗 JSON Conversions:")
        results['JSON→CSV'] = test_api_conversion(test_files['json'], 'JSON', 'CSV', 'JSON to CSV')
        results['JSON→XLSX'] = test_api_conversion(test_files['json'], 'JSON', 'XLSX', 'JSON to XLSX')
    
    # Results summary
    print("\n" + "=" * 50)
    print("📊 API Data Conversion Test Results:")
    print("-" * 30)
    
    total_tests = len(results)
    successful_tests = sum(1 for success in results.values() if success)
    
    for test_name, success in results.items():
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"   {test_name}: {status}")
    
    print("-" * 30)
    print(f"   Overall: {successful_tests}/{total_tests} API tests passed")
    
    # Special focus on CSV to PDF
    if results.get('CSV→PDF', False):
        print("\n🎉 CSV to PDF conversion is working correctly!")
        print("📄 The downloaded PDF files should now open properly")
    else:
        print("\n⚠️  CSV to PDF conversion needs attention")
    
    # Cleanup
    print("\n🧹 Cleaning up test files...")
    for file in test_files.values():
        if os.path.exists(file):
            os.remove(file)
            print(f"   Removed: {file}")
    
    if successful_tests == total_tests:
        print("\n🎉 All API data conversion tests PASSED!")
        print("🚀 CSV and data conversions are ready for web deployment!")
        return True
    else:
        print(f"\n⚠️  {total_tests - successful_tests} API tests failed")
        print("💡 Check the API server logs for details")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)