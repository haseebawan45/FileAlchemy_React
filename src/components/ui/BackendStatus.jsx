import React, { useState, useEffect } from 'react';
import { ConversionApi } from '../../services/conversionApi';

const BackendStatus = ({ className = '' }) => {
  const [status, setStatus] = useState('checking'); // checking, available, unavailable
  const [lastCheck, setLastCheck] = useState(null);

  const checkBackendStatus = async () => {
    setStatus('checking');
    try {
      await ConversionApi.checkHealth();
      setStatus('available');
      setLastCheck(new Date());
    } catch (error) {
      setStatus('unavailable');
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkBackendStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          icon: '🔄',
          text: 'Checking backend...',
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800'
        };
      case 'available':
        return {
          icon: '✅',
          text: 'Backend connected',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800'
        };
      case 'unavailable':
        return {
          icon: '⚠️',
          text: 'Using offline mode',
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800'
        };
      default:
        return {
          icon: '❓',
          text: 'Unknown status',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border ${config.bgColor} ${config.borderColor} ${className}`}>
      <span className="text-sm mr-2">{config.icon}</span>
      <span className={`text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
      {lastCheck && (
        <button
          onClick={checkBackendStatus}
          className="ml-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
          title={`Last checked: ${lastCheck.toLocaleTimeString()}`}
        >
          🔄
        </button>
      )}
    </div>
  );
};

export default BackendStatus;