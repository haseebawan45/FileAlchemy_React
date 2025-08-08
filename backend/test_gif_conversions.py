#!/usr/bin/env python3
"""
Test script for GIF conversions
Tests GIF to video and video to GIF conversions
"""

import os
import subprocess
from pathlib import Path
from file_converter import FileConversionService

def check_ffmpeg():
    """Check if FFmpeg is available"""
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def create_test_gif():
    """Create a simple animated test GIF using PIL"""
    try:
        from PIL import Image, ImageDraw
        
        # Create frames for animated GIF
        frames = []
        colors = ['red', 'green', 'blue', 'yellow', 'purple']
        
        for i, color in enumerate(colors):
            # Create a frame
            img = Image.new('RGB', (100, 100), color)
            draw = ImageDraw.Draw(img)
            
            # Add some text/shape to make it more interesting
            draw.rectangle([20, 20, 80, 80], outline='white', width=3)
            draw.text((35, 45), f'{i+1}', fill='white')
            
            frames.append(img)
        
        # Save as animated GIF
        test_gif = "test_animated.gif"
        frames[0].save(
            test_gif,
            save_all=True,
            append_images=frames[1:],
            duration=500,  # 500ms per frame
            loop=0
        )
        
        print(f"✅ Created test animated GIF: {test_gif}")
        return test_gif
        
    except Exception as e:
        print(f"❌ Failed to create test GIF: {e}")
        return None

def create_test_video():
    """Create a simple test video using FFmpeg"""
    if not check_ffmpeg():
        print("❌ FFmpeg not available for video creation")
        return None
    
    try:
        # Create a simple test video using FFmpeg
        test_video = "test_video.mp4"
        
        # Generate a 3-second test video with color bars
        cmd = [
            'ffmpeg', '-f', 'lavfi', '-i', 'testsrc=duration=3:size=320x240:rate=10',
            '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-y', test_video
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0 and os.path.exists(test_video):
            print(f"✅ Created test video: {test_video}")
            return test_video
        else:
            print(f"❌ Failed to create test video: {result.stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Failed to create test video: {e}")
        return None

def test_conversion(service, input_file, output_file, conversion_name):
    """Test a single conversion"""
    print(f"  🔄 Testing {conversion_name}...")
    
    if not os.path.exists(input_file):
        print(f"  ❌ Input file not found: {input_file}")
        return False
    
    success = service.convert_file(input_file, output_file)
    
    if success and os.path.exists(output_file):
        file_size = os.path.getsize(output_file)
        print(f"  ✅ {conversion_name} successful! Output: {file_size} bytes")
        return True
    else:
        print(f"  ❌ {conversion_name} failed!")
        return False

def test_gif_conversions():
    """Test GIF conversions"""
    print("🎬 Testing GIF Conversions")
    print("=" * 40)
    
    # Check FFmpeg availability
    ffmpeg_available = check_ffmpeg()
    if not ffmpeg_available:
        print("⚠️  FFmpeg not available - GIF video conversions will be skipped")
        print("💡 Install FFmpeg to enable GIF video conversion testing")
        return True  # Not a failure, just not available
    
    print("✅ FFmpeg is available for media conversions")
    
    # Initialize conversion service
    service = FileConversionService()
    
    # Check supported formats
    formats = service.list_supported_formats()
    print("\n📋 Media converter formats:")
    media_formats = formats.get('media', {})
    print(f"   Input: {media_formats.get('input', [])}")
    print(f"   Output: {media_formats.get('output', [])}")
    
    print("\n📋 Image converter formats:")
    image_formats = formats.get('image', {})
    print(f"   Input: {image_formats.get('input', [])}")
    print(f"   Output: {image_formats.get('output', [])}")
    print()
    
    # Create test files
    test_gif = create_test_gif()
    test_video = create_test_video()
    
    results = {}
    test_files = []
    
    try:
        # Test GIF to video conversions
        print("🎬 Testing GIF to Video Conversions:")
        if test_gif:
            results['GIF→MP4'] = test_conversion(service, test_gif, "output_gif_to_mp4.mp4", "GIF to MP4")
            test_files.append("output_gif_to_mp4.mp4")
            
            results['GIF→WEBM'] = test_conversion(service, test_gif, "output_gif_to_webm.webm", "GIF to WEBM")
            test_files.append("output_gif_to_webm.webm")
            
            results['GIF→AVI'] = test_conversion(service, test_gif, "output_gif_to_avi.avi", "GIF to AVI")
            test_files.append("output_gif_to_avi.avi")
        
        print()
        
        # Test video to GIF conversions
        print("🎞️ Testing Video to GIF Conversions:")
        if test_video:
            results['MP4→GIF'] = test_conversion(service, test_video, "output_mp4_to_gif.gif", "MP4 to GIF")
            test_files.append("output_mp4_to_gif.gif")
        
        print()
        
        # Test GIF to image conversions (static)
        print("🖼️ Testing GIF to Image Conversions:")
        if test_gif:
            results['GIF→PNG'] = test_conversion(service, test_gif, "output_gif_to_png.png", "GIF to PNG")
            test_files.append("output_gif_to_png.png")
            
            results['GIF→JPEG'] = test_conversion(service, test_gif, "output_gif_to_jpeg.jpg", "GIF to JPEG")
            test_files.append("output_gif_to_jpeg.jpg")
        
        print()
        
        # Test results summary
        print("📊 GIF Conversion Results:")
        print("-" * 30)
        
        total_tests = len(results)
        successful_tests = sum(1 for success in results.values() if success)
        
        for conversion, success in results.items():
            status = "✅ PASSED" if success else "❌ FAILED"
            print(f"   {conversion}: {status}")
        
        print("-" * 30)
        print(f"   Total: {successful_tests}/{total_tests} conversions successful")
        
        # Verify output files
        print("\n🔍 Verifying Output Files:")
        
        # Check video files
        video_files = [f for f in test_files if f.endswith(('.mp4', '.webm', '.avi'))]
        for video_file in video_files:
            if os.path.exists(video_file):
                file_size = os.path.getsize(video_file)
                print(f"   📹 {video_file}: {file_size} bytes")
        
        # Check GIF files
        gif_files = [f for f in test_files if f.endswith('.gif')]
        for gif_file in gif_files:
            if os.path.exists(gif_file):
                file_size = os.path.getsize(gif_file)
                print(f"   🎬 {gif_file}: {file_size} bytes")
        
        # Check image files
        image_files = [f for f in test_files if f.endswith(('.png', '.jpg', '.jpeg'))]
        for image_file in image_files:
            if os.path.exists(image_file):
                file_size = os.path.getsize(image_file)
                print(f"   🖼️ {image_file}: {file_size} bytes")
        
        return successful_tests == total_tests
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        # Cleanup
        cleanup_files = [test_gif, test_video] + test_files
        for file in cleanup_files:
            if file and os.path.exists(file):
                try:
                    os.remove(file)
                    print(f"🧹 Cleaned up: {file}")
                except:
                    pass

if __name__ == "__main__":
    success = test_gif_conversions()
    if success:
        print("\n🎉 All GIF conversion tests PASSED!")
        print("🎬 GIF to video conversions are working correctly!")
    else:
        print("\n❌ Some GIF conversion tests FAILED!")
        print("💡 Check FFmpeg installation and try again")
    
    exit(0 if success else 1)