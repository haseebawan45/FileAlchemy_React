import { useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import SmartConversionService from '../services/conversionApi';

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

      // Use SmartConversionService (backend with fallback to mock)
      const result = await SmartConversionService.convertFiles(
        state.selectedFiles,
        state.sourceFormat,
        state.targetFormat,
        (progress, status) => {
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

  const resetConversionKeepCategory = useCallback(() => {
    // Revoke all object URLs
    state.previewUrls.forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
    
    dispatch({ type: actions.RESET_CONVERSION_KEEP_CATEGORY });
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
    resetConversionKeepCategory,
    downloadResult,
    downloadAll
  };
}
