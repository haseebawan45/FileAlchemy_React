import React, { useState, useEffect } from 'react';
import ttsService from '../services/ttsService';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import firestoreService from '../services/firestoreService';
import './TTSPage.css';

const TTSPage = ({ onBack, onNavigate }) => {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [rate, setRate] = useState(200);
  const [volume, setVolume] = useState(0.9);
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [result, setResult] = useState(null);
  const [serviceHealth, setServiceHealth] = useState(null);
  const [recentConversions, setRecentConversions] = useState([]);
  
  const { dispatch, actions } = useApp();
  const { user } = useAuth();

  // Helper function to add notifications
  const addNotification = (type, message) => {
    dispatch({
      type: actions.ADD_NOTIFICATION,
      payload: {
        type,
        title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
        message
      }
    });
  };

  // Load voices and health status on component mount
  useEffect(() => {
    loadVoices();
    checkServiceHealth();
    loadUserPreferences();
  }, []);

  // Reload preferences when user changes (login/logout)
  useEffect(() => {
    if (user !== undefined) { // Only run when user state is determined
      loadUserPreferences();
    }
  }, [user]);

  // Save user preferences to Firebase (for authenticated users only)
  useEffect(() => {
    const savePreferences = async () => {
      if (!user) return; // Don't save preferences for anonymous users

      const preferences = {
        selectedVoice,
        rate,
        volume,
        lastUpdated: new Date().toISOString()
      };

      try {
        await firestoreService.saveTTSPreferences(user.uid, preferences);
      } catch (error) {
        console.error('Error saving TTS preferences to Firebase:', error);
      }
    };

    // Only save if we have meaningful values and user is authenticated
    if (user && (selectedVoice || rate !== 200 || volume !== 0.9)) {
      savePreferences();
    }
  }, [selectedVoice, rate, volume, user]);

  const loadUserPreferences = async () => {
    try {
      // Reset to defaults for anonymous users
      if (!user) {
        setRate(200);
        setVolume(0.9);
        setSelectedVoice('');
        setRecentConversions([]);
        return;
      }

      // Load from Firebase for authenticated users only
      try {
        const ttsPrefsResult = await firestoreService.getTTSPreferences(user.uid);
        if (ttsPrefsResult.success) {
          const preferences = ttsPrefsResult.data;
          if (preferences.rate) setRate(preferences.rate);
          if (preferences.volume) setVolume(preferences.volume);
          // selectedVoice will be set after voices are loaded
          if (preferences.selectedVoice) {
            setTimeout(() => setSelectedVoice(preferences.selectedVoice), 100);
          }
        }

        // Load recent TTS conversions
        const historyResult = await firestoreService.getTTSConversionHistory(user.uid, 5);
        if (historyResult.success) {
          setRecentConversions(historyResult.data);
        }
      } catch (error) {
        console.error('Error loading from Firebase:', error);
      }

    } catch (error) {
      console.error('Error loading TTS preferences:', error);
    }
  };

  const addToRecentConversions = async (conversionData) => {
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const selectedVoiceObj = voices.find(v => v.id === selectedVoice || v.index.toString() === selectedVoice);
    
    const newConversion = {
      id: Date.now(),
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      wordCount,
      voice: selectedVoiceObj?.name || 'Default',
      rate,
      volume,
      timestamp: new Date().toLocaleString(),
      filename: conversionData.filename,
      size: conversionData.size
    };

    // Update local state immediately (session-only for anonymous users)
    const updated = [newConversion, ...recentConversions.slice(0, 4)];
    setRecentConversions(updated);

    if (user) {
      // Save to Firebase as a conversion record for authenticated users only
      try {
        const conversionRecord = {
          category: 'tts',
          sourceFormat: 'TEXT',
          targetFormat: 'WAV',
          files: [{
            name: 'text-input.txt',
            size: text.length
          }],
          success: true,
          successfulFiles: 1,
          failedFiles: 0,
          startTime: new Date(),
          endTime: new Date(),
          processingTimeMs: 1000, // Estimated
          backendUsed: 'api',
          
          // TTS-specific data
          originalText: text,
          wordCount,
          voiceName: selectedVoiceObj?.name || 'Default',
          voiceId: selectedVoice,
          speechRate: rate,
          speechVolume: volume,
          outputFileName: conversionData.filename,
          outputFileSize: conversionData.size
        };

        await firestoreService.saveConversionRecord(conversionRecord, user.uid);
      } catch (error) {
        console.error('Error saving TTS conversion to Firebase:', error);
      }
    }
    // Anonymous users: no persistence, session-only recent conversions
  };

  const loadVoices = async () => {
    try {
      setIsLoading(true);
      const voicesData = await ttsService.getVoices();
      
      if (voicesData.success && voicesData.voices) {
        setVoices(voicesData.voices);
        // Set default voice if available
        if (voicesData.default_voice) {
          setSelectedVoice(voicesData.default_voice.id || voicesData.default_voice.index?.toString() || '0');
        }
      } else {
        addNotification('warning', voicesData.error || 'No voices available');
      }
    } catch (error) {
      console.error('Error loading voices:', error);
      addNotification('error', 'Failed to load TTS voices');
    } finally {
      setIsLoading(false);
    }
  };

  const checkServiceHealth = async () => {
    try {
      const health = await ttsService.getHealthStatus();
      setServiceHealth(health);
    } catch (error) {
      console.error('Error checking TTS health:', error);
      setServiceHealth({ success: false, error: error.message });
    }
  };

  const handlePreview = async () => {
    const validation = ttsService.validateText(text);
    if (!validation.valid) {
      addNotification('error', validation.error);
      return;
    }

    if (validation.text.length > 500) {
      addNotification('error', 'Preview text too long (max 500 characters)');
      return;
    }

    const optionsValidation = ttsService.validateOptions({
      rate,
      volume,
      voice_id: selectedVoice
    });

    if (!optionsValidation.valid) {
      addNotification('error', optionsValidation.errors.join(', '));
      return;
    }

    try {
      setIsPreviewing(true);
      await ttsService.previewSpeech(validation.text, optionsValidation.options);
      addNotification('success', 'Speech preview completed');
    } catch (error) {
      console.error('Preview error:', error);
      addNotification('error', error.message || 'Preview failed');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleConvert = async () => {
    const validation = ttsService.validateText(text);
    if (!validation.valid) {
      addNotification('error', validation.error);
      return;
    }

    const optionsValidation = ttsService.validateOptions({
      rate,
      volume,
      voice_id: selectedVoice
    });

    if (!optionsValidation.valid) {
      addNotification('error', optionsValidation.errors.join(', '));
      return;
    }

    try {
      setIsConverting(true);
      setResult(null);
      
      const conversionResult = await ttsService.convertTextToSpeech(
        validation.text, 
        optionsValidation.options
      );
      
      if (conversionResult.success) {
        setResult(conversionResult);
        addToRecentConversions(conversionResult);
        const wordCount = validation.text.trim().split(/\s+/).filter(word => word.length > 0).length;
        addNotification('success', `Successfully converted ${wordCount} words to speech!`);
      } else {
        addNotification('error', conversionResult.error || 'Conversion failed');
      }
    } catch (error) {
      console.error('Conversion error:', error);
      addNotification('error', error.message || 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (result && result.filename) {
      const downloadUrl = ttsService.getDownloadUrl(result.filename);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addNotification('success', 'Download started');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getVoiceName = (voice) => {
    return voice.name || `Voice ${voice.index}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading TTS service...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Text to Speech</h1>
          <p className="text-xl text-gray-600">Convert your text into natural-sounding speech</p>
        </div>

        {/* Service Health Status */}
        {serviceHealth && !serviceHealth.success && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-700">TTS service is not available: {serviceHealth.error}</span>
            </div>
          </div>
        )}

        {/* Anonymous User Notice */}
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-700">
                You're using TTS as a guest. Voice settings and conversion history are session-only. 
                <button 
                  onClick={() => onNavigate && onNavigate('auth')} 
                  className="underline hover:no-underline ml-1"
                >
                  Sign in
                </button> to save your preferences.
              </span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Text Input */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="text-input" className="block text-sm font-medium text-gray-700">
                Text to Convert
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setText("Welcome to FileAlchemy! This is a demonstration of our text-to-speech feature. You can convert any text into natural-sounding speech with customizable voice settings.")}
                  className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                >
                  Sample Text
                </button>
                <button
                  onClick={() => setText("")}
                  className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
            <textarea
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text you want to convert to speech..."
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={10000}
            />
            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
              <div className="flex space-x-4">
                <span>{text.length}/10,000 characters</span>
                <span>{text.trim().split(/\s+/).filter(word => word.length > 0).length} words</span>
                <span>~{Math.ceil(text.trim().split(/\s+/).filter(word => word.length > 0).length / (rate / 60))}s duration</span>
              </div>
              {text.length > 500 && (
                <span className="text-amber-600">Preview limited to 500 characters</span>
              )}
            </div>
          </div>

          {/* Voice Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Voice Selection */}
            <div>
              <label htmlFor="voice-select" className="block text-sm font-medium text-gray-700 mb-2">
                Voice
              </label>
              <select
                id="voice-select"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={voices.length === 0}
              >
                {voices.length === 0 ? (
                  <option value="">No voices available</option>
                ) : (
                  voices.map((voice, index) => (
                    <option key={voice.id || index} value={voice.id || index.toString()}>
                      {getVoiceName(voice)} {voice.gender && `(${voice.gender})`}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Speech Rate */}
            <div>
              <label htmlFor="rate-slider" className="block text-sm font-medium text-gray-700 mb-2">
                Speed: {rate} WPM
              </label>
              <input
                id="rate-slider"
                type="range"
                min="50"
                max="400"
                value={rate}
                onChange={(e) => setRate(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>

            {/* Volume */}
            <div>
              <label htmlFor="volume-slider" className="block text-sm font-medium text-gray-700 mb-2">
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                id="volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Quiet</span>
                <span>Loud</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={handlePreview}
              disabled={!text.trim() || isPreviewing || voices.length === 0}
              className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isPreviewing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Playing Preview...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Preview Speech
                </>
              )}
            </button>

            <button
              onClick={handleConvert}
              disabled={!text.trim() || isConverting || voices.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isConverting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Converting {text.trim().split(/\s+/).filter(word => word.length > 0).length} words...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Convert to Audio
                </>
              )}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-800">Conversion Successful!</h3>
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">File Size:</span>
                  <span className="ml-2 font-medium">{formatFileSize(result.size)}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Text Length:</span>
                  <span className="ml-2 font-medium">{result.text_length} characters</span>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Audio File ({result.filename})
              </button>
            </div>
          )}

          {/* Recent Conversions */}
          {recentConversions.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Conversions</h3>
              <div className="space-y-3">
                {recentConversions.map((conversion) => (
                  <div key={conversion.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">{conversion.text}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{conversion.wordCount} words</span>
                        <span>{conversion.voice}</span>
                        <span>{conversion.rate} WPM</span>
                        <span>{Math.round(conversion.volume * 100)}% vol</span>
                        <span>{conversion.timestamp}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const downloadUrl = ttsService.getDownloadUrl(conversion.filename);
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.download = conversion.filename;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={async () => {
                  setRecentConversions([]);
                  
                  if (user) {
                    // For authenticated users, we don't delete Firebase records
                    // as they're part of the permanent conversion history
                    // We just clear the local display
                    addNotification('success', 'Recent conversions cleared from view');
                  } else {
                    // For anonymous users, just clear the session state
                    // No localStorage to clear since we don't save anything for anonymous users
                    addNotification('success', 'Recent conversions cleared');
                  }
                }}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700"
              >
                Clear History
              </button>
            </div>
          )}

          {/* Service Info */}
          {serviceHealth && serviceHealth.success && (
            <div className="mt-6 text-sm text-gray-500 text-center">
              TTS Service: {serviceHealth.health?.voices_available || 0} voices available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TTSPage;