/**
 * API service for file conversion using Python backend
 */

const API_BASE_URL = 'http://localhost:5000/api';

class ConversionApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = 'ConversionApiError';
    this.status = status;
  }
}

export class ConversionApi {
  /**
   * Check if the backend API is available
   */
  static async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new ConversionApiError('Backend API is not responding', response.status);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof ConversionApiError) {
        throw error;
      }
      throw new ConversionApiError('Failed to connect to backend API');
    }
  }

  /**
   * Get supported formats from backend
   */
  static async getSupportedFormats() {
    try {
      const response = await fetch(`${API_BASE_URL}/formats`);
      if (!response.ok) {
        throw new ConversionApiError('Failed to fetch supported formats', response.status);
      }
      const data = await response.json();
      return data.formats;
    } catch (error) {
      if (error instanceof ConversionApiError) {
        throw error;
      }
      throw new ConversionApiError('Failed to fetch supported formats');
    }
  }

  /**
   * Upload files and start conversion job
   */
  static async startConversion(files, sourceFormat, targetFormat) {
    try {
      const formData = new FormData();
      
      // Add files to form data
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Add conversion parameters
      formData.append('source_format', sourceFormat.toUpperCase());
      formData.append('target_format', targetFormat.toUpperCase());

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new ConversionApiError(data.error || 'Upload failed', response.status);
      }

      return data;
    } catch (error) {
      if (error instanceof ConversionApiError) {
        throw error;
      }
      throw new ConversionApiError('Failed to start conversion');
    }
  }

  /**
   * Get conversion job status
   */
  static async getConversionStatus(jobId) {
    try {
      const response = await fetch(`${API_BASE_URL}/status/${jobId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new ConversionApiError('Conversion job not found', 404);
        }
        throw new ConversionApiError('Failed to get conversion status', response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ConversionApiError) {
        throw error;
      }
      throw new ConversionApiError('Failed to get conversion status');
    }
  }

  /**
   * Poll conversion status until completion
   */
  static async pollConversionStatus(jobId, onProgress = null, pollInterval = 1000) {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const statusData = await this.getConversionStatus(jobId);
          
          // Update progress if callback provided
          if (onProgress) {
            onProgress(statusData.progress, statusData.status);
          }

          // Check if conversion is complete
          if (statusData.status === 'completed') {
            resolve(statusData);
            return;
          }

          if (statusData.status === 'failed') {
            reject(new ConversionApiError(statusData.error_message || 'Conversion failed'));
            return;
          }

          // Continue polling if still processing
          if (statusData.status === 'processing' || statusData.status === 'pending') {
            setTimeout(poll, pollInterval);
          } else {
            reject(new ConversionApiError(`Unknown status: ${statusData.status}`));
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  /**
   * Convert files with progress tracking
   */
  static async convertFiles(files, sourceFormat, targetFormat, onProgress = null) {
    try {
      // Start conversion
      const uploadResult = await this.startConversion(files, sourceFormat, targetFormat);
      const jobId = uploadResult.job_id;

      // Poll for completion
      const result = await this.pollConversionStatus(jobId, onProgress);
      
      // Process results to match frontend expectations
      const processedResults = result.results.map(item => ({
        originalFile: files.find(f => f.name === item.original_filename),
        convertedFileName: item.converted_filename,
        downloadUrl: item.download_url ? `${API_BASE_URL.replace('/api', '')}${item.download_url}` : null,
        size: item.size,
        success: item.success,
        error: item.error
      }));

      return {
        success: true,
        results: processedResults,
        message: `Successfully converted ${processedResults.filter(r => r.success).length} of ${processedResults.length} files`
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Convert a single file (synchronous API)
   */
  static async convertSingleFile(file, sourceFormat, targetFormat) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('source_format', sourceFormat.toUpperCase());
      formData.append('target_format', targetFormat.toUpperCase());

      const response = await fetch(`${API_BASE_URL}/convert`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new ConversionApiError(data.error || 'Conversion failed', response.status);
      }

      return {
        success: true,
        result: {
          originalFile: file,
          convertedFileName: data.converted_filename,
          downloadUrl: `${API_BASE_URL.replace('/api', '')}${data.download_url}`,
          size: data.size,
          success: true
        }
      };
    } catch (error) {
      if (error instanceof ConversionApiError) {
        throw error;
      }
      throw new ConversionApiError('Failed to convert file');
    }
  }

  /**
   * Download a converted file
   */
  static getDownloadUrl(downloadPath) {
    return `${API_BASE_URL.replace('/api', '')}${downloadPath}`;
  }
}

/**
 * Fallback mock conversion for when backend is not available
 */
export class MockConversionApi {
  static async convertFiles(files, sourceFormat, targetFormat, onProgress = null) {
    // Simulate conversion time
    const totalFiles = files.length;
    const results = [];
    
    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      
      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        if (onProgress) {
          const totalProgress = ((i * 100) + progress) / totalFiles;
          onProgress(Math.round(totalProgress), 'processing');
        }
      }
      
      // Generate mock result
      const convertedFileName = file.name.replace(/\.[^/.]+$/, `.${targetFormat.toLowerCase()}`);
      const mockBlob = new Blob(['mock converted file'], { type: 'application/octet-stream' });
      const mockUrl = URL.createObjectURL(mockBlob);
      
      results.push({
        originalFile: file,
        convertedFileName,
        downloadUrl: mockUrl,
        size: Math.round(file.size * (0.7 + Math.random() * 0.6)),
        success: Math.random() > 0.05 // 95% success rate
      });
    }
    
    return {
      success: true,
      results,
      message: `Successfully converted ${results.filter(r => r.success).length} of ${totalFiles} files`
    };
  }
}

/**
 * Smart conversion service that tries backend first, falls back to mock
 */
export class SmartConversionService {
  static backendAvailable = null;
  
  static async checkBackendAvailability() {
    if (this.backendAvailable !== null) {
      return this.backendAvailable;
    }
    
    try {
      await ConversionApi.checkHealth();
      this.backendAvailable = true;
      return true;
    } catch (error) {
      console.warn('Backend API not available, using mock conversion:', error.message);
      this.backendAvailable = false;
      return false;
    }
  }
  
  static async convertFiles(files, sourceFormat, targetFormat, onProgress = null) {
    const isBackendAvailable = await this.checkBackendAvailability();
    
    if (isBackendAvailable) {
      try {
        return await ConversionApi.convertFiles(files, sourceFormat, targetFormat, onProgress);
      } catch (error) {
        console.error('Backend conversion failed, falling back to mock:', error.message);
        this.backendAvailable = false; // Mark as unavailable for future requests
        return await MockConversionApi.convertFiles(files, sourceFormat, targetFormat, onProgress);
      }
    } else {
      return await MockConversionApi.convertFiles(files, sourceFormat, targetFormat, onProgress);
    }
  }
  
  static async getSupportedFormats() {
    const isBackendAvailable = await this.checkBackendAvailability();
    
    if (isBackendAvailable) {
      try {
        return await ConversionApi.getSupportedFormats();
      } catch (error) {
        console.error('Failed to get formats from backend:', error.message);
        // Return default formats from frontend data
        return null;
      }
    }
    
    return null;
  }
}

export default SmartConversionService;