"""
Universal File Conversion Service
Supports images, documents, media, and archives
"""

import os
import subprocess
from pathlib import Path
from typing import Optional, List, Dict, Any
from abc import ABC, abstractmethod

class BaseConverter(ABC):
    """Base class for all file converters"""
    
    @abstractmethod
    def convert(self, input_path: str, output_path: str, **kwargs) -> bool:
        """Convert file from input_path to output_path"""
        pass
    
    @abstractmethod
    def supported_formats(self) -> Dict[str, List[str]]:
        """Return dict of supported input->output format mappings"""
        pass

class ImageConverter(BaseConverter):
    """Handle image conversions using Pillow and pillow-heif"""
    
    def __init__(self):
        self.available_libs = {}
        try:
            from PIL import Image
            import pillow_heif
            pillow_heif.register_heif_opener()
            self.available_libs['pillow'] = True
        except ImportError as e:
            print(f"Image conversion unavailable: {e}")
            self.available_libs['pillow'] = False
            
        # Check for SVG support
        try:
            import cairosvg
            self.available_libs['cairosvg'] = True
        except ImportError:
            self.available_libs['cairosvg'] = False
            
        self.available = self.available_libs['pillow']
    
    def convert(self, input_path: str, output_path: str, **kwargs) -> bool:
        if not self.available:
            return False
            
        input_ext = Path(input_path).suffix.lower().lstrip('.')
        output_ext = Path(output_path).suffix.lower().lstrip('.')
        
        # Handle SVG conversion
        if input_ext == 'svg':
            return self._convert_svg(input_path, output_path, **kwargs)
            
        try:
            from PIL import Image
            
            with Image.open(input_path) as img:
                # Handle RGBA for formats that don't support transparency
                if output_ext in ['jpg', 'jpeg'] and img.mode in ['RGBA', 'LA']:
                    # Create white background for JPEG
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                
                # Convert and save
                save_format = output_ext.upper()
                if save_format in ['JPG']:
                    save_format = 'JPEG'
                img.save(output_path, format=save_format, **kwargs)
            return True
            
        except Exception as e:
            print(f"Image conversion failed: {e}")
            return False
    
    def _convert_svg(self, input_path: str, output_path: str, **kwargs) -> bool:
        """Convert SVG to raster format"""
        if not self.available_libs.get('cairosvg', False):
            print("cairosvg not available for SVG conversion")
            return False
            
        try:
            import cairosvg
            from PIL import Image
            import io
            
            output_ext = Path(output_path).suffix.lower().lstrip('.')
            
            if output_ext in ['png']:
                cairosvg.svg2png(url=input_path, write_to=output_path)
            elif output_ext in ['jpg', 'jpeg']:
                # Convert SVG to PNG first, then to JPEG
                png_data = cairosvg.svg2png(url=input_path)
                img = Image.open(io.BytesIO(png_data))
                # Convert RGBA to RGB for JPEG
                if img.mode == 'RGBA':
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[-1])
                    img = background
                img.save(output_path, 'JPEG')
            else:
                return False
                
            return True
        except Exception as e:
            print(f"SVG conversion failed: {e}")
            return False
    
    def supported_formats(self) -> Dict[str, List[str]]:
        formats = {
            'input': ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'gif', 'heic', 'heif', 'webp', 'ico'],
            'output': ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'gif', 'webp', 'ico']
        }
        # Add SVG support if cairosvg is available
        if self.available_libs.get('cairosvg', False):
            formats['input'].append('svg')
        return formats

class DocumentConverter(BaseConverter):
    """Handle document conversions using PyMuPDF and pdf2docx"""
    
    def __init__(self):
        self.available_libs = {}
        try:
            import fitz  # PyMuPDF
            self.available_libs['pymupdf'] = True
        except ImportError:
            self.available_libs['pymupdf'] = False
            
        try:
            from pdf2docx import Converter
            self.available_libs['pdf2docx'] = True
        except ImportError:
            self.available_libs['pdf2docx'] = False
    
    def convert(self, input_path: str, output_path: str, **kwargs) -> bool:
        input_ext = Path(input_path).suffix.lower()
        output_ext = Path(output_path).suffix.lower()
        
        # PDF to DOCX conversion
        if input_ext == '.pdf' and output_ext == '.docx':
            return self._pdf_to_docx(input_path, output_path, **kwargs)
        
        # PDF to text conversion
        elif input_ext == '.pdf' and output_ext == '.txt':
            return self._pdf_to_text(input_path, output_path, **kwargs)
        
        return False
    
    def _pdf_to_docx(self, input_path: str, output_path: str, **kwargs) -> bool:
        if not self.available_libs['pdf2docx']:
            print("pdf2docx not available")
            return False
            
        try:
            from pdf2docx import Converter
            cv = Converter(input_path)
            cv.convert(output_path, start=0, end=None)
            cv.close()
            return True
        except Exception as e:
            print(f"PDF to DOCX conversion failed: {e}")
            return False
    
    def _pdf_to_text(self, input_path: str, output_path: str, **kwargs) -> bool:
        if not self.available_libs['pymupdf']:
            print("PyMuPDF not available")
            return False
            
        try:
            import fitz
            doc = fitz.open(input_path)
            text = ""
            for page in doc:
                text += page.get_text()
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(text)
            doc.close()
            return True
        except Exception as e:
            print(f"PDF to text conversion failed: {e}")
            return False
    
    def supported_formats(self) -> Dict[str, List[str]]:
        formats = {'input': [], 'output': []}
        if self.available_libs['pymupdf']:
            formats['input'].extend(['pdf'])
            formats['output'].extend(['txt'])
        if self.available_libs['pdf2docx']:
            formats['output'].extend(['docx'])
        return formats

