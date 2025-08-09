#!/usr/bin/env python3
"""
Flask API Server for FileAlchemy
Provides REST endpoints for file conversion
"""

import os
import uuid
import tempfile
import shutil
from pathlib import Path
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from file_converter import FileConversionService
import threading
import time

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    # Load .env file from project root (one level up from backend)
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    load_dotenv(env_path)
    print(f"✅ Loaded environment variables from {env_path}")
except ImportError:
    print("⚠️  python-dotenv not installed, using system environment variables only")
except Exception as e:
    print(f"⚠️  Could not load .env file: {e}")

app = Flask(__name__)

# Configure CORS based on environment
if os.environ.get('FLASK_ENV') == 'development':
    CORS(app)  # Allow all origins in development
else:
    # In production, be more restrictive with CORS
    allowed_origins = os.environ.get('ALLOWED_ORIGINS', '').split(',')
    if allowed_origins and allowed_origins[0]:
        CORS(app, origins=allowed_origins)
    else:
        CORS(app)  # Fallback to allow all if not configured

# Configuration - Use absolute paths for Railway deployment
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'temp_uploads')
CONVERTED_FOLDER = os.path.join(BASE_DIR, 'temp_converted')
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
ALLOWED_EXTENSIONS = {
    'images': {'jpg', 'jpeg', 'png', 'bmp', 'tiff', 'gif', 'heic', 'heif', 'webp', 'ico', 'svg'},
    'documents': {'pdf', 'docx', 'txt', 'html', 'rtf', 'xlsx', 'csv', 'pptx', 'odt', 'ods', 'odp'},
    'video': {'mp4', 'avi', 'mov', 'mkv', 'wmv', 'webm', 'flv'},
    'audio': {'mp3', 'wav', 'flac', 'aac', 'ogg'},
    'archives': {'zip', 'rar', '7z', 'tar', 'gz'},
    'data': {'json', 'xml', 'yaml', 'yml'}
}

# Create directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONVERTED_FOLDER, exist_ok=True)

# Initialize conversion service
conversion_service = FileConversionService()

# Store conversion jobs in memory (in production, use Redis or database)
conversion_jobs = {}

class ConversionJob:
    def __init__(self, job_id, files, source_format, target_format):
        self.job_id = job_id
        self.files = files
        self.source_format = source_format
        self.target_format = target_format
        self.status = 'pending'  # pending, processing, completed, failed
        self.progress = 0
        self.results = []
        self.error_message = None
        self.created_at = time.time()

def allowed_file(filename, category=None):
    """Check if file extension is allowed"""
    if '.' not in filename:
        return False
    
    ext = filename.rsplit('.', 1)[1].lower()
    
    if category:
        return ext in ALLOWED_EXTENSIONS.get(category, set())
    else:
        # Check all categories
        all_extensions = set()
        for exts in ALLOWED_EXTENSIONS.values():
            all_extensions.update(exts)
        return ext in all_extensions

def get_file_category(filename):
    """Determine file category based on extension"""
    if '.' not in filename:
        return None
    
    ext = filename.rsplit('.', 1)[1].lower()
    
    for category, extensions in ALLOWED_EXTENSIONS.items():
        if ext in extensions:
            return category
    return None

def cleanup_old_files():
    """Clean up files older than 1 hour"""
    current_time = time.time()
    cutoff_time = current_time - 3600  # 1 hour
    
    # Clean upload folder
    for filename in os.listdir(UPLOAD_FOLDER):
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.getctime(filepath) < cutoff_time:
            try:
                os.remove(filepath)
            except OSError:
                pass
    
    # Clean converted folder
    for filename in os.listdir(CONVERTED_FOLDER):
        filepath = os.path.join(CONVERTED_FOLDER, filename)
        if os.path.getctime(filepath) < cutoff_time:
            try:
                os.remove(filepath)
            except OSError:
                pass
    
    # Clean old jobs
    jobs_to_remove = []
    for job_id, job in conversion_jobs.items():
        if job.created_at < cutoff_time:
            jobs_to_remove.append(job_id)
    
    for job_id in jobs_to_remove:
        del conversion_jobs[job_id]

