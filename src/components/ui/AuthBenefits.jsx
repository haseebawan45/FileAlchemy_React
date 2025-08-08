import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button';

const AuthBenefits = ({ onSignInClick, className = '' }) => {
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if user is authenticated or has dismissed
  if (user || isDismissed) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Unlock Premium Features
            </h3>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Sign in to get conversion history, analytics, and cloud sync - completely optional!
          </p>
          
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              History tracking
            </div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Analytics
            </div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Cloud sync
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={onSignInClick}
              className="text-xs px-3 py-1.5"
            >
              Sign In
            </Button>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
        
        <button
          onClick={() => setIsDismissed(true)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AuthBenefits;