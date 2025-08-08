import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserAnalytics } from '../hooks/useFirestore';

/**
 * User Analytics Dashboard with Firestore integration
 * Shows detailed analytics and statistics for authenticated users
 */
const UserAnalyticsDashboard = ({ className = '' }) => {
  const { user } = useAuth();
  const { analytics, loading, error, refreshAnalytics, lastUpdated } = useUserAnalytics();
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never';
    
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
            Analytics Dashboard
          </h3>
          <p className="text-gray-600 mb-4">
            Sign in to view your detailed conversion analytics and insights
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 rounded"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
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
            Error Loading Analytics
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refreshAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 mb-2">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Analytics Data
          </h3>
          <p className="text-gray-600">
            Start converting files to see your analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Analytics Dashboard
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Your conversion statistics and insights
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500">
              Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}
            </span>
            <button
              onClick={refreshAnalytics}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-blue-600 text-2xl mr-3">🔄</div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {analytics.totalConversions.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">Total Conversions</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-green-600 text-2xl mr-3">📁</div>
              <div>
                <div className="text-2xl font-bold text-green-900">
                  {analytics.totalFilesProcessed.toLocaleString()}
                </div>
                <div className="text-sm text-green-700">Files Processed</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-purple-600 text-2xl mr-3">💾</div>
              <div>
                <div className="text-2xl font-bold text-purple-900">
                  {formatFileSize(analytics.totalBytesProcessed)}
                </div>
                <div className="text-sm text-purple-700">Data Processed</div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-orange-600 text-2xl mr-3">✅</div>
              <div>
                <div className="text-2xl font-bold text-orange-900">
                  {analytics.successRate}%
                </div>
                <div className="text-sm text-orange-700">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Performance</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Average Processing Time:</span>
                <span className="font-medium">{formatDuration(analytics.averageProcessingTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Conversion:</span>
                <span className="font-medium">{formatDate(analytics.lastConversionAt)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Most Used Formats</h4>
            <div className="space-y-2">
              {analytics.mostUsedFormats && analytics.mostUsedFormats.length > 0 ? (
                analytics.mostUsedFormats.slice(0, 5).map((format, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{format.format}</span>
                    <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {format.count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No format data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Category Usage */}
        {analytics.categoryUsage && Object.keys(analytics.categoryUsage).length > 0 && (
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-4">Category Usage</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(analytics.categoryUsage).map(([category, count]) => (
                <div key={category} className="text-center">
                  <div className="bg-gray-100 rounded-lg p-4 mb-2">
                    <div className="text-2xl mb-1">
                      {category === 'images' && '🖼️'}
                      {category === 'documents' && '📄'}
                      {category === 'video' && '🎥'}
                      {category === 'audio' && '🎵'}
                      {category === 'archives' && '📦'}
                      {category === 'other' && '⚡'}
                    </div>
                    <div className="text-lg font-bold text-gray-900">{count}</div>
                  </div>
                  <div className="text-sm text-gray-600 capitalize">{category}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversion Trends */}
        {analytics.conversionTrends && analytics.conversionTrends.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Recent Activity</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                {analytics.conversionTrends.slice(0, 10).map(([date, count]) => (
                  <div key={date} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {new Date(date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (count / Math.max(...analytics.conversionTrends.map(([,c]) => c))) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAnalyticsDashboard;