import React, { useState, useEffect } from 'react';
import ttsService from '../services/ttsService';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import firestoreService from '../services/firestoreService';
import Button from './ui/Button';
import Card from './ui/Card';
import Breadcrumb from './ui/Breadcrumb';
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
  const [voiceFilter, setVoiceFilter] = useState('all');
  
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
    // Use test text if no text is entered, otherwise use the entered text
    const testText = text.trim() || "Hello! This is a preview of the selected voice using Google's advanced text-to-speech technology.";
    
    const validation = ttsService.validateText(testText);
    if (!validation.valid) {
      addNotification('error', validation.error);
      return;
    }

    // For preview, limit to 500 characters and find a good break point
    let previewText = validation.text;
    if (validation.text.length > 500) {
      // Try to break at a sentence or word boundary
      const truncated = validation.text.substring(0, 500);
      const lastSentence = truncated.lastIndexOf('.');
      const lastSpace = truncated.lastIndexOf(' ');
      
      if (lastSentence > 400) {
        previewText = truncated.substring(0, lastSentence + 1);
      } else if (lastSpace > 400) {
        previewText = truncated.substring(0, lastSpace) + '...';
      } else {
        previewText = truncated + '...';
      }
      
      addNotification('info', `Preview limited to ${previewText.length} characters for faster testing`);
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
      await ttsService.previewSpeech(previewText, optionsValidation.options);
      const voiceName = voices.find(v => v.id === selectedVoice || v.index?.toString() === selectedVoice)?.name || 'Selected voice';
      addNotification('success', `${voiceName} preview completed`);
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

  // Group voices by language for better organization
  const getGroupedVoices = () => {
    if (!voices.length) return {};
    
    const grouped = {};
    voices.forEach(voice => {
      const language = voice.language || 'unknown';
      if (!grouped[language]) {
        grouped[language] = [];
      }
      grouped[language].push(voice);
    });
    
    return grouped;
  };

  // Get filtered voices based on selected filter
  const getFilteredVoices = () => {
    if (voiceFilter === 'all') return voices;
    return voices.filter(voice => voice.language === voiceFilter);
  };

  // Get unique languages for filter dropdown
  const getAvailableLanguages = () => {
    const languages = [...new Set(voices.map(voice => voice.language))];
    return languages.sort();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading TTS service...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { 
              label: 'Home', 
              icon: '🏠', 
              onClick: onBack 
            },
            { 
              label: 'Text to Speech',
              icon: '🎤'
            }
          ]} 
        />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
              <span className="text-2xl">🎤</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Text to Speech
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Convert your text into natural-sounding speech
              </p>
            </div>
          </div>
        </div>

        {/* Service Health Status */}
        {serviceHealth && (
          <Card className={`mb-6 ${serviceHealth.success ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
            <div className="p-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 ${serviceHealth.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'} rounded-full flex items-center justify-center mr-3`}>
                  {serviceHealth.success ? (
                    <svg className="w-5 h-5 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${serviceHealth.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                    {serviceHealth.success ? 'Google TTS Service Online' : 'Service Unavailable'}
                  </h3>
                  <p className={`text-sm ${serviceHealth.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {serviceHealth.success 
                      ? `${serviceHealth.engine || 'Google Text-to-Speech'} initialized with ${voices.length} premium voices`
                      : `TTS service is not available: ${serviceHealth.error}`
                    }
                  </p>
                </div>
                {serviceHealth.success && (
                  <div className="text-right">
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      {serviceHealth.quality || 'High'} Quality
                    </div>
                    <div className="text-xs text-green-500 dark:text-green-500">
                      Neural TTS
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Anonymous User Notice */}
        {!user && (
          <Card className="mb-6 border-blue-200 dark:border-blue-800">
            <div className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Guest Mode</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Voice settings and conversion history are session-only. 
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate && onNavigate('auth')} 
                      className="ml-1 p-0 h-auto text-blue-600 dark:text-blue-400 underline hover:no-underline"
                    >
                      Sign in
                    </Button> to save your preferences.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Feature Showcase */}
        <Card className="feature-showcase mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Premium Google Text-to-Speech</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Professional-grade neural voice synthesis</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg premium-voice-indicator">🌟</span>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{voices.length}+ Premium Voices</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Multiple languages & accents</div>
              </div>
              
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">🧠</span>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Neural Technology</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Human-like speech quality</div>
              </div>
              
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">🌍</span>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{getAvailableLanguages().length} Languages</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Global coverage</div>
              </div>
              
              <div className="text-center">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">⚡</span>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">High Quality</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Crystal clear audio output</div>
              </div>
            </div>
            
            {/* Language breakdown */}
            {voices.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Available Languages:</div>
                <div className="flex flex-wrap gap-2">
                  {getAvailableLanguages().slice(0, 8).map(lang => {
                    const count = voices.filter(v => v.language === lang).length;
                    return (
                      <span key={lang} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {lang.toUpperCase()} ({count})
                      </span>
                    );
                  })}
                  {getAvailableLanguages().length > 8 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      +{getAvailableLanguages().length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-8">
          {/* Text Input */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label htmlFor="text-input" className="block text-sm font-medium text-gray-900 dark:text-white">
                Text to Convert
              </label>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setText("Welcome to FileAlchemy's premium Text-to-Speech! Powered by Google's neural technology, we offer 20 high-quality voices across multiple languages. Experience crystal-clear, human-like speech with customizable controls. Perfect for accessibility, education, and content creation.")}
                >
                  Sample Text
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setText("")}
                >
                  Clear
                </Button>
              </div>
            </div>
            <textarea
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text you want to convert to speech..."
              className="tts-textarea w-full h-40 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              maxLength={10000}
            />
            <div className="flex justify-between items-center mt-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex space-x-4">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {text.length}/10,000 characters
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  {text.trim().split(/\s+/).filter(word => word.length > 0).length} words
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ~{Math.ceil(text.trim().split(/\s+/).filter(word => word.length > 0).length / (rate / 60))}s duration
                </span>
                <span className="flex items-center text-green-600 dark:text-green-400">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Google TTS
                </span>
              </div>

            </div>
          </div>

          {/* Voice Settings */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Voice Selection */}
            <div className="md:col-span-2">
              <label htmlFor="voice-select" className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    Voice & Language
                  </div>
                  {voices.length > 0 && (
                    <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                      {voices.length} Premium Voices
                    </span>
                  )}
                </div>
              </label>
              
              <div className="space-y-3">
                {/* Language Filter */}
                {getAvailableLanguages().length > 1 && (
                  <select
                    value={voiceFilter}
                    onChange={(e) => setVoiceFilter(e.target.value)}
                    className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  >
                    <option value="all">All Languages ({voices.length} voices)</option>
                    {getAvailableLanguages().map(lang => {
                      const count = voices.filter(v => v.language === lang).length;
                      const langName = lang.toUpperCase();
                      return (
                        <option key={lang} value={lang}>
                          {langName} ({count} voice{count !== 1 ? 's' : ''})
                        </option>
                      );
                    })}
                  </select>
                )}
                
                {/* Voice Selection */}
                <select
                  id="voice-select"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  disabled={voices.length === 0}
                >
                  {voices.length === 0 ? (
                    <option value="">No voices available</option>
                  ) : (
                    getFilteredVoices().map((voice, index) => (
                      <option key={voice.id || index} value={voice.id || index.toString()}>
                        {getVoiceName(voice)} {voice.quality === 'high' && '🌟'}
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              {voices.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Google Neural TTS • High Quality
                    </div>
                    <div className="text-primary-500">
                      {getFilteredVoices().length} of {voices.length} voices shown
                    </div>
                  </div>
                  
                  {selectedVoice && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Temporarily clear text to use default test phrase
                        const originalText = text;
                        setText('');
                        handlePreview().finally(() => {
                          setText(originalText);
                        });
                      }}
                      disabled={isPreviewing || !selectedVoice}
                      className="w-full text-xs py-2 voice-test-btn"
                    >
                      {isPreviewing ? (
                        <>
                          <div className="w-3 h-3 mr-2 voice-test-spinner"></div>
                          Testing Voice...
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Quick Voice Test
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Speech Rate */}
            <div>
              <label htmlFor="rate-slider" className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Speed
                  </div>
                  <span className="text-primary-500 font-semibold">{rate} WPM</span>
                </div>
              </label>
              <input
                id="rate-slider"
                type="range"
                min="50"
                max="400"
                value={rate}
                onChange={(e) => setRate(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>Slow (50)</span>
                <span>Fast (400)</span>
              </div>
            </div>

            {/* Volume */}
            <div>
              <label htmlFor="volume-slider" className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a1 1 0 01-1-1V8a1 1 0 011-1h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V12a1 1 0 01-1 1H9z" />
                    </svg>
                    Volume
                  </div>
                  <span className="text-primary-500 font-semibold">{Math.round(volume * 100)}%</span>
                </div>
              </label>
              <input
                id="volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>Quiet (0%)</span>
                <span>Loud (100%)</span>
              </div>
            </div>
          </div>

          {/* Selected Voice Info */}
          {selectedVoice && voices.length > 0 && (
            <Card className="voice-info-card mb-6 border-blue-200 dark:border-blue-800">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Selected Voice: {(() => {
                          const voice = voices.find(v => v.id === selectedVoice || v.index?.toString() === selectedVoice);
                          return voice ? getVoiceName(voice) : 'Default';
                        })()}
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {(() => {
                          const voice = voices.find(v => v.id === selectedVoice || v.index?.toString() === selectedVoice);
                          if (!voice) return 'Google Neural TTS';
                          const parts = [];
                          if (voice.language) parts.push(`Language: ${voice.language.toUpperCase()}`);
                          if (voice.quality) parts.push(`Quality: ${voice.quality}`);
                          return parts.join(' • ') || 'Google Neural TTS';
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      🌟 Premium Voice
                    </div>
                    <div className="text-xs text-blue-500 dark:text-blue-500">
                      Neural Technology
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button
              variant="secondary"
              size="lg"
              onClick={handlePreview}
              disabled={isPreviewing || voices.length === 0}
              loading={isPreviewing}
              className="flex-1"
            >
              {!isPreviewing && (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {isPreviewing ? 'Playing Preview...' : 
               text.trim() ? 
                 (text.length > 500 ? 'Preview Speech (First ~500 chars)' : 'Preview Speech') : 
                 'Test Voice'
              }
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={handleConvert}
              disabled={!text.trim() || isConverting || voices.length === 0}
              loading={isConverting}
              className="flex-1"
            >
              {!isConverting && (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              )}
              {isConverting ? `Converting ${text.trim().split(/\s+/).filter(word => word.length > 0).length} words...` : 'Convert to Audio'}
            </Button>
          </div>

          {/* Result */}
          {result && (
            <Card className="conversion-result mb-8 border-green-200 dark:border-green-800">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Conversion Successful!</h3>
                      <p className="text-sm text-green-600 dark:text-green-400">Your audio file is ready for download</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">File Size</span>
                      <div className="font-medium text-gray-900 dark:text-white">{formatFileSize(result.size)}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Text Length</span>
                      <div className="font-medium text-gray-900 dark:text-white">{result.text_length} characters</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Voice Engine</span>
                      <div className="font-medium text-gray-900 dark:text-white flex items-center">
                        Google TTS 
                        <span className="ml-1 text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                          Neural
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleDownload}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Audio File ({result.filename})
                </Button>
              </div>
            </Card>
          )}

          {/* Recent Conversions */}
          {recentConversions.length > 0 && (
            <Card className="mb-8">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Conversions</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      setRecentConversions([]);
                      
                      if (user) {
                        addNotification('success', 'Recent conversions cleared from view');
                      } else {
                        addNotification('success', 'Recent conversions cleared');
                      }
                    }}
                  >
                    Clear History
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {recentConversions.map((conversion) => (
                    <div key={conversion.id} className="recent-conversion-item bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white font-medium mb-2">{conversion.text}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {conversion.timestamp}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            {conversion.wordCount} words
                          </span>
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            {conversion.voice}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            {conversion.size ? formatFileSize(conversion.size) : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                          Google TTS
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (conversion.filename) {
                              const downloadUrl = ttsService.getDownloadUrl(conversion.filename);
                              const link = document.createElement('a');
                              link.href = downloadUrl;
                              link.download = conversion.filename;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }
                          }}
                          className="text-xs"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TTSPage;
