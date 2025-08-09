#!/usr/bin/env python3
"""
Text-to-Speech Service for FileAlchemy
Provides TTS functionality using pyttsx3
"""

import os
import uuid
import tempfile
import threading
import time
import signal
import platform
from pathlib import Path
import pyttsx3
from typing import Dict, List, Optional, Tuple

# Set up audio environment for Linux servers
if platform.system() == 'Linux':
    # Set PULSE_RUNTIME_PATH to avoid pulseaudio warnings
    os.environ.setdefault('PULSE_RUNTIME_PATH', '/tmp/pulse-runtime')
    # Set ALSA_CARD to use default audio device
    os.environ.setdefault('ALSA_CARD', '0')
    # Disable audio output for headless servers
    os.environ.setdefault('SDL_AUDIODRIVER', 'dummy')

class TTSService:
    def __init__(self):
        self.engine = None
        self.available_voices = []
        self.is_initialized = False
        self.lock = threading.Lock()
        self._initialize_engine()
    
    def _initialize_engine(self):
        """Initialize the TTS engine with error handling"""
        try:
            with self.lock:
                # Try different initialization strategies based on platform
                if platform.system() == 'Linux':
                    # Strategy 1: Try espeak driver explicitly
                    try:
                        self.engine = pyttsx3.init(driverName='espeak')
                        print("✅ TTS Engine initialized with espeak driver")
                    except Exception as espeak_error:
                        print(f"⚠️  espeak driver failed: {espeak_error}")
                        
                        # Strategy 2: Try default driver
                        try:
                            self.engine = pyttsx3.init()
                            print("✅ TTS Engine initialized with default driver")
                        except Exception as default_error:
                            print(f"⚠️  default driver failed: {default_error}")
                            
                            # Strategy 3: Force eSpeak to work by setting environment
                            try:
                                # Set environment variables to help eSpeak work
                                os.environ['ALSA_CARD'] = '0'
                                os.environ['PULSE_RUNTIME_PATH'] = '/tmp'
                                self.engine = pyttsx3.init(driverName='espeak')
                                print("✅ TTS Engine initialized with eSpeak (forced)")
                            except Exception as forced_error:
                                print(f"❌ All TTS drivers failed: {forced_error}")
                                # As last resort, create a minimal working engine
                                self.engine = None
                                raise forced_error
                else:
                    # Windows/macOS - use default driver
                    self.engine = pyttsx3.init()
                    print("✅ TTS Engine initialized successfully")
                
                # Test engine functionality
                if self.engine:
                    try:
                        # Test basic properties
                        rate = self.engine.getProperty('rate')
                        volume = self.engine.getProperty('volume')
                        print(f"📊 Engine properties - Rate: {rate}, Volume: {volume}")
                    except Exception as prop_error:
                        print(f"⚠️  Could not get engine properties: {prop_error}")
                
                self.available_voices = self._get_available_voices()
                self.is_initialized = True
                print(f"🎤 Found {len(self.available_voices)} voices")
                
        except Exception as e:
            print(f"❌ Failed to initialize TTS engine: {e}")
            if "eSpeak" in str(e) or "espeak" in str(e) or "ALSA" in str(e):
                print("💡 This appears to be an audio system issue!")
                print("💡 On Ubuntu/Debian: sudo apt-get install espeak espeak-data libespeak1")
                print("💡 For Railway deployment: Check Dockerfile includes audio dependencies")
            self.is_initialized = False
    
    def _get_available_voices(self) -> List[Dict]:
        """Get list of available voices with better Linux/eSpeak support"""
        if not self.engine:
            return []
        
        voices = []
        try:
            engine_voices = self.engine.getProperty('voices')
            if engine_voices:
                for i, voice in enumerate(engine_voices):
                    # Handle different voice object structures
                    voice_id = getattr(voice, 'id', f'voice_{i}')
                    voice_name = getattr(voice, 'name', f'Voice {i}')
                    
                    # Clean up voice names for better display
                    if voice_name and '+' in voice_name:
                        # eSpeak voices often have format like "english+f3" or "english+m1"
                        parts = voice_name.split('+')
                        if len(parts) >= 2:
                            lang = parts[0].title()
                            variant = parts[1]
                            if 'f' in variant.lower():
                                voice_name = f"{lang} Female"
                            elif 'm' in variant.lower():
                                voice_name = f"{lang} Male"
                            else:
                                voice_name = f"{lang} {variant}"
                    
                    voices.append({
                        'id': str(voice_id),  # Ensure ID is string
                        'name': voice_name,
                        'gender': getattr(voice, 'gender', 'unknown'),
                        'age': getattr(voice, 'age', 'unknown'),
                        'languages': getattr(voice, 'languages', ['en']),
                        'index': i
                    })
                    
                    print(f"🎤 Voice {i}: {voice_name} (ID: {voice_id})")
                    
        except Exception as e:
            print(f"Warning: Could not get voice details: {e}")
            # Fallback - create a default voice entry
            voices.append({
                'id': '0',
                'name': 'Default Voice',
                'gender': 'unknown',
                'age': 'unknown',
                'languages': ['en'],
                'index': 0
            })
        
        if not voices:
            # Ultimate fallback
            voices.append({
                'id': '0',
                'name': 'System Default',
                'gender': 'unknown',
                'age': 'unknown',
                'languages': ['en'],
                'index': 0
            })
        
        return voices
    
    def get_voices(self) -> Dict:
        """Get available voices for API response"""
        if not self.is_initialized:
            return {
                'success': False,
                'error': 'TTS engine not initialized',
                'voices': []
            }
        
        return {
            'success': True,
            'voices': self.available_voices,
            'default_voice': self.available_voices[0] if self.available_voices else None
        }
    
    def get_engine_properties(self) -> Dict:
        """Get current engine properties"""
        if not self.is_initialized or not self.engine:
            return {}
        
        try:
            voice_obj = self.engine.getProperty('voice')
            # Convert voice object to string to avoid JSON serialization issues
            voice_str = str(voice_obj) if voice_obj else 'default'
            
            return {
                'rate': self.engine.getProperty('rate'),
                'volume': self.engine.getProperty('volume'),
                'voice': voice_str
            }
        except Exception as e:
            print(f"Warning: Could not get engine properties: {e}")
            return {}
    
    def set_voice_properties(self, rate: Optional[int] = None, 
                           volume: Optional[float] = None, 
                           voice_id: Optional[str] = None) -> bool:
        """Set voice properties with better error handling"""
        if not self.is_initialized or not self.engine:
            return False
        
        try:
            with self.lock:
                if rate is not None:
                    # Typical range: 100-300 words per minute
                    rate = max(50, min(400, rate))
                    try:
                        self.engine.setProperty('rate', rate)
                    except Exception as e:
                        print(f"Warning: Could not set rate to {rate}: {e}")
                
                if volume is not None:
                    # Volume range: 0.0 to 1.0
                    volume = max(0.0, min(1.0, volume))
                    try:
                        self.engine.setProperty('volume', volume)
                    except Exception as e:
                        print(f"Warning: Could not set volume to {volume}: {e}")
                
                # Temporarily disable voice selection to fix eSpeak issues
                if False:  # voice_id is not None and voice_id != '' and voice_id != 'default':
                    try:
                        voices = self.engine.getProperty('voices')
                        if voices:
                            voice_set = False
                            
                            # Try to find voice by ID first
                            for voice in voices:
                                if voice.id == voice_id:
                                    self.engine.setProperty('voice', voice.id)
                                    voice_set = True
                                    print(f"✅ Set voice to: {voice.name}")
                                    break
                            
                            # If not found by ID, try by index
                            if not voice_set:
                                try:
                                    voice_index = int(voice_id)
                                    if 0 <= voice_index < len(voices):
                                        self.engine.setProperty('voice', voices[voice_index].id)
                                        voice_set = True
                                        print(f"✅ Set voice by index {voice_index}: {voices[voice_index].name}")
                                except (ValueError, IndexError):
                                    pass
                            
                            # If still not set, try to find a working voice
                            if not voice_set and voices:
                                for i, voice in enumerate(voices):
                                    try:
                                        self.engine.setProperty('voice', voice.id)
                                        print(f"✅ Fallback to voice {i}: {voice.name}")
                                        voice_set = True
                                        break
                                    except Exception as voice_error:
                                        print(f"⚠️  Voice {i} failed: {voice_error}")
                                        continue
                            
                            if not voice_set:
                                print(f"⚠️  Could not set any voice, using default")
                        else:
                            print(f"⚠️  No voices available")
                    except Exception as e:
                        print(f"Warning: Could not set voice {voice_id}: {e}")
            
            return True
        except Exception as e:
            print(f"Error setting voice properties: {e}")
            return False
    
    def _run_with_timeout(self, func, timeout=30):
        """Run a function with timeout to prevent hanging"""
        result = [None]
        exception = [None]
        
        def target():
            try:
                result[0] = func()
            except Exception as e:
                exception[0] = e
        
        thread = threading.Thread(target=target)
        thread.daemon = True
        thread.start()
        thread.join(timeout)
        
        if thread.is_alive():
            # Thread is still running, timeout occurred
            return False, "Operation timed out"
        
        if exception[0]:
            raise exception[0]
        
        return True, result[0]

    def text_to_speech_file(self, text: str, output_path: str, 
                          rate: Optional[int] = None,
                          volume: Optional[float] = None,
                          voice_id: Optional[str] = None) -> Tuple[bool, str]:
        """Convert text to speech and save as audio file"""
        if not text or not text.strip():
            return False, "No text provided"
        
        def conversion_task():
            # Create a fresh engine instance for this conversion to avoid hanging
            temp_engine = None
            try:
                print(f"🔊 Creating TTS engine for conversion: {output_path}")
                
                # Try to initialize engine with same strategy as main engine
                if platform.system() == 'Linux':
                    try:
                        temp_engine = pyttsx3.init(driverName='espeak')
                        print("✅ Using eSpeak driver for conversion")
                    except Exception as espeak_error:
                        print(f"⚠️  eSpeak driver failed: {espeak_error}")
                        try:
                            temp_engine = pyttsx3.init()
                            print("✅ Using default driver for conversion")
                        except Exception as default_error:
                            print(f"❌ All drivers failed: {default_error}")
                            raise default_error
                else:
                    temp_engine = pyttsx3.init()
                
                # Set properties
                if rate is not None:
                    temp_engine.setProperty('rate', max(50, min(400, rate)))
                else:
                    temp_engine.setProperty('rate', 200)  # Default rate
                
                if volume is not None:
                    temp_engine.setProperty('volume', max(0.0, min(1.0, volume)))
                else:
                    temp_engine.setProperty('volume', 0.9)  # Default volume
                
                # Temporarily disable voice selection to fix eSpeak issues
                if False:  # voice_id is not None and voice_id != '' and voice_id != 'default':
                    try:
                        voices = temp_engine.getProperty('voices')
                        if voices:
                            voice_set = False
                            
                            # Try to find voice by ID first
                            for voice in voices:
                                if voice.id == voice_id:
                                    temp_engine.setProperty('voice', voice.id)
                                    voice_set = True
                                    break
                            
                            # If not found by ID, try by index
                            if not voice_set:
                                try:
                                    voice_index = int(voice_id)
                                    if 0 <= voice_index < len(voices):
                                        temp_engine.setProperty('voice', voices[voice_index].id)
                                        voice_set = True
                                except (ValueError, IndexError):
                                    pass
                            
                            # If still not set, use first available voice
                            if not voice_set and voices:
                                temp_engine.setProperty('voice', voices[0].id)
                    except Exception as voice_error:
                        print(f"Warning: Could not set voice {voice_id}: {voice_error}")
                        # Continue with default voice
                
                # Ensure output directory exists
                output_dir = os.path.dirname(output_path)
                if output_dir:
                    os.makedirs(output_dir, exist_ok=True)
                
                # Convert text to speech
                print(f"🎵 Saving TTS to file...")
                try:
                    temp_engine.save_to_file(text, output_path)
                    temp_engine.runAndWait()
                    print(f"✅ TTS conversion completed")
                except Exception as save_error:
                    print(f"⚠️  pyttsx3 save failed: {save_error}")
                    # Fallback to direct eSpeak command
                    print(f"🔄 Trying direct eSpeak command...")
                    import subprocess
                    try:
                        subprocess.run([
                            'espeak',
                            '-w', output_path,  # Write to WAV file
                            '-s', str(rate or 200),  # Speed
                            '-a', str(int((volume or 0.9) * 200)),  # Amplitude (0-200)
                            text
                        ], check=True, timeout=30)
                        print(f"✅ Direct eSpeak conversion completed")
                    except subprocess.CalledProcessError as cmd_error:
                        print(f"❌ Direct eSpeak failed: {cmd_error}")
                        raise cmd_error
                    except FileNotFoundError:
                        print(f"❌ eSpeak command not found")
                        raise Exception("eSpeak not available")
                    except subprocess.TimeoutExpired:
                        print(f"❌ eSpeak command timed out")
                        raise Exception("eSpeak timed out")
                
                return "Success"
                
            except Exception as e:
                print(f"❌ TTS engine error: {e}")
                raise e
            finally:
                # Clean up the temporary engine
                if temp_engine:
                    try:
                        temp_engine.stop()
                        del temp_engine
                    except:
                        pass
        
        try:
            # Run conversion with timeout
            success, result = self._run_with_timeout(conversion_task, timeout=20)
            
            if not success:
                return False, result  # result contains error message
            
            # Verify file was created
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                file_size = os.path.getsize(output_path)
                print(f"📄 Generated audio file: {file_size} bytes")
                return True, "Success"
            else:
                return False, "Audio file was not created or is empty"
                
        except Exception as e:
            error_msg = f"TTS conversion failed: {str(e)}"
            print(f"❌ {error_msg}")
            return False, error_msg
    
    def preview_speech(self, text: str, 
                      rate: Optional[int] = None,
                      volume: Optional[float] = None,
                      voice_id: Optional[str] = None) -> Tuple[bool, str]:
        """Preview text-to-speech (play directly without saving)"""
        if not text or not text.strip():
            return False, "No text provided"
        
        def preview_task():
            # Create a fresh engine instance for this preview
            temp_engine = None
            try:
                print(f"🔊 Creating TTS engine for preview")
                temp_engine = pyttsx3.init()
                
                # Set properties
                if rate is not None:
                    temp_engine.setProperty('rate', max(50, min(400, rate)))
                else:
                    temp_engine.setProperty('rate', 200)
                
                if volume is not None:
                    temp_engine.setProperty('volume', max(0.0, min(1.0, volume)))
                else:
                    temp_engine.setProperty('volume', 0.9)
                
                # Temporarily disable voice selection to fix eSpeak issues
                if False:  # voice_id is not None and voice_id != '' and voice_id != 'default':
                    try:
                        voices = temp_engine.getProperty('voices')
                        if voices:
                            voice_set = False
                            
                            # Try to find voice by ID first
                            for voice in voices:
                                if voice.id == voice_id:
                                    temp_engine.setProperty('voice', voice.id)
                                    voice_set = True
                                    break
                            
                            # If not found by ID, try by index
                            if not voice_set:
                                try:
                                    voice_index = int(voice_id)
                                    if 0 <= voice_index < len(voices):
                                        temp_engine.setProperty('voice', voices[voice_index].id)
                                        voice_set = True
                                except (ValueError, IndexError):
                                    pass
                            
                            # If still not set, use first available voice
                            if not voice_set and voices:
                                temp_engine.setProperty('voice', voices[0].id)
                    except Exception as voice_error:
                        print(f"Warning: Could not set voice {voice_id}: {voice_error}")
                        # Continue with default voice
                
                # Speak the text
                print(f"🎵 Playing speech preview...")
                temp_engine.say(text)
                temp_engine.runAndWait()
                print(f"✅ Speech preview completed")
                
                return "Speech preview completed"
                
            except Exception as e:
                print(f"❌ TTS preview error: {e}")
                raise e
            finally:
                # Clean up the temporary engine
                if temp_engine:
                    try:
                        temp_engine.stop()
                        del temp_engine
                    except:
                        pass
        
        try:
            # Run preview with timeout
            success, result = self._run_with_timeout(preview_task, timeout=15)
            
            if not success:
                return False, result  # result contains error message
            
            return True, result
                
        except Exception as e:
            error_msg = f"Speech preview failed: {str(e)}"
            print(f"❌ {error_msg}")
            return False, error_msg
    
    def get_supported_formats(self) -> List[str]:
        """Get supported output audio formats"""
        # pyttsx3 typically supports WAV format
        # Some engines may support additional formats
        return ['wav']
    
    def health_check(self) -> Dict:
        """Check TTS service health"""
        return {
            'initialized': self.is_initialized,
            'voices_available': len(self.available_voices),
            'supported_formats': self.get_supported_formats(),
            'engine_properties': self.get_engine_properties() if self.is_initialized else {}
        }

# Global TTS service instance
tts_service = TTSService()