import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import Card from './ui/Card';
import Button from './ui/Button';

const SettingsPage = ({ history, onClearHistory }) => {
  const { state, dispatch, actions } = useApp();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const preferences = [
    {
      id: 'darkMode',
      title: 'Dark Mode',
      description: 'Use dark theme across the application',
      type: 'toggle',
      value: state.darkMode,
      action: () => dispatch({ type: actions.TOGGLE_DARK_MODE })
    },
    {
      id: 'notifications',
      title: 'Show Notifications',
      description: 'Display toast notifications for conversion status',
      type: 'toggle',
      value: state.notificationsEnabled,
      action: () => dispatch({ type: actions.TOGGLE_NOTIFICATIONS })
    },
    {
      id: 'autoDownload',
      title: 'Auto Download',
      description: 'Automatically download converted files when ready',
      type: 'toggle',
      value: false,
      action: () => { } // Placeholder
    },
    {
      id: 'quality',
      title: 'Default Quality',
      description: 'Default quality setting for image conversions',
      type: 'select',
      value: 'high',
      options: [
        { value: 'low', label: 'Low (Smaller files)' },
        { value: 'medium', label: 'Medium (Balanced)' },
        { value: 'high', label: 'High (Best quality)' }
      ]
    }
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'filealchemy-history.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    onClearHistory();
    dispatch({ type: actions.CLEAR_NOTIFICATIONS });
    dispatch({
      type: actions.ADD_NOTIFICATION,
      payload: {
        type: 'success',
        title: 'Data Cleared',
        message: 'All application data has been cleared successfully.'
      }
    });
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your preferences and application data.
          </p>
        </div>

        <div className="space-y-8">
          {/* User Preferences */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Preferences
            </h2>
            <div className="space-y-6">
              {preferences.map(pref => (
                <PreferenceItem key={pref.id} preference={pref} />
              ))}
            </div>
          </Card>



          {/* Conversion History */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Conversion History
              </h2>
              <div className="flex space-x-2">
                {history.length > 0 && (
                  <Button variant="outline" size="sm" onClick={exportHistory}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearHistory}
                  disabled={history.length === 0}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear History
                </Button>
              </div>
            </div>

            {history.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.category} Conversion
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {item.sourceFormat} → {item.targetFormat} • {item.fileCount} file{item.fileCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No conversion history
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your recent conversions will appear here.
                </p>
              </div>
            )}
          </Card>

          {/* Data Management */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Data Management
            </h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-red-700 dark:text-red-400">
                    Clear All Data
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Remove all conversion history and notifications
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowClearConfirm(true)}
                >
                  Clear Data
                </Button>
              </div>
            </div>
          </Card>

          {/* About This Installation */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              System Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Application</h4>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <div>Version: 1.0.0</div>
                  <div>Build: Production</div>
                  <div>React: {React.version}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Browser</h4>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <div>User Agent: {navigator.userAgent.split(' ')[0]}</div>
                  <div>Language: {navigator.language}</div>
                  <div>Online: {navigator.onLine ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Clear Data Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Clear All Data?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This will permanently delete all your settings, conversion history, and preferences.
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="danger"
                  onClick={clearAllData}
                  className="flex-1"
                >
                  Yes, Clear All Data
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

const PreferenceItem = ({ preference }) => {
  if (preference.type === 'toggle') {
    return (
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {preference.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {preference.description}
          </p>
        </div>
        <button
          onClick={preference.action}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${preference.value
            ? 'bg-primary-500'
            : 'bg-gray-200 dark:bg-gray-700'
            }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preference.value ? 'translate-x-6' : 'translate-x-1'
              }`}
          />
        </button>
      </div>
    );
  }

  if (preference.type === 'select') {
    return (
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {preference.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {preference.description}
          </p>
        </div>
        <select
          value={preference.value}
          onChange={() => { }}
          className="block w-48 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {preference.options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return null;
};

export default SettingsPage;
