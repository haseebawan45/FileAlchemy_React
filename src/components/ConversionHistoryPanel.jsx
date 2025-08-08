import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useConversionHistory } from '../hooks/useFirestore';
import { getFormatIcon, getCategoryByFormat } from '../data/conversions';

/**
 * Enhanced Conversion History Panel with Firestore integration
 * Shows detailed conversion history from Firestore for authenticated users
 */
const ConversionHistoryPanel = ({ className = '' }) => {
  const { user } = useAuth();
  const { history, loading, error, refreshHistory } = useConversionHistory(20);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!user) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 mb-2">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Conversion History
          </h3>
          <p className="text-gray-600 mb-4">
            Sign in to view your detailed conversion history and analytics
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading History
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refreshHistory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Conversion History
          </h3>
          <button
            onClick={refreshHistory}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {history.length} recent conversions
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {history.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 mb-2">📁</div>
            <p className="text-gray-600">No conversions yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Your conversion history will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {history.map((record) => (
              <div
                key={record.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedRecord(record)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getFormatIcon(record.sourceFormat)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {record.sourceFormat} → {record.targetFormat}
                      </div>
                      <div className="text-sm text-gray-600">
                        {record.totalFiles} file{record.totalFiles !== 1 ? 's' : ''} • {formatFileSize(record.totalSizeBytes)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      record.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.success ? '✓ Success' : '✗ Failed'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(record.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Record Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Conversion Details
                </h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Conversion:</span>
                    <div className="font-medium">
                      {selectedRecord.sourceFormat} → {selectedRecord.targetFormat}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <div className="font-medium capitalize">{selectedRecord.category}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Files:</span>
                    <div className="font-medium">{selectedRecord.totalFiles}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Size:</span>
                    <div className="font-medium">{formatFileSize(selectedRecord.totalSizeBytes)}</div>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Results</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <div className={`font-medium ${
                      selectedRecord.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedRecord.success ? 'Success' : 'Failed'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Successful:</span>
                    <div className="font-medium text-green-600">{selectedRecord.successfulFiles}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Failed:</span>
                    <div className="font-medium text-red-600">{selectedRecord.failedFiles}</div>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Performance</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Processing Time:</span>
                    <div className="font-medium">{formatDuration(selectedRecord.processingTimeMs)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Backend:</span>
                    <div className="font-medium capitalize">{selectedRecord.backendUsed}</div>
                  </div>
                </div>
              </div>

              {/* File Details */}
              {selectedRecord.originalFileNames && selectedRecord.originalFileNames.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Files</h4>
                  <div className="space-y-2">
                    {selectedRecord.originalFileNames.map((fileName, index) => (
                      <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                        <span className="font-medium">{fileName}</span>
                        <span className="text-gray-600">
                          {selectedRecord.fileSizes && selectedRecord.fileSizes[index] 
                            ? formatFileSize(selectedRecord.fileSizes[index])
                            : 'Unknown size'
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {selectedRecord.errorMessage && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Error Details</h4>
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                    {selectedRecord.errorMessage}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Timestamps</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Started:</span>
                    <div className="font-medium">{formatDate(selectedRecord.startTime)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Completed:</span>
                    <div className="font-medium">{formatDate(selectedRecord.endTime)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversionHistoryPanel;