#!/usr/bin/env python3
"""
Test script for PDF to image conversion
"""

import os
import tempfile
from pathlib import Path
from file_converter import FileConversionService

def create_test_pdf():
    """Create a simple test PDF with multiple pages"""
    try:
        import fitz  # PyMuPDF
        
        # Create a simple PDF with 3 pages
        doc = fitz.open()  # Create new PDF
        
        for page_num in range(3):
            page = doc.new_page()  # Add new page
            
            # Add some text to the page
            text = f"This is page {page_num + 1}\n\nTest PDF for conversion\nto multiple images."
            
            # Insert text
            page.insert_text(
                (50, 100),  # Position
                text,
                fontsize=16,
                color=(0, 0, 0)  # Black color
            )
            
            # Add a simple rectangle
            rect = fitz.Rect(50, 200, 200, 300)
            page.draw_rect(rect, color=(0, 0, 1), width=2)  # Blue rectangle
        
        # Save the test PDF
        test_pdf_path = "test_multipage.pdf"
        doc.save(test_pdf_path)
        doc.close()
        
        print(f"✅ Created test PDF: {test_pdf_path}")
        return test_pdf_path
        
    except Exception as e:
        print(f"❌ Failed to create test PDF: {e}")
        return None

def test_pdf_to_images():
    """Test PDF to images conversion"""
    print("🧪 Testing PDF to Images Conversion")
    print("=" * 40)
    
    # Create test PDF
    test_pdf = create_test_pdf()
    if not test_pdf:
        return False
    
    try:
        # Initialize conversion service
        service = FileConversionService()
        
        # Test conversion to JPG (should create ZIP)
        output_zip = "test_output_pages.jpg"  # Use .jpg extension, converter will create ZIP internally
        
        print(f"📄 Converting {test_pdf} to JPG images...")
        success = service.convert_file(test_pdf, output_zip, dpi=150)
        
        if success:
            print(f"✅ Conversion successful!")
            print(f"📦 Output file: {output_zip}")
            
            # Check if output file exists and has content
            if os.path.exists(output_zip):
                file_size = os.path.getsize(output_zip)
                print(f"📊 File size: {file_size} bytes")
                
                # Try to list contents of ZIP (the output should be a ZIP file)
                try:
                    import zipfile
                    with zipfile.ZipFile(output_zip, 'r') as zf:
                        files = zf.namelist()
                        print(f"📁 ZIP contains {len(files)} files:")
                        for file in files:
                            print(f"   - {file}")
                    return True
                except zipfile.BadZipFile:
                    print("❌ Output file is not a valid ZIP file")
                    return False
            else:
                print("❌ Output file not found")
                return False
        else:
            print("❌ Conversion failed")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    finally:
        # Cleanup
        for file in [test_pdf, "test_output_pages.jpg"]:
            if os.path.exists(file):
                try:
                    os.remove(file)
                    print(f"🧹 Cleaned up: {file}")
                except:
                    pass

if __name__ == "__main__":
    success = test_pdf_to_images()
    if success:
        print("\n🎉 PDF to images conversion test PASSED!")
    else:
        print("\n❌ PDF to images conversion test FAILED!")