def process_conversion_job(job):
    """Process conversion job in background thread"""
    try:
        job.status = 'processing'
        total_files = len(job.files)
        
        for i, file_info in enumerate(job.files):
            input_path = file_info['path']
            filename_without_ext = Path(file_info['filename']).stem
            
            # Special handling for PDF to image conversion (results in ZIP file)
            if job.source_format.upper() == 'PDF' and job.target_format.upper() in ['JPG', 'JPEG', 'PNG']:
                output_filename = f"{filename_without_ext}_pages.zip"
                output_path = os.path.join(CONVERTED_FOLDER, f"{job.job_id}_{output_filename}")
            else:
                output_filename = f"{filename_without_ext}.{job.target_format.lower()}"
                output_path = os.path.join(CONVERTED_FOLDER, f"{job.job_id}_{output_filename}")
            
            # Perform conversion
            print(f"Converting {input_path} to {output_path} (format: {job.source_format} -> {job.target_format})")
            
            # For PDF to image conversions, we need to pass the image format to the converter
            # even though the output file will be a ZIP
            if job.source_format.upper() == 'PDF' and job.target_format.upper() in ['JPG', 'JPEG', 'PNG']:
                # Create a temporary output path with the image extension for the converter
                temp_output = output_path.replace('_pages.zip', f'.{job.target_format.lower()}')
                success = conversion_service.convert_file(input_path, temp_output, target_format=job.target_format)
                
                # If successful, the converter should have created a ZIP file at temp_output
                # Rename it to the expected output_path
                if success and os.path.exists(temp_output):
                    import shutil
                    shutil.move(temp_output, output_path)
                    print(f"Moved {temp_output} to {output_path}")
                elif success:
                    print(f"Warning: Conversion succeeded but temp file {temp_output} not found")
                    success = False
            else:
                success = conversion_service.convert_file(input_path, output_path)
            
            print(f"Conversion result: {success}")
            
            result = {
                'original_filename': file_info['filename'],
                'converted_filename': output_filename,
                'success': success,
                'size': os.path.getsize(output_path) if success and os.path.exists(output_path) else 0,
                'download_url': f"/api/download/{job.job_id}_{output_filename}" if success else None
            }
            
            if not success:
                result['error'] = f"Failed to convert {file_info['filename']}"
                print(f"Conversion failed for {file_info['filename']}")
            
            job.results.append(result)
            job.progress = int(((i + 1) / total_files) * 100)
        
        job.status = 'completed'
        
    except Exception as e:
        job.status = 'failed'
        job.error_message = str(e)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    # Check if conversion service is working
    try:
        formats = conversion_service.list_supported_formats()
        service_status = 'healthy'
    except Exception as e:
        formats = {}
        service_status = f'degraded: {str(e)}'
    
    return jsonify({
        'status': service_status,
        'service': 'FileAlchemy API',
        'version': '1.0.0',
        'environment': os.environ.get('FLASK_ENV', 'development'),
        'port': os.environ.get('PORT', '5000'),
        'supported_formats': len(formats),
        'frontend_available': os.path.exists(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dist'))
    })

@app.route('/api/formats', methods=['GET'])
def get_supported_formats():
    """Get all supported formats"""
    formats = conversion_service.list_supported_formats()
    return jsonify({
        'success': True,
        'formats': formats
    })

@app.route('/api/upload', methods=['POST'])
def upload_files():
    """Upload files for conversion"""
    try:
        if 'files' not in request.files:
            return jsonify({'success': False, 'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        source_format = request.form.get('source_format', '').upper()
        target_format = request.form.get('target_format', '').upper()
        
        if not source_format or not target_format:
            return jsonify({'success': False, 'error': 'Source and target formats required'}), 400
        
        if not files or all(f.filename == '' for f in files):
            return jsonify({'success': False, 'error': 'No files selected'}), 400
        
        # Check if conversion is supported before processing files
        is_supported, reason = conversion_service.is_conversion_supported(
            source_format.lower(), target_format.lower()
        )
        if not is_supported:
            return jsonify({
                'success': False, 
                'error': f'Conversion not supported: {reason}'
            }), 400

        # Validate files
        uploaded_files = []
        for file in files:
            if file.filename == '':
                continue
            
            # Check file size
            file.seek(0, 2)  # Seek to end
            file_size = file.tell()
            file.seek(0)  # Reset to beginning
            
            if file_size > MAX_FILE_SIZE:
                return jsonify({
                    'success': False, 
                    'error': f'File {file.filename} is too large (max {MAX_FILE_SIZE // (1024*1024)}MB)'
                }), 400
            
            # Check file extension
            if not allowed_file(file.filename):
                return jsonify({
                    'success': False, 
                    'error': f'File type not supported: {file.filename}'
                }), 400
            
            # Save file
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
            file.save(filepath)
            
            uploaded_files.append({
                'filename': filename,
                'path': filepath,
                'size': file_size
            })
        
        if not uploaded_files:
            return jsonify({'success': False, 'error': 'No valid files uploaded'}), 400
        
        # Create conversion job
        job_id = str(uuid.uuid4())
        job = ConversionJob(job_id, uploaded_files, source_format, target_format)
        conversion_jobs[job_id] = job
        
        # Start conversion in background thread
        thread = threading.Thread(target=process_conversion_job, args=(job,))
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'job_id': job_id,
            'message': f'Started conversion of {len(uploaded_files)} files'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/status/<job_id>', methods=['GET'])
def get_conversion_status(job_id):
    """Get conversion job status"""
    if job_id not in conversion_jobs:
        return jsonify({'success': False, 'error': 'Job not found'}), 404
    
    job = conversion_jobs[job_id]
    
    return jsonify({
        'success': True,
        'job_id': job_id,
        'status': job.status,
        'progress': job.progress,
        'results': job.results,
        'error_message': job.error_message
    })

@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download converted file"""
    try:
        # Security check - prevent directory traversal
        if '..' in filename or '/' in filename or '\\' in filename:
            print(f"❌ Security violation: Invalid filename {filename}")
            return jsonify({'success': False, 'error': 'Invalid filename'}), 400
        
        filepath = os.path.join(CONVERTED_FOLDER, filename)
        print(f"🔍 Download request for: {filename}")
        print(f"📁 Full path: {filepath}")
        print(f"📂 Converted folder: {CONVERTED_FOLDER}")
        print(f"📋 Folder exists: {os.path.exists(CONVERTED_FOLDER)}")
        print(f"📄 File exists: {os.path.exists(filepath)}")
        
        # List files in converted folder for debugging
        if os.path.exists(CONVERTED_FOLDER):
            files_in_folder = os.listdir(CONVERTED_FOLDER)
            print(f"📁 Files in converted folder: {files_in_folder}")
        else:
            print("❌ Converted folder does not exist!")
            os.makedirs(CONVERTED_FOLDER, exist_ok=True)
            print("✅ Created converted folder")
        
        if not os.path.exists(filepath):
            print(f"❌ File not found: {filepath}")
            return jsonify({'success': False, 'error': f'File not found: {filename}'}), 404
        
        # Check file size
        file_size = os.path.getsize(filepath)
        print(f"📊 File size: {file_size} bytes")
        
        if file_size == 0:
            print(f"⚠️ Warning: File is empty: {filepath}")
            return jsonify({'success': False, 'error': 'File is empty'}), 404
        
        print(f"✅ Sending file: {filepath}")
        return send_file(filepath, as_attachment=True, download_name=filename)
        
    except Exception as e:
        print(f"❌ Download error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Download failed: {str(e)}'}), 500

@app.route('/api/convert', methods=['POST'])
def convert_single_file():
    """Convert a single file (synchronous)"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        source_format = request.form.get('source_format', '').upper()
        target_format = request.form.get('target_format', '').upper()
        
        if not source_format or not target_format:
            return jsonify({'success': False, 'error': 'Source and target formats required'}), 400
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Check if conversion is supported before processing
        is_supported, reason = conversion_service.is_conversion_supported(
            source_format.lower(), target_format.lower()
        )
        if not is_supported:
            return jsonify({
                'success': False, 
                'error': f'Conversion not supported: {reason}'
            }), 400
        
        # Validate file
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'File type not supported'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        input_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(input_path)
        
        # Prepare output file
        filename_without_ext = Path(filename).stem
        
        # Special handling for PDF to image conversion (results in ZIP file)
        if source_format.upper() == 'PDF' and target_format.upper() in ['JPG', 'JPEG', 'PNG']:
            output_filename = f"{filename_without_ext}_pages.zip"
            output_path = os.path.join(CONVERTED_FOLDER, f"{uuid.uuid4()}_{output_filename}")
        else:
            output_filename = f"{filename_without_ext}.{target_format.lower()}"
            output_path = os.path.join(CONVERTED_FOLDER, f"{uuid.uuid4()}_{output_filename}")
        
        # Perform conversion
        if source_format.upper() == 'PDF' and target_format.upper() in ['JPG', 'JPEG', 'PNG']:
            # Create a temporary output path with the image extension for the converter
            temp_output = output_path.replace('_pages.zip', f'.{target_format.lower()}')
            success = conversion_service.convert_file(input_path, temp_output, target_format=target_format)
            
            # If successful, the converter should have created a ZIP file at temp_output
            # Rename it to the expected output_path
            if success and os.path.exists(temp_output):
                import shutil
                shutil.move(temp_output, output_path)
                print(f"Moved {temp_output} to {output_path}")
            elif success:
                print(f"Warning: Conversion succeeded but temp file {temp_output} not found")
                success = False
        else:
            success = conversion_service.convert_file(input_path, output_path)
        
        if success:
            return jsonify({
                'success': True,
                'original_filename': filename,
                'converted_filename': output_filename,
                'download_url': f"/api/download/{os.path.basename(output_path)}",
                'size': os.path.getsize(output_path)
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Failed to convert {filename} from {source_format} to {target_format}'
            }), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        # Clean up input file
        if 'input_path' in locals() and os.path.exists(input_path):
            try:
                os.remove(input_path)
            except OSError:
                pass

# Cleanup task
def cleanup_task():
    """Periodic cleanup task"""
    while True:
        time.sleep(300)  # Run every 5 minutes
        cleanup_old_files()

# Serve static files (React frontend) in production
# This route must be AFTER all API routes to avoid conflicts
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve React frontend static files"""
    # Skip API routes - they should be handled by their specific endpoints
    if path.startswith('api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    
    # In production, serve built React files
    static_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dist')
    
    if os.path.exists(static_folder):
        if path != "" and os.path.exists(os.path.join(static_folder, path)):
            return send_from_directory(static_folder, path)
        else:
            # For React Router, serve index.html for all non-API routes
            return send_from_directory(static_folder, 'index.html')
    else:
        # Development mode - return a simple message
        return jsonify({
            'message': 'FileAlchemy API Server',
            'status': 'running',
            'frontend': 'not built - run npm run build to create production frontend',
            'note': 'Run "npm run build" to create the production frontend'
        })

# Start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_task)
cleanup_thread.daemon = True
cleanup_thread.start()

if __name__ == '__main__':
    print("Starting FileAlchemy API Server...")
    print(f"Base directory: {BASE_DIR}")
    print(f"Upload folder: {UPLOAD_FOLDER}")
    print(f"Converted folder: {CONVERTED_FOLDER}")
    print(f"Upload folder exists: {os.path.exists(UPLOAD_FOLDER)}")
    print(f"Converted folder exists: {os.path.exists(CONVERTED_FOLDER)}")
    
    print("Supported formats:")
    formats = conversion_service.list_supported_formats()
    for conv_type, format_dict in formats.items():
        print(f"  {conv_type.capitalize()}:")
        print(f"    Input:  {', '.join(format_dict['input'])}")
        print(f"    Output: {', '.join(format_dict['output'])}")
    
    # Get port from environment variable (Railway sets PORT automatically)
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"Server starting on port {port}")
    app.run(debug=debug_mode, host='0.0.0.0', port=port)