#!/usr/bin/env python3
"""
Test script to verify eSpeak installation and TTS functionality
"""

import sys
import os
import subprocess
import platform

def test_espeak_installation():
    """Test if eSpeak is properly installed"""
    print("🧪 Testing eSpeak Installation...")
    
    try:
        # Test eSpeak command line
        result = subprocess.run(['espeak', '--version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print(f"✅ eSpeak installed: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ eSpeak command failed: {result.stderr}")
            return False
    except FileNotFoundError:
        print("❌ eSpeak not found in PATH")
        return False
    except subprocess.TimeoutExpired:
        print("❌ eSpeak command timed out")
        return False
    except Exception as e:
        print(f"❌ Error testing eSpeak: {e}")
        return False

def test_espeak_voices():
    """Test available eSpeak voices"""
    print("\n🎤 Testing eSpeak Voices...")
    
    try:
        result = subprocess.run(['espeak', '--voices'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')
            print(f"✅ Found {len(lines)-1} eSpeak voices:")
            for line in lines[1:6]:  # Show first 5 voices
                print(f"   {line}")
            if len(lines) > 6:
                print(f"   ... and {len(lines)-6} more voices")
            return True
        else:
            print(f"❌ Could not list eSpeak voices: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error listing eSpeak voices: {e}")
        return False

def test_espeak_synthesis():
    """Test eSpeak text synthesis"""
    print("\n🔊 Testing eSpeak Text Synthesis...")
    
    try:
        # Test basic synthesis to file
        test_text = "Hello from FileAlchemy TTS test"
        output_file = "/tmp/espeak_test.wav"
        
        result = subprocess.run([
            'espeak', 
            '-w', output_file,  # Write to WAV file
            '-s', '150',        # Speed (words per minute)
            test_text
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            if os.path.exists(output_file) and os.path.getsize(output_file) > 0:
                file_size = os.path.getsize(output_file)
                print(f"✅ eSpeak synthesis successful: {file_size} bytes")
                # Clean up test file
                os.remove(output_file)
                return True
            else:
                print("❌ eSpeak created empty or no output file")
                return False
        else:
            print(f"❌ eSpeak synthesis failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error testing eSpeak synthesis: {e}")
        return False

def test_pyttsx3_integration():
    """Test pyttsx3 with eSpeak"""
    print("\n🐍 Testing pyttsx3 Integration...")
    
    try:
        import pyttsx3
        
        # Try to initialize with espeak driver
        engine = pyttsx3.init(driverName='espeak')
        print("✅ pyttsx3 initialized with eSpeak driver")
        
        # Test getting voices
        voices = engine.getProperty('voices')
        if voices:
            print(f"✅ Found {len(voices)} voices via pyttsx3:")
            for i, voice in enumerate(voices[:3]):  # Show first 3
                print(f"   Voice {i}: {voice.name} (ID: {voice.id})")
        else:
            print("⚠️  No voices found via pyttsx3")
        
        # Test basic properties
        rate = engine.getProperty('rate')
        volume = engine.getProperty('volume')
        print(f"✅ Engine properties - Rate: {rate}, Volume: {volume}")
        
        # Test synthesis to file
        test_text = "Testing pyttsx3 with eSpeak integration"
        output_file = "/tmp/pyttsx3_test.wav"
        
        engine.save_to_file(test_text, output_file)
        engine.runAndWait()
        
        if os.path.exists(output_file) and os.path.getsize(output_file) > 0:
            file_size = os.path.getsize(output_file)
            print(f"✅ pyttsx3 synthesis successful: {file_size} bytes")
            os.remove(output_file)
        else:
            print("❌ pyttsx3 created empty or no output file")
            return False
        
        engine.stop()
        return True
        
    except ImportError:
        print("❌ pyttsx3 not installed")
        return False
    except Exception as e:
        print(f"❌ pyttsx3 integration error: {e}")
        return False

def main():
    print("🚀 eSpeak and TTS Integration Test")
    print("=" * 50)
    print(f"Platform: {platform.system()} {platform.release()}")
    print(f"Python: {sys.version}")
    
    tests = [
        ("eSpeak Installation", test_espeak_installation),
        ("eSpeak Voices", test_espeak_voices),
        ("eSpeak Synthesis", test_espeak_synthesis),
        ("pyttsx3 Integration", test_pyttsx3_integration)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    
    all_passed = True
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {status}: {test_name}")
        if not result:
            all_passed = False
    
    if all_passed:
        print("\n🎉 All tests passed! TTS should work correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
        print("\n💡 Installation help:")
        print("   Ubuntu/Debian: sudo apt-get install espeak espeak-data libespeak1")
        print("   CentOS/RHEL: sudo yum install espeak espeak-devel")
        print("   Alpine: apk add espeak espeak-dev")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)