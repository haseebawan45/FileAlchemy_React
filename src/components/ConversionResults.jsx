import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useConversion } from '../hooks/useConversion';
import Button from './ui/Button';
import Card from './ui/Card';

const ConversionResults = () => {
  const { state } = useApp();
  const { downloadResult, downloadAll, resetConversion } = useConversion();
  
  if (state.conversionResults.length === 0) return null;

  const successfulResults = state.conversionResults.filter(r => r.success);
  const failedResults = state.conversionResults.filter(r => !r.success);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Conversion Results
          </h2>
          <div className="flex space-x-3">
            {successfulResults.length > 1 && (
              <Button onClick={downloadAll} size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download All
              </Button>
            )}
            <Button variant="secondary" onClick={resetConversion} size="sm">
              New Conversion
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-gray-600 dark:text-gray-400">
              {successfulResults.length} Successful
            </span>
          </div>
          {failedResults.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">
                {failedResults.length} Failed
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {state.conversionResults.map((result, index) => (
          <ResultItem 
            key={`result-${index}`}
            result={result}
            onDownload={() => downloadResult(result)}
          />
        ))}
      </div>

      {failedResults.length > 0 && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                Some files failed to convert
              </h4>
              <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                This might be due to file corruption, unsupported features, or file size limitations. 
                You can try converting them individually or check the file format.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

const ResultItem = ({ result, onDownload }) => {
  const { originalFile, convertedFileName, size, success, error } = result;
  
  // Handle cases where originalFile might be undefined
  const originalFileName = originalFile?.name || 'Unknown file';
  const originalFileSize = originalFile?.size || 0;
  
  return (
    <div className={`flex items-center space-x-4 p-4 rounded-xl border ${
      success 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    }`}>
      {/* Status Icon */}
      <div className="flex-shrink-0">
        {success ? (
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        ) : (
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {originalFileName}
          </p>
          <span className="text-gray-400">→</span>
          <p className={`text-sm font-medium truncate ${
            success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
          }`}>
            {success ? convertedFileName : 'Failed'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          <span>Original: {formatFileSize(originalFileSize)}</span>
          {success && size && (
            <>
              <span>•</span>
              <span>Converted: {formatFileSize(size)}</span>
              {originalFileSize > 0 && (
                <>
                  <span>•</span>
                  <span className={`font-medium ${
                    size < originalFileSize ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    {size < originalFileSize ? 'Smaller' : 'Larger'} ({Math.round(((size - originalFileSize) / originalFileSize) * 100)}%)
                  </span>
                </>
              )}
            </>
          )}
          {!success && error && (
            <>
              <span>•</span>
              <span className="text-red-600 dark:text-red-400">{error}</span>
            </>
          )}
        </div>
      </div>

      {/* Download Button */}
      {success && (
        <div className="flex-shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDownload}
            className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/30"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </Button>
        </div>
      )}
    </div>
  );
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default ConversionResults;