class MediaConverter(BaseConverter):
    """Handle video/audio conversions using FFmpeg"""
    
    def __init__(self):
        self.available = self._check_ffmpeg()
    
    def _check_ffmpeg(self) -> bool:
        try:
            subprocess.run(['ffmpeg', '-version'], 
                         capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("FFmpeg not found. Install FFmpeg for media conversion.")
            return False
    
    def convert(self, input_path: str, output_path: str, **kwargs) -> bool:
        if not self.available:
            return False
            
        try:
            cmd = ['ffmpeg', '-i', input_path]
            
            # Add common options
            if 'quality' in kwargs:
                cmd.extend(['-crf', str(kwargs['quality'])])
            if 'bitrate' in kwargs:
                cmd.extend(['-b:v', kwargs['bitrate']])
            
            cmd.extend(['-y', output_path])  # -y to overwrite
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            return result.returncode == 0
            
        except Exception as e:
            print(f"Media conversion failed: {e}")
            return False
    
    def supported_formats(self) -> Dict[str, List[str]]:
        return {
            'input': ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm', 'mp3', 'wav', 'flac', 'aac', 'ogg'],
            'output': ['mp4', 'avi', 'mov', 'mkv', 'webm', 'wmv', 'gif', 'mp3', 'wav', 'aac', 'flac', 'ogg']
        }

class ArchiveConverter(BaseConverter):
    """Handle archive conversions using various archive libraries"""
    
    def __init__(self):
        self.available_libs = {}
        
        # Check for built-in zipfile
        try:
            import zipfile
            self.available_libs['zipfile'] = True
        except ImportError:
            self.available_libs['zipfile'] = False
            
        # Check for tarfile (built-in)
        try:
            import tarfile
            self.available_libs['tarfile'] = True
        except ImportError:
            self.available_libs['tarfile'] = False
            
        # Check for py7zr
        try:
            import py7zr
            self.available_libs['py7zr'] = True
        except ImportError:
            self.available_libs['py7zr'] = False
            
        # Check for rarfile
        try:
            import rarfile
            self.available_libs['rarfile'] = True
        except ImportError:
            self.available_libs['rarfile'] = False
    
    def convert(self, input_path: str, output_path: str, **kwargs) -> bool:
        input_ext = Path(input_path).suffix.lower().lstrip('.')
        output_ext = Path(output_path).suffix.lower().lstrip('.')
        
        try:
            # Extract input archive
            temp_dir = Path("temp_extract")
            temp_dir.mkdir(exist_ok=True)
            
            if not self._extract_archive(input_path, input_ext, temp_dir):
                return False
            
            # Create output archive
            success = self._create_archive(temp_dir, output_path, output_ext)
            
            # Cleanup
            import shutil
            shutil.rmtree(temp_dir, ignore_errors=True)
            
            return success
            
        except Exception as e:
            print(f"Archive conversion failed: {e}")
            return False
    
    def _extract_archive(self, archive_path: str, format_type: str, extract_to: Path) -> bool:
        """Extract archive to temporary directory"""
        try:
            if format_type == 'zip' and self.available_libs['zipfile']:
                import zipfile
                with zipfile.ZipFile(archive_path, 'r') as zip_ref:
                    zip_ref.extractall(extract_to)
                return True
                
            elif format_type in ['tar', 'gz', 'tgz'] and self.available_libs['tarfile']:
                import tarfile
                with tarfile.open(archive_path, 'r:*') as tar_ref:
                    tar_ref.extractall(extract_to)
                return True
                
            elif format_type == '7z' and self.available_libs['py7zr']:
                import py7zr
                with py7zr.SevenZipFile(archive_path, mode='r') as z:
                    z.extractall(extract_to)
                return True
                
            elif format_type == 'rar' and self.available_libs['rarfile']:
                import rarfile
                with rarfile.RarFile(archive_path) as rf:
                    rf.extractall(extract_to)
                return True
                
            return False
        except Exception as e:
            print(f"Failed to extract {format_type}: {e}")
            return False
    
    def _create_archive(self, source_dir: Path, output_path: str, format_type: str) -> bool:
        """Create archive from directory"""
        try:
            if format_type == 'zip' and self.available_libs['zipfile']:
                import zipfile
                with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    for file_path in source_dir.rglob('*'):
                        if file_path.is_file():
                            arcname = file_path.relative_to(source_dir)
                            zipf.write(file_path, arcname)
                return True
                
            elif format_type in ['tar', 'gz'] and self.available_libs['tarfile']:
                import tarfile
                mode = 'w:gz' if format_type == 'gz' else 'w'
                with tarfile.open(output_path, mode) as tar:
                    tar.add(source_dir, arcname='.')
                return True
                
            elif format_type == '7z' and self.available_libs['py7zr']:
                import py7zr
                with py7zr.SevenZipFile(output_path, 'w') as archive:
                    for file_path in source_dir.rglob('*'):
                        if file_path.is_file():
                            arcname = file_path.relative_to(source_dir)
                            archive.write(file_path, arcname)
                return True
                
            return False
        except Exception as e:
            print(f"Failed to create {format_type}: {e}")
            return False
    
    def supported_formats(self) -> Dict[str, List[str]]:
        formats = {'input': [], 'output': []}
        
        if self.available_libs['zipfile']:
            formats['input'].append('zip')
            formats['output'].append('zip')
            
        if self.available_libs['tarfile']:
            formats['input'].extend(['tar', 'gz', 'tgz'])
            formats['output'].extend(['tar', 'gz'])
            
        if self.available_libs['py7zr']:
            formats['input'].append('7z')
            formats['output'].append('7z')
            
        if self.available_libs['rarfile']:
            formats['input'].append('rar')
            # Note: rarfile can only extract, not create RAR files
            
        return formats

class FileConversionService:
    """Main service class that orchestrates all converters"""
    
    def __init__(self):
        self.converters = {
            'image': ImageConverter(),
            'document': DocumentConverter(),
            'media': MediaConverter(),
            'archive': ArchiveConverter()
        }
    
    def convert_file(self, input_path: str, output_path: str, **kwargs) -> bool:
        """Convert a file based on its extension"""
        input_ext = Path(input_path).suffix.lower().lstrip('.')
        output_ext = Path(output_path).suffix.lower().lstrip('.')
        
        # Determine converter type
        converter_type = self._get_converter_type(input_ext, output_ext)
        if not converter_type:
            print(f"No converter found for {input_ext} -> {output_ext}")
            return False
        
        converter = self.converters[converter_type]
        return converter.convert(input_path, output_path, **kwargs)
    
    def _get_converter_type(self, input_ext: str, output_ext: str) -> Optional[str]:
        """Determine which converter to use based on file extensions"""
        for conv_type, converter in self.converters.items():
            formats = converter.supported_formats()
            if input_ext in formats['input'] and output_ext in formats['output']:
                return conv_type
        return None
    
    def list_supported_formats(self) -> Dict[str, Dict[str, List[str]]]:
        """List all supported formats by converter type"""
        return {name: conv.supported_formats() 
                for name, conv in self.converters.items()}

if __name__ == "__main__":
    # Example usage
    service = FileConversionService()
    
    # Print supported formats
    print("Supported formats:")
    for conv_type, formats in service.list_supported_formats().items():
        print(f"{conv_type}: {formats}")

class BatchConverter:
    """Handle batch file conversions with parallel processing"""
    
    def __init__(self, service: FileConversionService):
        self.service = service
    
    def convert_directory(self, input_dir: str, output_dir: str, 
                         input_format: str, output_format: str, 
                         preserve_structure: bool = True) -> Dict[str, bool]:
        """Convert all files of input_format in directory to output_format"""
        input_path = Path(input_dir)
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        results = {}
        
        # Find all files with input format
        pattern = f"**/*.{input_format}" if preserve_structure else f"*.{input_format}"
        for file_path in input_path.glob(pattern):
            if file_path.is_file():
                # Calculate output path
                relative_path = file_path.relative_to(input_path)
                output_file = output_path / relative_path.with_suffix(f'.{output_format}')
                
                # Create output directory if needed
                output_file.parent.mkdir(parents=True, exist_ok=True)
                
                # Convert file
                success = self.service.convert_file(str(file_path), str(output_file))
                results[str(file_path)] = success
                
                if success:
                    print(f"✓ Converted: {file_path} -> {output_file}")
                else:
                    print(f"✗ Failed: {file_path}")
        
        return results

def main():
    """CLI interface for file conversion"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Universal File Converter')
    parser.add_argument('input', nargs='?', help='Input file or directory path')
    parser.add_argument('output', nargs='?', help='Output file or directory path')
    parser.add_argument('--input-format', help='Input format for batch conversion')
    parser.add_argument('--output-format', help='Output format for batch conversion')
    parser.add_argument('--batch', action='store_true', help='Batch convert directory')
    parser.add_argument('--quality', type=int, help='Quality setting for media conversion')
    parser.add_argument('--list-formats', action='store_true', help='List supported formats')
    
    args = parser.parse_args()
    
    service = FileConversionService()
    
    if args.list_formats:
        print("\nSupported formats by converter type:")
        for conv_type, formats in service.list_supported_formats().items():
            print(f"\n{conv_type.upper()}:")
            print(f"  Input:  {', '.join(formats['input'])}")
            print(f"  Output: {', '.join(formats['output'])}")
        return
    
    if args.batch:
        if not args.input_format or not args.output_format:
            print("Error: --input-format and --output-format required for batch conversion")
            return
        
        batch_converter = BatchConverter(service)
        results = batch_converter.convert_directory(
            args.input, args.output, 
            args.input_format, args.output_format
        )
        
        success_count = sum(results.values())
        total_count = len(results)
        print(f"\nBatch conversion complete: {success_count}/{total_count} files converted")
    
    else:
        # Single file conversion
        kwargs = {}
        if args.quality:
            kwargs['quality'] = args.quality
        
        success = service.convert_file(args.input, args.output, **kwargs)
        if success:
            print(f"Successfully converted: {args.input} -> {args.output}")
        else:
            print(f"Conversion failed: {args.input} -> {args.output}")

if __name__ == "__main__":
    main()