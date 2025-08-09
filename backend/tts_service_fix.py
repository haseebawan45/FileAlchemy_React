#!/usr/bin/env python3
"""
Quick fix for TTS voice selection issues
"""

# Simple patch to disable problematic voice selection
def patch_voice_selection():
    """Temporarily disable voice selection to get TTS working"""
    import sys
    import os
    
    # Add current directory to path
    sys.path.insert(0, os.path.dirname(__file__))
    
    try:
        from tts_service import tts_service
        
        # Override the voice setting methods to be more robust
        original_set_voice = tts_service.set_voice_properties
        
        def safe_set_voice_properties(rate=None, volume=None, voice_id=None):
            """Safer voice property setting"""
            if not tts_service.is_initialized or not tts_service.engine:
                return False
            
            try:
                if rate is not None:
                    tts_service.engine.setProperty('rate', max(50, min(400, rate)))
                
                if volume is not None:
                    tts_service.engine.setProperty('volume', max(0.0, min(1.0, volume)))
                
                # Skip voice setting for now
                print(f"ℹ️  Skipping voice selection (using default voice)")
                
                return True
            except Exception as e:
                print(f"Warning: Could not set properties: {e}")
                return False
        
        # Apply the patch
        tts_service.set_voice_properties = safe_set_voice_properties
        print("✅ Applied TTS voice selection patch")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to apply TTS patch: {e}")
        return False

if __name__ == "__main__":
    patch_voice_selection()