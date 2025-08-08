#!/usr/bin/env python3
"""
Final comprehensive test for all conversion types via API
Tests the complete FileAlchemy conversion system
"""

import requests
import os
import json
import subprocess
from pathlib import Path

def check_api_health():
    """Check if API server is running"""
    try:
        response = requests.get("http://localhost:5000/api/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def create_test_files():
    """Create all test files for comprehensive testing"""
    files = {}
    
    # Create test TXT
    with open("api_test.txt", 'w', encoding='utf-8') as f:
        f.write("Test Document\n\nThis is a comprehensive test for FileAlchemy conversions.\nAll formats should work correctly.")
    files['txt'] = "api_test.txt"
    
    # Create test CSV
    csv_content = "Name,Age,City\nAlice,30,New York\nBob,25,Los Angeles\nCharlie,35,Chicago"
    with open("api_test.csv", 'w', encoding='utf-8') as f:
        f.write(csv_content)
    files['csv'] = "api_test.csv"
    
    # Create test JSON
    json_data = [{"Product": "Laptop", "Price": 999}, {"Product": "Mouse", "Price": 29}]
    with open("api_test.json", 'w', encoding='utf-8') as f:
        json.dump(json_data, f)
    files['json'] = "api_test.json"
    
    # Create test image
    try:
        from PIL import Image
        img = Image.new('RGB', (100, 100), 'blue')
        img.save("api_test.png")
        files['png'] = "api_test.png"
    except:
        print("⚠️  PIL not available, skipping image test")
    
    # Create test GIF
    try:
        from PIL import Image
        frames = []
        for color in ['red', 'green', 'blue']:
            img = Image.new('RGB', (50, 50), color)
            frames.append(img)
        frames[0].save("api_test.gif", save_all=True, append_images=frames[1:], duration=500, loop=0)
        files['gif'] = "api_test.gif"
    except:
        print("⚠️  PIL not available, skipping GIF test")
    
    return files

def test_api_conversion(input_file, source_format, target_format, test_name):
    """Test a single conversion through the API"""
    print(f"  🔄 {test_name}...")
    
    try:
        with open(input_file, 'rb') as f:
            files = {'file': f}
            data = {'source_format': source_format, 'target_format': target_format}
            
            response = requests.post("http://localhost:5000/api/convert", files=files, data=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                # Test download
                download_url = f"http://localhost:5000{result['download_url']}"
                download_response = requests.get(download_url, timeout=10)
                
                if download_response.status_code == 200:
                    print(f"    ✅ SUCCESS ({len(download_response.content)} bytes)")
                    return True
                else:
                    print(f"    ❌ Download failed ({download_response.status_code})")
                    return False
            else:
                print(f"    ❌ Conversion failed: {result.get('error', 'Unknown')}")
                return False
        else:
            print(f"    ❌ API error ({response.status_code})")
            return False
            
    except Exception as e:
        print(f"    ❌ Exception: {e}")
        return False

def main():
    """Main comprehensive API test"""
    print("🚀 FileAlchemy - Complete API Conversion Test")
    print("=" * 60)
    
    # Check API health
    if not check_api_health():
        print("❌ API server not available!")
        print("💡 Start the API server: python api_server.py")
        return False
    
    print("✅ API server is healthy")
    
    # Create test files
    print("\n📁 Creating test files...")
    test_files = create_test_files()
    print(f"Created {len(test_files)} test files")
    
    # Define test conversions by category
    test_conversions = []
    
    # Document conversions
    if 'txt' in test_files:
        test_conversions.extend([
            (test_files['txt'], 'TXT', 'PDF', '📄 TXT → PDF'),
            (test_files['txt'], 'TXT', 'HTML', '📄 TXT → HTML'),
            (test_files['txt'], 'TXT', 'DOCX', '📄 TXT → DOCX'),
        ])
    
    # Data conversions
    if 'csv' in test_files:
        test_conversions.extend([
            (test_files['csv'], 'CSV', 'PDF', '📊 CSV → PDF'),
            (test_files['csv'], 'CSV', 'XLSX', '📊 CSV → XLSX'),
            (test_files['csv'], 'CSV', 'JSON', '📊 CSV → JSON'),
        ])
    
    if 'json' in test_files:
        test_conversions.extend([
            (test_files['json'], 'JSON', 'CSV', '🔗 JSON → CSV'),
            (test_files['json'], 'JSON', 'XLSX', '🔗 JSON → XLSX'),
        ])
    
    # Image conversions
    if 'png' in test_files:
        test_conversions.extend([
            (test_files['png'], 'PNG', 'JPEG', '🖼️ PNG → JPEG'),
            (test_files['png'], 'PNG', 'WEBP', '🖼️ PNG → WEBP'),
        ])
    
    # GIF conversions (the main focus)
    if 'gif' in test_files:
        test_conversions.extend([
            (test_files['gif'], 'GIF', 'MP4', '🎬 GIF → MP4'),
            (test_files['gif'], 'GIF', 'WEBM', '🎬 GIF → WEBM'),
            (test_files['gif'], 'GIF', 'PNG', '🎬 GIF → PNG'),
            (test_files['gif'], 'GIF', 'JPEG', '🎬 GIF → JPEG'),
        ])
    
    # Run all tests
    print(f"\n🧪 Running {len(test_conversions)} conversion tests...")
    print("-" * 60)
    
    results = {}
    for input_file, source_format, target_format, test_name in test_conversions:
        results[f"{source_format}→{target_format}"] = test_api_conversion(
            input_file, source_format, target_format, test_name
        )
    
    # Results summary
    print("\n" + "=" * 60)
    print("📊 Complete API Conversion Test Results:")
    print("-" * 40)
    
    # Group results by category
    categories = {
        'Document': ['TXT→PDF', 'TXT→HTML', 'TXT→DOCX'],
        'Data': ['CSV→PDF', 'CSV→XLSX', 'CSV→JSON', 'JSON→CSV', 'JSON→XLSX'],
        'Image': ['PNG→JPEG', 'PNG→WEBP'],
        'GIF': ['GIF→MP4', 'GIF→WEBM', 'GIF→PNG', 'GIF→JPEG']
    }
    
    total_tests = 0
    successful_tests = 0
    
    for category, conversions in categories.items():
        category_results = {conv: results.get(conv, None) for conv in conversions if conv in results}
        if category_results:
            print(f"\n{category} Conversions:")
            for conv, success in category_results.items():
                if success is not None:
                    status = "✅ PASSED" if success else "❌ FAILED"
                    print(f"   {conv}: {status}")
                    total_tests += 1
                    if success:
                        successful_tests += 1
    
    print("-" * 40)
    print(f"Overall: {successful_tests}/{total_tests} conversions successful")
    
    # Special focus on GIF conversions
    gif_results = {k: v for k, v in results.items() if k.startswith('GIF→')}
    if gif_results:
        gif_success = sum(1 for success in gif_results.values() if success)
        gif_total = len(gif_results)
        print(f"\n🎬 GIF Conversions: {gif_success}/{gif_total} successful")
        
        if gif_success == gif_total:
            print("🎉 All GIF conversions are working perfectly!")
        else:
            print("⚠️  Some GIF conversions need attention")
    
    # Cleanup
    print(f"\n🧹 Cleaning up {len(test_files)} test files...")
    for file in test_files.values():
        if os.path.exists(file):
            os.remove(file)
    
    # Final status
    success_rate = (successful_tests / total_tests * 100) if total_tests > 0 else 0
    
    if success_rate >= 90:
        print(f"\n🎉 EXCELLENT! {success_rate:.1f}% success rate")
        print("🚀 FileAlchemy conversion system is production ready!")
        return True
    elif success_rate >= 75:
        print(f"\n✅ GOOD! {success_rate:.1f}% success rate")
        print("💡 Most conversions working, minor issues to address")
        return True
    else:
        print(f"\n⚠️  {success_rate:.1f}% success rate")
        print("💡 Several conversions need attention")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)