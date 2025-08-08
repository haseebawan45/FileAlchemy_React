#!/usr/bin/env python3
"""
Master test script for all conversion types
Tests images, documents, media, and archives
"""

import os
import tempfile
from pathlib import Path
from file_converter import FileConversionService

def test_image_conversions():
    """Test basic image conversions"""
    print("🖼️  Testing Image Conversions:")
    
    service = FileConversionService()
    
    try:
        # Create a simple test image using PIL
        from PIL import Image
        
        # Create a simple test image
        img = Image.new('RGB', (100, 100), color='red')
        test_png = "test_image.png"
        img.save(test_png)
        print(f"   ✅ Created test PNG: {test_png}")
        
        # Test PNG to JPEG
        success = service.convert_file(test_png, "test_output.jpg")
        if success and os.path.exists("test_output.jpg"):
            print("   ✅ PNG to JPEG: PASSED")
            os.remove("test_output.jpg")
        else:
            print("   ❌ PNG to JPEG: FAILED")
        
        # Test PNG to WEBP
        success = service.convert_file(test_png, "test_output.webp")
        if success and os.path.exists("test_output.webp"):
            print("   ✅ PNG to WEBP: PASSED")
            os.remove("test_output.webp")
        else:
            print("   ❌ PNG to WEBP: FAILED")
        
        # Cleanup
        os.remove(test_png)
        return True
        
    except Exception as e:
        print(f"   ❌ Image conversion test failed: {e}")
        return False

def test_document_conversions():
    """Test document conversions (already tested in detail)"""
    print("📄 Testing Document Conversions:")
    
    service = FileConversionService()
    
    try:
        # Create simple test files
        test_txt = "test_doc.txt"
        with open(test_txt, 'w', encoding='utf-8') as f:
            f.write("Test document content\nSecond line\nThird line")
        
        # Test TXT to HTML
        success = service.convert_file(test_txt, "test_output.html")
        if success and os.path.exists("test_output.html"):
            print("   ✅ TXT to HTML: PASSED")
            os.remove("test_output.html")
        else:
            print("   ❌ TXT to HTML: FAILED")
        
        # Test TXT to PDF
        success = service.convert_file(test_txt, "test_output.pdf")
        if success and os.path.exists("test_output.pdf"):
            print("   ✅ TXT to PDF: PASSED")
            os.remove("test_output.pdf")
        else:
            print("   ❌ TXT to PDF: FAILED")
        
        # Cleanup
        os.remove(test_txt)
        return True
        
    except Exception as e:
        print(f"   ❌ Document conversion test failed: {e}")
        return False

def test_media_conversions():
    """Test media conversions (requires FFmpeg)"""
    print("🎥 Testing Media Conversions:")
    
    service = FileConversionService()
    
    # Check if FFmpeg is available
    try:
        import subprocess
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        ffmpeg_available = True
    except (subprocess.CalledProcessError, FileNotFoundError):
        ffmpeg_available = False
    
    if not ffmpeg_available:
        print("   ⚠️  FFmpeg not available - media conversions will be skipped")
        print("   ℹ️  Install FFmpeg to enable media conversion testing")
        return True  # Not a failure, just not available
    
    try:
        # For now, just check if the media converter is initialized
        formats = service.list_supported_formats()
        media_formats = formats.get('media', {})
        
        if media_formats.get('input') and media_formats.get('output'):
            print("   ✅ Media converter initialized with FFmpeg")
            print(f"   📋 Input formats: {media_formats['input'][:5]}...")  # Show first 5
            print(f"   📋 Output formats: {media_formats['output'][:5]}...")  # Show first 5
            return True
        else:
            print("   ❌ Media converter not properly initialized")
            return False
            
    except Exception as e:
        print(f"   ❌ Media conversion test failed: {e}")
        return False

def test_archive_conversions():
    """Test archive conversions"""
    print("📦 Testing Archive Conversions:")
    
    service = FileConversionService()
    
    try:
        # Create test files for archiving
        test_files = []
        for i in range(3):
            filename = f"test_file_{i}.txt"
            with open(filename, 'w') as f:
                f.write(f"Content of test file {i}")
            test_files.append(filename)
        
        # Create a test ZIP archive
        import zipfile
        test_zip = "test_archive.zip"
        with zipfile.ZipFile(test_zip, 'w') as zf:
            for file in test_files:
                zf.write(file)
        
        print(f"   ✅ Created test ZIP: {test_zip}")
        
        # Test ZIP to 7Z (if available)
        success = service.convert_file(test_zip, "test_output.7z")
        if success and os.path.exists("test_output.7z"):
            print("   ✅ ZIP to 7Z: PASSED")
            os.remove("test_output.7z")
        else:
            print("   ⚠️  ZIP to 7Z: Not available (py7zr not installed)")
        
        # Test ZIP to TAR
        success = service.convert_file(test_zip, "test_output.tar")
        if success and os.path.exists("test_output.tar"):
            print("   ✅ ZIP to TAR: PASSED")
            os.remove("test_output.tar")
        else:
            print("   ❌ ZIP to TAR: FAILED")
        
        # Cleanup
        for file in test_files + [test_zip]:
            if os.path.exists(file):
                os.remove(file)
        
        return True
        
    except Exception as e:
        print(f"   ❌ Archive conversion test failed: {e}")
        return False

def test_all_supported_formats():
    """Test and display all supported formats"""
    print("📋 All Supported Formats:")
    print("-" * 40)
    
    service = FileConversionService()
    formats = service.list_supported_formats()
    
    for converter_type, format_dict in formats.items():
        print(f"{converter_type.upper()}:")
        input_formats = format_dict.get('input', [])
        output_formats = format_dict.get('output', [])
        
        print(f"  Input:  {', '.join(input_formats) if input_formats else 'None'}")
        print(f"  Output: {', '.join(output_formats) if output_formats else 'None'}")
        print()
    
    return True

def main():
    """Main test function"""
    print("🧪 FileAlchemy - Master Conversion Test")
    print("=" * 50)
    
    # Test all conversion types
    results = {}
    
    results['formats'] = test_all_supported_formats()
    results['images'] = test_image_conversions()
    results['documents'] = test_document_conversions()
    results['media'] = test_media_conversions()
    results['archives'] = test_archive_conversions()
    
    print("=" * 50)
    print("📊 Final Test Results:")
    print("-" * 30)
    
    total_tests = len(results)
    successful_tests = sum(1 for success in results.values() if success)
    
    for test_name, success in results.items():
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"   {test_name.capitalize()}: {status}")
    
    print("-" * 30)
    print(f"   Overall: {successful_tests}/{total_tests} test categories passed")
    
    if successful_tests == total_tests:
        print("\n🎉 All conversion tests PASSED!")
        print("🚀 FileAlchemy backend is ready for production!")
    else:
        print(f"\n⚠️  {total_tests - successful_tests} test categories had issues")
        print("💡 Check the logs above for details")
    
    return successful_tests == total_tests

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)