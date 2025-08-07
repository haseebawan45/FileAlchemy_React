import { useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';

// Mock API delay simulation
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock conversion API
async function mockConvertFiles(files, sourceFormat, targetFormat, onProgress) {
  const results = [];
  const totalFiles = files.length;
  
  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    
    // Simulate conversion time based on file size
    const conversionTime = Math.min(3000, Math.max(1000, file.size / 1000));
    const progressSteps = 20;
    const stepTime = conversionTime / progressSteps;
    
    // Simulate progress updates
    for (let step = 1; step <= progressSteps; step++) {
      await delay(stepTime);
      const fileProgress = (step / progressSteps) * 100;
      const totalProgress = ((i * 100) + fileProgress) / totalFiles;
      onProgress(Math.round(totalProgress));
    }
    
    // Generate mock download URL and converted file info
    const convertedFileName = file.name.replace(/\.[^/.]+$/, `.${targetFormat.toLowerCase()}`);
    const mockDownloadUrl = `blob:${window.location.origin}/${Date.now()}-${convertedFileName}`;
    
    results.push({
      originalFile: file,
      convertedFileName,
      downloadUrl: mockDownloadUrl,
      size: Math.round(file.size * (0.7 + Math.random() * 0.6)), // Mock size variation
      success: Math.random() > 0.05 // 95% success rate
    });
  }
  
  return {
    success: true,
    results: results,
    message: `Successfully converted ${results.filter(r => r.success).length} of ${totalFiles} files`
  };
}

// Generate preview URLs for supported file types
function generatePreviewUrls(files) {
  return files.map(file => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  });
}

export function useConversion() {
  const { state, dispatch, actions } = useApp();
  const [error, setError] = useState(null);

  const convertFiles = useCallback(async () => {
    if (!state.selectedFiles.length || !state.sourceFormat || !state.targetFormat) {
      setError('Please select files and conversion formats');
      return;
    }

    try {
      setError(null);
      dispatch({ type: actions.START_CONVERSION });
      
      // Add notification for conversion start
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          type: 'info',
          message: `Starting conversion of ${state.selectedFiles.length} file(s) from ${state.sourceFormat} to ${state.targetFormat}`,
          title: 'Conversion Started'
        }
      });

      // Mock conversion API call
      const result = await mockConvertFiles(
        state.selectedFiles,
        state.sourceFormat,
        state.targetFormat,
        (progress) => {
          dispatch({ 
            type: actions.UPDATE_PROGRESS, 
            payload: { progress } 
          });
        }
      );

      if (result.success) {
        dispatch({ 
          type: actions.COMPLETE_CONVERSION, 
          payload: { results: result.results } 
        });
        
        // Add success notification
        dispatch({
          type: actions.ADD_NOTIFICATION,
          payload: {
            type: 'success',
            message: result.message,
            title: 'Conversion Complete!'
          }
        });
      } else {
        throw new Error(result.message || 'Conversion failed');
      }
    } catch (err) {
      setError(err.message);
      dispatch({ 
        type: actions.COMPLETE_CONVERSION, 
        payload: { results: [] } 
      });
      
      // Add error notification
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          type: 'error',
          message: err.message,
          title: 'Conversion Failed'
        }
      });
    }
  }, [state.selectedFiles, state.sourceFormat, state.targetFormat, dispatch, actions]);

  const addFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles);
    const previews = generatePreviewUrls(fileArray);
    
    dispatch({
      type: actions.ADD_FILES,
      payload: { files: fileArray, previews }
    });
  }, [dispatch, actions]);

  const setFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    const previews = generatePreviewUrls(fileArray);
    
    dispatch({
      type: actions.SET_FILES,
      payload: { files: fileArray, previews }
    });
  }, [dispatch, actions]);

  const removeFile = useCallback((index) => {
    // Revoke object URL to prevent memory leaks
    if (state.previewUrls[index]) {
      URL.revokeObjectURL(state.previewUrls[index]);
    }
    
    dispatch({
      type: actions.REMOVE_FILE,
      payload: { index }
    });
  }, [dispatch, actions, state.previewUrls]);

  const clearFiles = useCallback(() => {
    // Revoke all object URLs
    state.previewUrls.forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
    
    dispatch({ type: actions.CLEAR_FILES });
    setError(null);
  }, [dispatch, actions, state.previewUrls]);

  const setConversion = useCallback((category, sourceFormat, targetFormat) => {
    dispatch({
      type: actions.SET_CONVERSION,
      payload: { category, sourceFormat, targetFormat }
    });
    setError(null);
  }, [dispatch, actions]);

  const resetConversion = useCallback(() => {
    // Revoke all object URLs
    state.previewUrls.forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
    
    dispatch({ type: actions.RESET_CONVERSION });
    setError(null);
  }, [dispatch, actions, state.previewUrls]);

  const downloadResult = useCallback((result) => {
    // In a real app, this would handle the actual download
    // For now, we'll simulate it
    const link = document.createElement('a');
    link.href = result.downloadUrl;
    link.download = result.convertedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    dispatch({
      type: actions.ADD_NOTIFICATION,
      payload: {
        type: 'success',
        message: `Downloaded ${result.convertedFileName}`,
        title: 'Download Complete'
      }
    });
  }, [dispatch, actions]);

  const downloadAll = useCallback(() => {
    // In a real app, this would create a zip file with all results
    state.conversionResults.forEach((result, index) => {
      if (result.success) {
        setTimeout(() => downloadResult(result), index * 100);
      }
    });
  }, [state.conversionResults, downloadResult]);

  return {
    // State
    isConverting: state.isConverting,
    progress: state.progress,
    error,
    
    // Actions
    convertFiles,
    addFiles,
    setFiles,
    removeFile,
    clearFiles,
    setConversion,
    resetConversion,
    downloadResult,
    downloadAll
  };
}
