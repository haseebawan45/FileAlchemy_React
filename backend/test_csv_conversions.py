#!/usr/bin/env python3
"""
Test script for CSV and data conversions
Tests CSV, XLSX, and JSON conversions
"""

import os
import json
from pathlib import Path
from file_converter import FileConversionService

def create_test_csv():
    """Create a test CSV file"""
    csv_content = """Name,Age,City,Salary
John Doe,30,New York,75000
Jane Smith,25,Los Angeles,68000
Bob Johnson,35,Chicago,82000
Alice Brown,28,Houston,71000
Charlie Wilson,32,Phoenix,79000"""
    
    test_file = "test_data.csv"
    with open(test_file, 'w', encoding='utf-8') as f:
        f.write(csv_content)
    
    print(f"✅ Created test CSV: {test_file}")
    return test_file

def create_test_json():
    """Create a test JSON file"""
    json_data = [
        {"Product": "Laptop", "Price": 999.99, "Category": "Electronics", "Stock": 50},
        {"Product": "Mouse", "Price": 29.99, "Category": "Electronics", "Stock": 200},
        {"Product": "Keyboard", "Price": 79.99, "Category": "Electronics", "Stock": 150},
        {"Product": "Monitor", "Price": 299.99, "Category": "Electronics", "Stock": 75},
        {"Product": "Headphones", "Price": 149.99, "Category": "Electronics", "Stock": 100}
    ]
    
    test_file = "test_data.json"
    with open(test_file, 'w', encoding='utf-8') as f:
        json.dump(json_data, f, indent=2)
    
    print(f"✅ Created test JSON: {test_file}")
    return test_file

def create_test_xlsx():
    """Create a test XLSX file"""
    try:
        import pandas as pd
        
        data = {
            'Employee': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
            'Department': ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'],
            'Years': [5, 3, 7, 2, 4],
            'Performance': [4.5, 4.2, 4.8, 4.0, 4.6]
        }
        
        df = pd.DataFrame(data)
        test_file = "test_data.xlsx"
        df.to_excel(test_file, index=False)
        
        print(f"✅ Created test XLSX: {test_file}")
        return test_file
        
    except Exception as e:
        print(f"❌ Failed to create test XLSX: {e}")
        return None

def test_conversion(service, input_file, output_file, conversion_name):
    """Test a single conversion"""
    print(f"  📄 Testing {conversion_name}...")
    
    if not os.path.exists(input_file):
        print(f"  ❌ Input file not found: {input_file}")
        return False
    
    success = service.convert_file(input_file, output_file)
    
    if success and os.path.exists(output_file):
        file_size = os.path.getsize(output_file)
        print(f"  ✅ {conversion_name} successful! Output: {file_size} bytes")
        
        # Additional validation for specific formats
        if output_file.endswith('.pdf'):
            # Check if it's a valid PDF
            with open(output_file, 'rb') as f:
                header = f.read(8)
                if header.startswith(b'%PDF-'):
                    print(f"  ✅ Valid PDF file created")
                else:
                    print(f"  ❌ Invalid PDF file")
                    return False
        
        elif output_file.endswith('.json'):
            # Check if it's valid JSON
            try:
                with open(output_file, 'r', encoding='utf-8') as f:
                    json.load(f)
                print(f"  ✅ Valid JSON file created")
            except json.JSONDecodeError:
                print(f"  ❌ Invalid JSON file")
                return False
        
        return True
    else:
        print(f"  ❌ {conversion_name} failed!")
        return False

