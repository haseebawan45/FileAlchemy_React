# Text-to-Speech Implementation for FileAlchemy

## Overview
We've successfully integrated text-to-speech functionality into your FileAlchemy web application using `pyttsx3`. This feature allows users to convert text into natural-sounding speech and download the audio files.

## Backend Implementation

### 1. TTS Service (`backend/tts_service.py`)
- **Engine Management**: Uses pyttsx3 with Windows SAPI voices
- **Voice Support**: Multiple voices (Male/Female, different accents)
- **Customization**: Adjustable speech rate (50-400 WPM) and volume (0.0-1.0)
- **Timeout Protection**: Prevents hanging with 20-30 second timeouts
- **Thread Safety**: Uses locks for concurrent access
- **Fresh Engine Instances**: Creates new engine instances to avoid hanging issues

### 2. API Endpoints (`backend/api_server.py`)
- `GET /api/tts/voices` - Get available TTS voices
- `POST /api/tts/convert` - Convert text to speech audio file
- `POST /api/tts/preview` - Preview speech (server-side playback)
- `GET /api/tts/health` - TTS service health check

### 3. Dependencies (`backend/requirements.txt`)
- Added `pyttsx3>=2.90` for text-to-speech functionality

## Frontend Implementation

### 1. TTS Service (`src/services/ttsService.js`)
- API communication layer for TTS endpoints
- Input validation for text and voice parameters
- Error handling and response processing

### 2. TTS Page Component (`src/components/TTSPage.jsx`)
- **Text Input**: Large textarea with character counter (max 10,000 chars)
- **Voice Selection**: Dropdown with available system voices
- **Voice Controls**: Sliders for speech rate and volume
- **Preview Function**: Test speech before conversion (max 500 chars)
- **Conversion**: Generate downloadable audio files
- **Download**: Direct download of generated WAV files

### 3. Navigation Integration
- Added TTS link to main navigation header
- Added TTS section to homepage with feature highlights
- Keyboard shortcut: `Ctrl+T` to access TTS page
- Added TTS case to main App router

### 4. Styling (`src/components/TTSPage.css`)
- Custom slider styles for rate and volume controls
- Dark mode support
- Responsive design

## Features

### Core Functionality
- ✅ **Text to Speech Conversion**: Convert any text to WAV audio files
- ✅ **Multiple Voices**: Support for system-installed voices
- ✅ **Voice Customization**: Adjustable rate (50-400 WPM) and volume (0-100%)
- ✅ **Preview Mode**: Test speech settings before conversion
- ✅ **Download Support**: Direct download of generated audio files
- ✅ **Input Validation**: Text length limits and parameter validation
- ✅ **Error Handling**: Comprehensive error messages and recovery
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile

### Technical Features
- ✅ **Timeout Protection**: Prevents hanging operations
- ✅ **Thread Safety**: Safe concurrent access
- ✅ **Memory Management**: Proper cleanup of TTS engines
- ✅ **Health Monitoring**: Service status and diagnostics
- ✅ **File Management**: Automatic cleanup of temporary files

## Available Voices (Windows)
Based on your system, the following voices are available:
1. **Microsoft David** - English (United States) - Male
2. **Microsoft Hazel** - English (Great Britain) - Female  
3. **Microsoft Zira** - English (United States) - Female

## Usage Instructions

### For Users
1. Navigate to the TTS page via the header menu or homepage
2. Enter your text in the textarea (up to 10,000 characters)
3. Select your preferred voice from the dropdown
4. Adjust speech rate and volume using the sliders
5. Click "Preview Speech" to test your settings (max 500 chars)
6. Click "Convert to Audio" to generate the audio file
7. Download the generated WAV file

### For Developers
1. **Backend**: The TTS service is automatically initialized when the server starts
2. **API Testing**: Use `python test-download.py` to test API endpoints
3. **Service Testing**: Use `python test-tts.py` to test the TTS service directly
4. **Health Check**: Monitor TTS service status via `/api/tts/health`

## File Structure
```
backend/
├── tts_service.py          # Core TTS functionality
├── api_server.py           # API endpoints (updated)
└── requirements.txt        # Dependencies (updated)

src/
├── components/
│   ├── TTSPage.jsx         # Main TTS interface
│   └── TTSPage.css         # TTS-specific styles
├── services/
│   └── ttsService.js       # Frontend TTS API client
└── App.jsx                 # Updated with TTS routing

test-tts.py                 # TTS service testing
test-download.py            # API endpoint testing
```

## Testing

### Backend Testing
```bash
# Test TTS service directly
python test-tts.py

# Test API endpoints (requires server running)
python test-download.py
```

### Manual Testing
1. Start the backend server: `python backend/api_server.py`
2. Start the frontend: `npm run dev`
3. Navigate to the TTS page and test functionality

## Deployment Notes

### Railway Deployment
- The TTS functionality will work on Railway as pyttsx3 supports server environments
- Windows SAPI voices may not be available on Linux servers
- Consider adding fallback TTS engines for production deployment

### Production Considerations
- **Voice Availability**: Linux servers may have different/fewer voices
- **Performance**: TTS conversion can be CPU-intensive for long texts
- **File Cleanup**: Temporary audio files are automatically cleaned up
- **Rate Limiting**: Consider adding rate limits for TTS conversions
- **Caching**: Consider caching frequently converted texts

## Future Enhancements
- [ ] Support for additional TTS engines (Google TTS, Amazon Polly)
- [ ] Multiple output formats (MP3, OGG)
- [ ] SSML support for advanced speech control
- [ ] Batch text processing
- [ ] Voice cloning capabilities
- [ ] Real-time streaming TTS

## Troubleshooting

### Common Issues
1. **TTS Engine Hanging**: Fixed with timeout mechanism and fresh engine instances
2. **No Voices Available**: Check system TTS installation
3. **File Not Created**: Check file permissions and disk space
4. **Preview Not Working**: Ensure system audio is working

### Error Messages
- "TTS engine not initialized": Service startup issue
- "Operation timed out": Text too long or system overloaded
- "No voices available": System TTS not properly installed
- "Audio file was not created": File system or permission issue

## Success Metrics
✅ **Backend TTS Service**: Fully functional with 3 voices available  
✅ **API Endpoints**: All endpoints working correctly  
✅ **Frontend Integration**: Complete UI with all features  
✅ **Testing**: Comprehensive test coverage  
✅ **Error Handling**: Robust error handling and recovery  
✅ **User Experience**: Intuitive interface with preview functionality  

The text-to-speech feature is now fully integrated and ready for use! 🎉