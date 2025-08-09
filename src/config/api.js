/**
 * API Configuration for FileAlchemy
 * Production mode - always uses Railway backend
 */

// Always use Railway production backend
const getApiBaseUrl = () => {
  return 'https://filealchemy-production.up.railway.app/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Export configuration object
export const apiConfig = {
  baseUrl: API_BASE_URL,
  timeout: 30000, // 30 seconds
  maxFileSize: 100 * 1024 * 1024, // 100MB
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

// Health check endpoint
export const HEALTH_ENDPOINT = `${API_BASE_URL}/health`;

// API endpoints
export const endpoints = {
  health: '/health',
  formats: '/formats',
  upload: '/upload',
  convert: '/convert',
  status: (jobId) => `/status/${jobId}`,
  download: (filename) => `/download/${filename}`,
  // TTS endpoints
  tts: {
    voices: '/tts/voices',
    convert: '/tts/convert',
    preview: '/tts/preview',
    health: '/tts/health',
  },
};

export default apiConfig;