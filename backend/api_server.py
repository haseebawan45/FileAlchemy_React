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
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from file_converter import FileConversionService
import threading
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
UPLOAD_FOLDER = 'temp_uploads'
CONVERTED_FOLDER = 'temp_converted'
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
ALLOWED_EXTENSIONS = {
    'images': {'jpg', 'jpeg', 'png', 'bmp', 'tiff', 'gif', 'heic', 'heif', 'webp', 'ico', 'svg'},
    'documents': {'pdf', 'docx', 'txt', 'html', 'rtf', 'xlsx', 'csv', 'pptx', 'odt', 'ods', 'odp'},
    'video': {'mp4', 'avi', 'mov', 'mkv', 'wmv', 'webm', 'flv'},
    'audio': {'mp3', 'wav', 'flac', 'aac', 'ogg'},
    'archives': {'zip', 'rar', '7z', 'tar', 'gz'}
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
            output_filename = f"{filename_without_ext}.{job.target_format.lower()}"
            output_path = os.path.join(CONVERTED_FOLDER, f"{job.job_id}_{output_filename}")
            
            # Perform conversion
            success = conversion_service.convert_file(input_path, output_path)
            
            result = {
                'original_filename': file_info['filename'],
                'converted_filename': output_filename,
                'success': success,
                'size': os.path.getsize(output_path) if success and os.path.exists(output_path) else 0,
                'download_url': f"/api/download/{job.job_id}_{output_filename}" if success else None
            }
            
            if not success:
                result['error'] = f"Failed to convert {file_info['filename']}"
            
            job.results.append(result)
            job.progress = int(((i + 1) / total_files) * 100)
        
        job.status = 'completed'
        
    except Exception as e:
        job.status = 'failed'
        job.error_message = str(e)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'FileAlchemy API',
        'version': '1.0.0'
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
    filepath = os.path.join(CONVERTED_FOLDER, filename)
    
    if not os.path.exists(filepath):
        return jsonify({'success': False, 'error': 'File not found'}), 404
    
    return send_file(filepath, as_attachment=True)

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
        output_filename = f"{filename_without_ext}.{target_format.lower()}"
        output_path = os.path.join(CONVERTED_FOLDER, f"{uuid.uuid4()}_{output_filename}")
        
        # Perform conversion
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

# Start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_task)
cleanup_thread.daemon = True
cleanup_thread.start()

if __name__ == '__main__':
    print("Starting FileAlchemy API Server...")
    print("Supported formats:")
    formats = conversion_service.list_supported_formats()
    for conv_type, format_dict in formats.items():
        print(f"  {conv_type.capitalize()}:")
        print(f"    Input:  {', '.join(format_dict['input'])}")
        print(f"    Output: {', '.join(format_dict['output'])}")
    
    app.run(debug=True, host='0.0.0.0', port=5000)