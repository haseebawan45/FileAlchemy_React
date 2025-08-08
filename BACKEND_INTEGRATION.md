# FileAlchemy Backend Integration Guide

This guide explains how to set up and use the Python backend for real file conversion capabilities in FileAlchemy.

## 🎯 Overview

FileAlchemy now supports both **client-side mock conversion** (for demo purposes) and **server-side real conversion** using a Python backend. The app automatically detects backend availability and falls back gracefully.

### Architecture

```
Frontend (React)  ←→  Backend API (Flask)  ←→  Conversion Service (Python)
     ↓                      ↓                        ↓
- File upload           - REST endpoints        - Image conversion (Pillow)
- Progress tracking     - Job management        - Document conversion (PyMuPDF)
- Results display       - File handling         - Media conversion (FFmpeg)
- Download management   - CORS support          - Archive handling (py7zr)
```

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Run setup script (installs dependencies and checks requirements)
python setup.py

# Start the backend server
python api_server.py
```

### 2. Frontend Setup

```bash
# Install frontend dependencies (if not already done)
npm install

# Start development server
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📋 Backend Features

### Supported Conversions

| Category | Input Formats | Output Formats | Requirements |
|----------|---------------|----------------|--------------|
| **Images** | JPG, PNG, BMP, TIFF, GIF, HEIC, WEBP, ICO, SVG | JPG, PNG, BMP, TIFF, GIF, WEBP, ICO | Pillow, pillow-heif, cairosvg |
| **Documents** | PDF | TXT, DOCX | PyMuPDF, pdf2docx |
| **Media** | MP4, AVI, MOV, MKV, WMV, MP3, WAV, FLAC, AAC, OGG | MP4, AVI, MOV, MKV, WEBM, GIF, MP3, WAV, AAC, FLAC, OGG | FFmpeg |
| **Archives** | ZIP, RAR, 7Z, TAR, GZ | ZIP, 7Z, TAR, GZ | py7zr, rarfile |

### API Endpoints

#### Health Check
```http
GET /api/health
```

#### Get Supported Formats
```http
GET /api/formats
```

#### Upload and Convert (Batch)
```http
POST /api/upload
Content-Type: multipart/form-data

files: [File, File, ...]
source_format: string
target_format: string
```

#### Check Conversion Status
```http
GET /api/status/{job_id}
```

#### Download Converted File
```http
GET /api/download/{filename}
```

#### Single File Conversion (Synchronous)
```http
POST /api/convert
Content-Type: multipart/form-data

file: File
source_format: string
target_format: string
```

## 🔧 Configuration

### Backend Configuration

Edit `backend/api_server.py` to modify:

```python
# File size limits
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

# Cleanup interval
CLEANUP_INTERVAL = 3600  # 1 hour

# Server settings
app.run(debug=True, host='0.0.0.0', port=5000)
```

### Frontend Configuration

Edit `src/services/conversionApi.js` to modify:

```javascript
// Backend URL
const API_BASE_URL = 'http://localhost:5000/api';

// Polling interval for job status
const POLL_INTERVAL = 1000; // 1 second
```

## 🛠️ Development

### Backend Development

```bash
# Install development dependencies
pip install -r requirements.txt

# Run with auto-reload
python api_server.py

# Run tests
python -m pytest tests/

# Check supported formats
python file_converter.py --list-formats
```

### Frontend Development

The frontend automatically detects backend availability:

- ✅ **Backend Available**: Uses real conversion via API
- ⚠️ **Backend Unavailable**: Falls back to mock conversion
- 🔄 **Status Indicator**: Shows backend status in header

### Adding New Conversion Types

1. **Backend**: Extend `file_converter.py`
```python
class NewConverter(BaseConverter):
    def convert(self, input_path, output_path, **kwargs):
        # Implement conversion logic
        pass
    
    def supported_formats(self):
        return {'input': [...], 'output': [...]}
```

2. **Frontend**: Update `src/data/conversions.js`
```javascript
export const conversionCategories = {
  newCategory: {
    name: 'New Category',
    icon: '🆕',
    description: 'Convert new file types',
    color: 'from-blue-500 to-green-600',
    formats: ['FORMAT1', 'FORMAT2']
  }
};
```

## 🐛 Troubleshooting

### Common Issues

#### Backend Not Starting
```bash
# Check Python version (3.8+ required)
python --version

# Install missing dependencies
pip install -r backend/requirements.txt

# Check for port conflicts
netstat -an | grep 5000
```

#### Conversion Failures
```bash
# Check FFmpeg installation (for media)
ffmpeg -version

# Check system dependencies (Linux)
sudo apt install python3-dev libjpeg-dev zlib1g-dev

# View backend logs
python api_server.py  # Check console output
```

#### CORS Issues
```javascript
// Frontend shows CORS errors
// Ensure Flask-CORS is installed and configured
pip install Flask-CORS
```

#### File Size Limits
```python
# Increase limits in api_server.py
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB
```

### Debug Mode

Enable debug logging:

```python
# In api_server.py
import logging
logging.basicConfig(level=logging.DEBUG)

# In file_converter.py
print(f"Converting {input_path} to {output_path}")
```

## 🔒 Security Considerations

### File Handling
- Files are stored temporarily and cleaned up automatically
- Secure filename handling prevents directory traversal
- File size limits prevent DoS attacks

### API Security
- CORS configured for development (restrict in production)
- Input validation on all endpoints
- No persistent file storage by default

### Production Deployment
```python
# Use production WSGI server
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 api_server:app

# Configure reverse proxy (nginx)
location /api/ {
    proxy_pass http://localhost:5000/api/;
    client_max_body_size 100M;
}
```

## 📊 Performance

### Optimization Tips

1. **Concurrent Processing**: Backend uses threading for multiple files
2. **Memory Management**: Large files are processed in chunks
3. **Cleanup**: Automatic cleanup prevents disk space issues
4. **Caching**: Consider adding Redis for job status caching

### Monitoring

```python
# Add performance monitoring
import time
start_time = time.time()
# ... conversion logic ...
print(f"Conversion took {time.time() - start_time:.2f} seconds")
```

## 🚀 Deployment

### Docker Deployment

```dockerfile
# Dockerfile for backend
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application
COPY . /app
WORKDIR /app

# Run application
CMD ["python", "api_server.py"]
```

### Environment Variables

```bash
# Backend configuration
export FLASK_ENV=production
export MAX_FILE_SIZE=104857600
export CLEANUP_INTERVAL=3600

# Frontend configuration
export VITE_API_URL=https://api.filealchemy.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Code Style

```bash
# Python (backend)
pip install black flake8
black backend/
flake8 backend/

# JavaScript (frontend)
npm run lint
npm run format
```

## 📝 License

This project is licensed under the MIT License. See LICENSE file for details.

---

## 🆘 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@filealchemy.com

For more information, see the main README.md file.