#!/usr/bin/env python3
"""
Example usage of the File Conversion Service
"""

from file_converter import FileConversionService, BatchConverter
from pathlib import Path

def demo_conversions():
    """Demonstrate various file conversions"""
    service = FileConversionService()
    
    print("=== File Conversion Service Demo ===\n")
    
    # Show supported formats
    print("Supported formats:")
    formats = service.list_supported_formats()
    for conv_type, format_dict in formats.items():
        print(f"{conv_type.capitalize()}:")
        print(f"  Input:  {', '.join(format_dict['input'])}")
        print(f"  Output: {', '.join(format_dict['output'])}")
        print()
    
    # Example conversions (uncomment when you have test files)
    """
    # Image conversion examples
    print("Image Conversions:")
    service.convert_file("test.png", "test.jpg")
    service.convert_file("test.heic", "test.png")
    service.convert_file("test.jpg", "test.webp")
    
    # Document conversion examples
    print("\nDocument Conversions:")
    service.convert_file("document.pdf", "document.txt")
    service.convert_file("document.pdf", "document.docx")
    
    # Media conversion examples (requires FFmpeg)
    print("\nMedia Conversions:")
    service.convert_file("video.mp4", "video.avi")
    service.convert_file("video.mov", "animation.gif")
    service.convert_file("audio.wav", "audio.mp3")
    
    # Batch conversion example
    print("\nBatch Conversion:")
    batch = BatchConverter(service)
    results = batch.convert_directory(
        "input_images/", "output_images/", 
        "png", "jpg"
    )
    """

def create_test_structure():
    """Create a test directory structure for demonstration"""
    test_dir = Path("test_files")
    test_dir.mkdir(exist_ok=True)
    
    # Create subdirectories
    (test_dir / "images").mkdir(exist_ok=True)
    (test_dir / "documents").mkdir(exist_ok=True)
    (test_dir / "media").mkdir(exist_ok=True)
    (test_dir / "output").mkdir(exist_ok=True)
    
    print(f"Created test directory structure at: {test_dir.absolute()}")
    print("Add your test files to the appropriate subdirectories:")
    print("- images/: PNG, JPG, HEIC files")
    print("- documents/: PDF files")
    print("- media/: MP4, AVI, MP3 files")

if __name__ == "__main__":
    demo_conversions()
    create_test_structure()