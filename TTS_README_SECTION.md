# 🎤 Text-to-Speech Feature

FileAlchemy now includes a powerful text-to-speech (TTS) feature that converts your text into natural-sounding speech using advanced voice synthesis.

## ✨ Features

- **🎵 Multiple Voices**: Choose from various system voices with different accents and genders
- **⚙️ Customizable Settings**: Adjust speech rate (50-400 WPM) and volume (0-100%)
- **🎧 Preview Mode**: Test your settings before generating the final audio
- **💾 Download Audio**: Save generated speech as high-quality WAV files
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **💾 Smart Preferences**: Automatically saves your voice settings for future use
- **📋 Recent History**: Keep track of your recent conversions with quick re-download
- **⚡ Real-time Stats**: See character count, word count, and estimated duration

## 🚀 How to Use

### Basic Usage
1. **Navigate to TTS**: Click "Text to Speech" in the header menu or use `Ctrl+T`
2. **Enter Text**: Type or paste your text (up to 10,000 characters)
3. **Choose Voice**: Select from available system voices
4. **Adjust Settings**: Set your preferred speech rate and volume
5. **Preview**: Click "Preview Speech" to test your settings (max 500 chars)
6. **Convert**: Click "Convert to Audio" to generate the audio file
7. **Download**: Download your generated WAV file

### Advanced Features
- **Sample Text**: Use the "Sample Text" button to try the feature quickly
- **Voice Preferences**: Your settings are automatically saved for next time
- **Recent Conversions**: Access your conversion history for quick re-downloads
- **Real-time Feedback**: See word count and estimated duration as you type

## 🎛️ Voice Settings

### Speech Rate
- **Range**: 50-400 words per minute
- **Default**: 200 WPM
- **Slow**: 50-150 WPM (good for learning content)
- **Normal**: 150-250 WPM (conversational speed)
- **Fast**: 250-400 WPM (quick information delivery)

### Volume
- **Range**: 0-100%
- **Default**: 90%
- **Quiet**: 0-30% (background listening)
- **Normal**: 40-80% (standard playback)
- **Loud**: 80-100% (clear, prominent audio)

## 🎤 Available Voices

The available voices depend on your system's TTS engine:

### Windows
- **Microsoft David** - English (US) - Male
- **Microsoft Hazel** - English (UK) - Female
- **Microsoft Zira** - English (US) - Female

### macOS
- System voices vary by macOS version and language settings

### Linux
- Depends on installed TTS engines (espeak, festival, etc.)

## 📊 Technical Specifications

- **Input**: Plain text up to 10,000 characters
- **Output**: WAV audio files
- **Quality**: 16-bit, 22kHz (standard speech quality)
- **Processing**: Server-side conversion using pyttsx3
- **Timeout**: 30-second maximum conversion time
- **File Cleanup**: Automatic cleanup of temporary files

## 🔧 API Endpoints

For developers integrating with the TTS API:

```bash
# Get available voices
GET /api/tts/voices

# Convert text to speech
POST /api/tts/convert
{
  "text": "Your text here",
  "rate": 200,
  "volume": 0.8,
  "voice_id": "voice_identifier"
}

# Preview speech (server-side playback)
POST /api/tts/preview
{
  "text": "Preview text (max 500 chars)",
  "rate": 200,
  "volume": 0.8,
  "voice_id": "voice_identifier"
}

# Health check
GET /api/tts/health
```

## 🛠️ Development & Testing

### Local Testing
```bash
# Test TTS service directly
python test-tts.py

# Test API endpoints (requires server running)
python test-download.py

# Verify deployment
python verify-tts-deployment.py [URL]
```

### Frontend Development
```bash
# Start development server
npm run dev

# Navigate to TTS page
http://localhost:3000 → Text to Speech
```

## 🚀 Deployment

The TTS feature is automatically deployed with your FileAlchemy application:

1. **Railway**: Fully supported with automatic dependency installation
2. **Docker**: Included in the Docker build process
3. **Manual**: Install `pyttsx3` and system TTS dependencies

### Deployment Verification
```bash
# Verify TTS is working in production
python verify-tts-deployment.py https://your-app-url.com
```

## 🔍 Troubleshooting

### Common Issues

**"TTS engine not initialized"**
- Check if pyttsx3 is installed: `pip install pyttsx3`
- Verify system TTS is available
- Check server logs for initialization errors

**"No voices available"**
- Install system TTS voices
- On Linux: `sudo apt-get install espeak espeak-data`
- On Windows: Voices should be available by default

**"Operation timed out"**
- Text might be too long (try shorter text)
- Server might be overloaded (try again later)
- Check network connectivity

**"Audio file not created"**
- Check disk space and permissions
- Verify output directory is writable
- Check for file system errors

### Performance Tips

- **Shorter Text**: Keep text under 1000 words for faster processing
- **Simple Text**: Avoid complex formatting or special characters
- **Reasonable Rate**: Use 150-250 WPM for best quality
- **Standard Volume**: Keep volume between 50-90% for optimal output

## 📈 Usage Analytics

Track your TTS usage through the Analytics dashboard:
- Total conversions performed
- Average text length
- Most used voices
- Conversion success rate

## 🔒 Privacy & Security

- **No Data Storage**: Text is processed and immediately discarded
- **Temporary Files**: Audio files are automatically cleaned up
- **Local Processing**: All TTS processing happens on the server
- **No Tracking**: Your text content is never logged or stored

## 🎯 Use Cases

### Educational
- **Language Learning**: Practice pronunciation and listening
- **Accessibility**: Audio content for visually impaired users
- **Study Materials**: Convert notes to audio for multitasking

### Professional
- **Presentations**: Create audio narrations
- **Documentation**: Audio versions of written content
- **Announcements**: Generate professional voice messages

### Personal
- **Content Creation**: Voiceovers for videos
- **Reading**: Audio versions of articles or documents
- **Accessibility**: Personal audio assistance

## 🔮 Future Enhancements

- [ ] **Multiple Formats**: MP3, OGG, and other audio formats
- [ ] **Cloud Voices**: Integration with Google TTS, Amazon Polly
- [ ] **SSML Support**: Advanced speech markup for better control
- [ ] **Batch Processing**: Convert multiple texts at once
- [ ] **Voice Cloning**: Custom voice training capabilities
- [ ] **Real-time Streaming**: Live text-to-speech conversion

---

The text-to-speech feature adds a new dimension to FileAlchemy, making it not just a file converter but a comprehensive content transformation platform. Whether you're creating accessible content, learning materials, or just want to hear your text read aloud, our TTS feature provides professional-quality results with an intuitive interface.