def test_csv_conversions():
    """Test all CSV conversions"""
    print("📊 Testing CSV Conversions:")
    print("=" * 40)
    
    # Initialize conversion service
    service = FileConversionService()
    
    # Check supported formats
    formats = service.list_supported_formats()
    print("📋 Data converter formats:")
    data_formats = formats.get('data', {})
    print(f"   Input: {data_formats.get('input', [])}")
    print(f"   Output: {data_formats.get('output', [])}")
    print()
    
    # Create test files
    test_csv = create_test_csv()
    test_json = create_test_json()
    test_xlsx = create_test_xlsx()
    
    results = {}
    test_files = []
    
    try:
        # Test CSV conversions
        print("📊 Testing CSV Conversions:")
        if test_csv:
            results['CSV→PDF'] = test_conversion(service, test_csv, "output_csv_to_pdf.pdf", "CSV to PDF")
            test_files.append("output_csv_to_pdf.pdf")
            
            results['CSV→XLSX'] = test_conversion(service, test_csv, "output_csv_to_xlsx.xlsx", "CSV to XLSX")
            test_files.append("output_csv_to_xlsx.xlsx")
            
            results['CSV→TXT'] = test_conversion(service, test_csv, "output_csv_to_txt.txt", "CSV to TXT")
            test_files.append("output_csv_to_txt.txt")
            
            results['CSV→JSON'] = test_conversion(service, test_csv, "output_csv_to_json.json", "CSV to JSON")
            test_files.append("output_csv_to_json.json")
        
        print()
        
        # Test XLSX conversions
        print("📈 Testing XLSX Conversions:")
        if test_xlsx:
            results['XLSX→CSV'] = test_conversion(service, test_xlsx, "output_xlsx_to_csv.csv", "XLSX to CSV")
            test_files.append("output_xlsx_to_csv.csv")
            
            results['XLSX→PDF'] = test_conversion(service, test_xlsx, "output_xlsx_to_pdf.pdf", "XLSX to PDF")
            test_files.append("output_xlsx_to_pdf.pdf")
            
            results['XLSX→TXT'] = test_conversion(service, test_xlsx, "output_xlsx_to_txt.txt", "XLSX to TXT")
            test_files.append("output_xlsx_to_txt.txt")
        
        print()
        
        # Test JSON conversions
        print("🔗 Testing JSON Conversions:")
        if test_json:
            results['JSON→CSV'] = test_conversion(service, test_json, "output_json_to_csv.csv", "JSON to CSV")
            test_files.append("output_json_to_csv.csv")
            
            results['JSON→XLSX'] = test_conversion(service, test_json, "output_json_to_xlsx.xlsx", "JSON to XLSX")
            test_files.append("output_json_to_xlsx.xlsx")
        
        print()
        
        # Test results summary
        print("📊 Data Conversion Results:")
        print("-" * 30)
        
        total_tests = len(results)
        successful_tests = sum(1 for success in results.values() if success)
        
        for conversion, success in results.items():
            status = "✅ PASSED" if success else "❌ FAILED"
            print(f"   {conversion}: {status}")
        
        print("-" * 30)
        print(f"   Total: {successful_tests}/{total_tests} conversions successful")
        
        # Test specific file content
        print("\n🔍 Verifying Output Content:")
        
        # Check CSV to PDF specifically (the main issue)
        pdf_file = "output_csv_to_pdf.pdf"
        if os.path.exists(pdf_file):
            file_size = os.path.getsize(pdf_file)
            print(f"   📄 {pdf_file}: {file_size} bytes")
            
            # Try to verify PDF structure
            with open(pdf_file, 'rb') as f:
                content = f.read(100)  # Read first 100 bytes
                if b'%PDF-' in content:
                    print(f"   ✅ PDF header found - file should open correctly")
                else:
                    print(f"   ❌ No PDF header found - file may be corrupted")
        
        return successful_tests == total_tests
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        # Cleanup
        cleanup_files = [test_csv, test_json, test_xlsx] + test_files
        for file in cleanup_files:
            if file and os.path.exists(file):
                try:
                    os.remove(file)
                    print(f"🧹 Cleaned up: {file}")
                except:
                    pass

if __name__ == "__main__":
    success = test_csv_conversions()
    if success:
        print("\n🎉 All CSV/data conversion tests PASSED!")
        print("📊 CSV to PDF conversion should now work correctly!")
    else:
        print("\n❌ Some CSV/data conversion tests FAILED!")
    
    exit(0 if success else 1)