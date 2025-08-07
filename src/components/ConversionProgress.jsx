import React from 'react';
import { useApp } from '../contexts/AppContext';
import Card from './ui/Card';

const ConversionProgress = () => {
  const { state } = useApp();
  
  if (!state.isConverting && state.progress !== 100) return null;

  return (
    <Card className="p-8 mb-8">
      <div className="text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4">
            {state.isConverting ? (
              <div className="relative">
                <svg className="w-20 h-20 animate-spin" viewBox="0 0 24 24">
                  <circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    className="text-gray-200 dark:text-gray-700"
                    fill="none"
                  />
                  <circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    className="text-primary-500"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 10}`}
                    strokeDashoffset={`${2 * Math.PI * 10 * (1 - state.progress / 100)}`}
                    transform="rotate(-90 12 12)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {Math.round(state.progress)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {state.isConverting ? 'Converting Files...' : 'Conversion Complete!'}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400">
            {state.isConverting 
              ? `Converting ${state.selectedFiles.length} file${state.selectedFiles.length !== 1 ? 's' : ''} from ${state.sourceFormat} to ${state.targetFormat}`
              : `Successfully processed your files`
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-primary-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${state.progress}%` }}
          />
        </div>

        <div className="flex justify-center items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{Math.round(state.progress)}% Complete</span>
          <span>•</span>
          <span>{state.selectedFiles.length} file{state.selectedFiles.length !== 1 ? 's' : ''}</span>
        </div>

        {/* File Progress Details */}
        {state.isConverting && (
          <div className="mt-6 space-y-2">
            {state.selectedFiles.map((file, index) => {
              const fileProgress = Math.min(100, Math.max(0, (state.progress * state.selectedFiles.length) - (index * 100)));
              return (
                <FileProgressItem 
                  key={`${file.name}-${index}`}
                  file={file} 
                  progress={fileProgress}
                />
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

const FileProgressItem = ({ file, progress }) => {
  const isComplete = progress >= 100;
  const isProcessing = progress > 0 && progress < 100;
  
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <div className="flex-shrink-0">
        {isComplete ? (
          <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        ) : isProcessing ? (
          <div className="w-6 h-6">
            <svg className="w-6 h-6 animate-spin text-primary-500" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-25" />
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-75" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416" transform="rotate(-90 12 12)" style={{strokeDashoffset: `${31.416 * (1 - progress / 100)}`}} />
            </svg>
          </div>
        ) : (
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {file.name}
        </p>
        <div className="flex items-center space-x-2">
          <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all duration-300 ${
                isComplete ? 'bg-green-500' : 'bg-primary-500'
              }`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConversionProgress;
