/**
 * Text-to-Speech Service
 * Handles communication with the TTS API endpoints
 */

import { API_BASE_URL } from '../config/api';

class TTSService {
  constructor() {
    this.baseUrl = API_BASE_URL.replace('/api', ''); // Remove /api suffix since endpoints include it
  }

  /**
   * Get available TTS voices
   */
  async getVoices() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tts/voices`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get voices');
      }
      
      return data;
    } catch (error) {
      console.error('Error getting TTS voices:', error);
      throw error;
    }
  }

  /**
   * Convert text to speech audio file
   */
  async convertTextToSpeech(text, options = {}) {
    try {
      const requestData = {
        text: text.trim(),
        ...options
      };

      const response = await fetch(`${this.baseUrl}/api/tts/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to convert text to speech');
      }
      
      return data;
    } catch (error) {
      console.error('Error converting text to speech:', error);
      throw error;
    }
  }

  /**
   * Preview text-to-speech (server-side playback)
   */
  async previewSpeech(text, options = {}) {
    try {
      const requestData = {
        text: text.trim(),
        ...options
      };

      const response = await fetch(`${this.baseUrl}/api/tts/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to preview speech');
      }
      
      return data;
    } catch (error) {
      console.error('Error previewing speech:', error);
      throw error;
    }
  }

  /**
   * Get TTS service health status
   */
  async getHealthStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tts/health`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get TTS health status');
      }
      
      return data;
    } catch (error) {
      console.error('Error getting TTS health status:', error);
      throw error;
    }
  }

  /**
   * Download audio file
   */
  getDownloadUrl(filename) {
    return `${this.baseUrl}/api/download/${filename}`;
  }

  /**
   * Validate text input
   */
  validateText(text) {
    if (!text || typeof text !== 'string') {
      return { valid: false, error: 'Text is required' };
    }

    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      return { valid: false, error: 'Text cannot be empty' };
    }

    if (trimmedText.length > 10000) {
      return { valid: false, error: 'Text is too long (max 10,000 characters)' };
    }

    return { valid: true, text: trimmedText };
  }

  /**
   * Validate TTS options
   */
  validateOptions(options) {
    const validated = {};
    const errors = [];

    if (options.rate !== undefined) {
      const rate = parseInt(options.rate);
      if (isNaN(rate) || rate < 50 || rate > 400) {
        errors.push('Rate must be between 50 and 400 words per minute');
      } else {
        validated.rate = rate;
      }
    }

    if (options.volume !== undefined) {
      const volume = parseFloat(options.volume);
      if (isNaN(volume) || volume < 0.0 || volume > 1.0) {
        errors.push('Volume must be between 0.0 and 1.0');
      } else {
        validated.volume = volume;
      }
    }

    if (options.voice_id !== undefined && options.voice_id !== '') {
      validated.voice_id = options.voice_id;
    }

    return {
      valid: errors.length === 0,
      options: validated,
      errors
    };
  }
}

export default new TTSService();