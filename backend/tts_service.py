#!/usr/bin/env python3
"""
Text-to-Speech Service for FileAlchemy
Provides high-quality TTS functionality using Google Text-to-Speech (gTTS)
"""

import os
import uuid
import tempfile
import threading
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import io

class TTSService:
    def __init__(self):
        self.available_voices = []
        self.is_initialized = False
        self.lock = threading.Lock()
        self.supported_languages = {}
        self._initialize_service()
    
    def _initialize_service(self):
        """Initialize the Google TTS service"""
        try:
            # Try to import gTTS
            try:
                from gtts import gTTS
                self.gtts_available = True
                print("✅ Google TTS (gTTS) library available")
            except ImportError:
                print("⚠️  gTTS library not found, trying to install...")
                try:
                    import subprocess
                    subprocess.check_call(['pip', 'install', 'gtts'])
                    from gtts import gTTS
                    self.gtts_available = True
                    print("✅ Google TTS (gTTS) library installed and imported")
                except Exception as install_error:
                    print(f"❌ Failed to install gTTS: {install_error}")
                    self.gtts_available = False
            
            if self.gtts_available:
                # Initialize supported languages and voices
                self._initialize_voices()
                self.is_initialized = True
                print(f"🎤 Google TTS initialized with {len(self.available_voices)} voices")
            else:
                print("❌ Google TTS not available")
                self.is_initialized = False
                
        except Exception as e:
            print(f"❌ Failed to initialize Google TTS service: {e}")
            self.is_initialized = False
    
    def _initialize_voices(self):
        """Initialize available Google TTS voices and languages"""
        # Google TTS supports many languages with high-quality voices
        # We'll provide a curated list of the most popular ones
        self.supported_languages = {
            'en': {'name': 'English', 'tlds': ['com', 'co.uk', 'com.au', 'ca']},
            'es': {'name': 'Spanish', 'tlds': ['es', 'com.mx']},
            'fr': {'name': 'French', 'tlds': ['fr', 'ca']},
            'de': {'name': 'German', 'tlds': ['de']},
            'it': {'name': 'Italian', 'tlds': ['it']},
            'pt': {'name': 'Portuguese', 'tlds': ['pt', 'com.br']},
            'ru': {'name': 'Russian', 'tlds': ['ru']},
            'ja': {'name': 'Japanese', 'tlds': ['co.jp']},
            'ko': {'name': 'Korean', 'tlds': ['co.kr']},
            'zh': {'name': 'Chinese', 'tlds': ['com']},
            'hi': {'name': 'Hindi', 'tlds': ['co.in']},
            'ar': {'name': 'Arabic', 'tlds': ['com']},
            'nl': {'name': 'Dutch', 'tlds': ['nl']},
            'sv': {'name': 'Swedish', 'tlds': ['se']},
            'da': {'name': 'Danish', 'tlds': ['dk']},
            'no': {'name': 'Norwegian', 'tlds': ['no']},
            'fi': {'name': 'Finnish', 'tlds': ['fi']},
            'pl': {'name': 'Polish', 'tlds': ['pl']},
            'tr': {'name': 'Turkish', 'tlds': ['com.tr']},
            'th': {'name': 'Thai', 'tlds': ['co.th']}
        }
        
        # Create voice entries for different accents/regions
        voices = []
        voice_index = 0
        
        for lang_code, lang_info in self.supported_languages.items():
            lang_name = lang_info['name']
            tlds = lang_info['tlds']
            
            for tld in tlds:
                # Determine region/accent name
                region_name = self._get_region_name(tld)
                voice_name = f"{lang_name}"
                if region_name:
                    voice_name += f" ({region_name})"
                
                voices.append({
                    'id': f"{lang_code}-{tld}",
                    'name': voice_name,
                    'language': lang_code,
                    'tld': tld,
                    'gender': 'neutral',  # gTTS voices are generally neutral
                    'age': 'adult',
                    'languages': [lang_code],
                    'index': voice_index,
                    'quality': 'high'
                })
                
                voice_index += 1
                
                # Limit to first 20 voices for better UX
                if voice_index >= 20:
                    break
            
            if voice_index >= 20:
                break
        
        self.available_voices = voices
        
        # Log available voices
        for voice in voices[:5]:  # Show first 5
            print(f"🎤 Voice: {voice['name']} (ID: {voice['id']})")
        if len(voices) > 5:
            print(f"🎤 ... and {len(voices) - 5} more voices")
    
    def _get_region_name(self, tld: str) -> str:
        """Get human-readable region name from TLD"""
        region_map = {
            'com': 'US',
            'co.uk': 'UK',
            'com.au': 'Australia',
            'ca': 'Canada',
            'es': 'Spain',
            'com.mx': 'Mexico',
            'fr': 'France',
            'de': 'Germany',
            'it': 'Italy',
            'pt': 'Portugal',
            'com.br': 'Brazil',
            'ru': 'Russia',
            'co.jp': 'Japan',
            'co.kr': 'Korea',
            'co.in': 'India',
            'nl': 'Netherlands',
            'se': 'Sweden',
            'dk': 'Denmark',
            'no': 'Norway',
            'fi': 'Finland',
            'pl': 'Poland',
            'com.tr': 'Turkey',
            'co.th': 'Thailand'
        }
        return region_map.get(tld, '')
    
    def get_voices(self) -> Dict:
        """Get available voices for API response"""
        if not self.is_initialized:
            return {
                'success': False,
                'error': 'Google TTS service not initialized',
                'voices': []
            }
        
        return {
            'success': True,
            'voices': self.available_voices,
            'default_voice': self.available_voices[0] if self.available_voices else None,
            'engine': 'Google Text-to-Speech',
            'quality': 'high'
        }
    


    def text_to_speech_file(self, text: str, output_path: str, 
                          rate: Optional[int] = None,
                          volume: Optional[float] = None,
                          voice_id: Optional[str] = None) -> Tuple[bool, str]:
        """Convert text to speech using Google TTS and save as audio file"""
        if not text or not text.strip():
            return False, "No text provided"
        
        if not self.is_initialized:
            return False, "Google TTS service not initialized"
        
        try:
            from gtts import gTTS
            import pygame
            from pydub import AudioSegment
            from pydub.effects import speedup
            
            # Parse voice_id to get language and TLD
            language = 'en'
            tld = 'com'
            
            if voice_id and voice_id != 'default':
                # Find the voice in available voices
                selected_voice = None
                for voice in self.available_voices:
                    if voice['id'] == voice_id or str(voice['index']) == str(voice_id):
                        selected_voice = voice
                        break
                
                if selected_voice:
                    language = selected_voice['language']
                    tld = selected_voice['tld']
                    print(f"🎤 Using voice: {selected_voice['name']} ({language}-{tld})")
                else:
                    print(f"⚠️  Voice {voice_id} not found, using default")
            
            # Ensure output directory exists
            output_dir = os.path.dirname(output_path)
            if output_dir:
                os.makedirs(output_dir, exist_ok=True)
            
            print(f"🔊 Converting text to speech with Google TTS...")
            print(f"📝 Text length: {len(text)} characters")
            print(f"🌍 Language: {language}, TLD: {tld}")
            
            # Create gTTS object
            tts = gTTS(text=text, lang=language, tld=tld, slow=False)
            
            # Save to a temporary MP3 file first
            temp_mp3 = output_path.replace('.wav', '_temp.mp3')
            tts.save(temp_mp3)
            print(f"✅ Google TTS generated MP3 file")
            
            # Convert MP3 to WAV and apply rate/volume adjustments
            try:
                # Load the MP3 file
                audio = AudioSegment.from_mp3(temp_mp3)
                
                # Apply rate adjustment (speed change)
                if rate and rate != 200:
                    # Calculate speed multiplier (200 WPM is baseline)
                    speed_multiplier = rate / 200.0
                    speed_multiplier = max(0.5, min(2.0, speed_multiplier))  # Limit to reasonable range
                    
                    if speed_multiplier != 1.0:
                        audio = speedup(audio, playback_speed=speed_multiplier)
                        print(f"🎛️  Applied speed adjustment: {speed_multiplier}x")
                
                # Apply volume adjustment
                if volume and volume != 0.9:
                    # Convert volume (0.0-1.0) to dB change
                    volume_db = 20 * (volume - 0.9)  # 0.9 is baseline
                    volume_db = max(-20, min(20, volume_db))  # Limit to reasonable range
                    
                    if abs(volume_db) > 0.1:
                        audio = audio + volume_db
                        print(f"🔊 Applied volume adjustment: {volume_db:.1f}dB")
                
                # Export as WAV
                audio.export(output_path, format="wav")
                print(f"✅ Converted to WAV format")
                
                # Clean up temporary MP3 file
                if os.path.exists(temp_mp3):
                    os.remove(temp_mp3)
                
            except ImportError as import_error:
                print(f"⚠️  Audio processing libraries not available: {import_error}")
                print("🔄 Using basic MP3 to WAV conversion...")
                
                # Fallback: simple conversion without rate/volume adjustment
                try:
                    import subprocess
                    # Try using ffmpeg if available
                    subprocess.run([
                        'ffmpeg', '-i', temp_mp3, '-acodec', 'pcm_s16le', 
                        '-ar', '22050', '-ac', '1', output_path, '-y'
                    ], check=True, capture_output=True)
                    print(f"✅ Converted using ffmpeg")
                    
                    # Clean up temporary MP3 file
                    if os.path.exists(temp_mp3):
                        os.remove(temp_mp3)
                        
                except (subprocess.CalledProcessError, FileNotFoundError):
                    # If ffmpeg not available, just rename MP3 to WAV (not ideal but works)
                    print("⚠️  ffmpeg not available, keeping as MP3 format")
                    if os.path.exists(temp_mp3):
                        os.rename(temp_mp3, output_path.replace('.wav', '.mp3'))
                        output_path = output_path.replace('.wav', '.mp3')
            
            # Verify file was created
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                file_size = os.path.getsize(output_path)
                print(f"📄 Generated high-quality audio file: {file_size} bytes")
                return True, "Success"
            else:
                return False, "Audio file was not created or is empty"
                
        except ImportError as e:
            error_msg = f"Google TTS library not available: {str(e)}"
            print(f"❌ {error_msg}")
            return False, error_msg
        except Exception as e:
            error_msg = f"Google TTS conversion failed: {str(e)}"
            print(f"❌ {error_msg}")
            return False, error_msg
    
    def preview_speech(self, text: str, 
                      rate: Optional[int] = None,
                      volume: Optional[float] = None,
                      voice_id: Optional[str] = None) -> Tuple[bool, str]:
        """Preview text-to-speech using Google TTS (server-side note)"""
        if not text or not text.strip():
            return False, "No text provided"
        
        if not self.is_initialized:
            return False, "Google TTS service not initialized"
        
        # For server environments, we can't actually play audio
        # So we'll just validate the text and return success
        try:
            # Limit preview text length
            if len(text) > 500:
                return False, "Preview text too long (max 500 characters)"
            
            # Parse voice_id to validate it exists
            if voice_id and voice_id != 'default':
                voice_found = False
                for voice in self.available_voices:
                    if voice['id'] == voice_id or str(voice['index']) == str(voice_id):
                        voice_found = True
                        print(f"🎤 Preview would use voice: {voice['name']}")
                        break
                
                if not voice_found:
                    print(f"⚠️  Voice {voice_id} not found, would use default")
            
            print(f"🎵 Preview validated for {len(text)} characters")
            print(f"ℹ️  Note: Server-side preview - audio would be generated with these settings")
            
            return True, "Preview validated successfully (server environment - no audio playback)"
            
        except Exception as e:
            error_msg = f"Preview validation failed: {str(e)}"
            print(f"❌ {error_msg}")
            return False, error_msg
    
    def get_supported_formats(self) -> List[str]:
        """Get supported output audio formats"""
        return ['wav', 'mp3']  # Google TTS supports both
    
    def health_check(self) -> Dict:
        """Check Google TTS service health"""
        if not self.is_initialized:
            # Check if gTTS can be imported
            try:
                from gtts import gTTS
                gtts_available = True
                gtts_error = None
            except ImportError as e:
                gtts_available = False
                gtts_error = str(e)
            
            return {
                'initialized': False,
                'gtts_available': gtts_available,
                'gtts_error': gtts_error,
                'voices_available': 0,
                'supported_formats': self.get_supported_formats(),
                'mode': 'unavailable'
            }
        
        # Test internet connectivity for Google TTS
        internet_available = self._test_internet_connection()
        
        return {
            'initialized': self.is_initialized,
            'gtts_available': True,
            'internet_available': internet_available,
            'voices_available': len(self.available_voices),
            'supported_formats': self.get_supported_formats(),
            'languages_supported': len(self.supported_languages),
            'mode': 'google_tts',
            'quality': 'high'
        }
    
    def _test_internet_connection(self) -> bool:
        """Test if internet connection is available for Google TTS"""
        try:
            import urllib.request
            urllib.request.urlopen('https://translate.google.com', timeout=5)
            return True
        except:
            return False

# Global TTS service instance
tts_service = TTSService()