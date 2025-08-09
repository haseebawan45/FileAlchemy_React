#!/usr/bin/env python3
"""
Test script for TTS functionality
"""

import sys
import os
sys.path.append('backend')

from tts_service import tts_service

def test_tts_service():
    print("🧪 Testing TTS Service...")
    
    # Test 1: Health check
    print("\n1. Health Check:")
    health = tts_service.health_check()
    print(f"   Initialized: {health['initialized']}")
    print(f"   Voices available: {health['voices_available']}")
    print(f"   Supported formats: {health['supported_formats']}")
    
    if not health['initialized']:
        print("❌ TTS service not initialized. Cannot continue tests.")
        return False
    
    # Test 2: Get voices
    print("\n2. Available Voices:")
    voices_data = tts_service.get_voices()
    if voices_data['success']:
        for i, voice in enumerate(voices_data['voices'][:3]):  # Show first 3 voices
            print(f"   Voice {i}: {voice.get('name', 'Unknown')} ({voice.get('gender', 'unknown')})")
        if len(voices_data['voices']) > 3:
            print(f"   ... and {len(voices_data['voices']) - 3} more voices")
    else:
        print(f"   ❌ Failed to get voices: {voices_data.get('error', 'Unknown error')}")
        return False
    
    # Test 3: Text to speech conversion
    print("\n3. Text to Speech Conversion:")
    test_text = "Hello! This is a test of the FileAlchemy text to speech system."
    output_path = "test_tts_output.wav"
    
    try:
        success, message = tts_service.text_to_speech_file(
            test_text, 
            output_path,
            rate=200,
            volume=0.8
        )
        
        if success:
            file_size = os.path.getsize(output_path) if os.path.exists(output_path) else 0
            print(f"   ✅ Conversion successful: {message}")
            print(f"   📄 Output file: {output_path}")
            print(f"   📊 File size: {file_size} bytes")
            
            # Clean up test file
            if os.path.exists(output_path):
                os.remove(output_path)
                print(f"   🧹 Cleaned up test file")
        else:
            print(f"   ❌ Conversion failed: {message}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception during conversion: {e}")
        return False
    
    print("\n✅ All TTS tests passed!")
    return True

if __name__ == "__main__":
    success = test_tts_service()
    sys.exit(0 if success else 1)