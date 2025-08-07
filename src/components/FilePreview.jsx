import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import Card from './ui/Card';
import Button from './ui/Button';

const FilePreview = () => {
  const { state } = useApp();
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showMetadata, setShowMetadata] = useState(false);

  const selectedFile = state.selectedFiles[selectedFileIndex];
  const previewUrl = state.previewUrls[selectedFileIndex];

  if (state.selectedFiles.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          File Preview
        </h3>
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1 flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Grid view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="List view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
            </button>
          </div>

          {/* Metadata Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMetadata(!showMetadata)}
            className={showMetadata ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''}
            title="Toggle metadata"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File List */}
        <div className="lg:col-span-1">
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {state.selectedFiles.map((file, index) => (
              <FileListItem
                key={`${file.name}-${index}`}
                file={file}
                index={index}
                isSelected={index === selectedFileIndex}
                onClick={() => setSelectedFileIndex(index)}
                viewMode={viewMode}
                previewUrl={state.previewUrls[index]}
              />
            ))}
          </div>
        </div>

        {/* Main Preview */}
        <div className="lg:col-span-2">
          {selectedFile && (
            <div className="space-y-4">
              <FilePreviewMain 
                file={selectedFile} 
                previewUrl={previewUrl}
                sourceFormat={state.sourceFormat}
                targetFormat={state.targetFormat}
              />
              
              {showMetadata && (
                <FileMetadata file={selectedFile} />
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const FileListItem = ({ file, index, isSelected, onClick, viewMode, previewUrl }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (viewMode === 'list') {
    return (
      <button
        onClick={onClick}
        className={`w-full p-3 rounded-xl text-left transition-all duration-200 ${
          isSelected
            ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800'
            : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
            ) : (
              <FileIcon fileType={file.type} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {file.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2">
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <span>{getFileExtension(file.name).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full p-2 rounded-xl transition-all duration-200 ${
        isSelected
          ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800'
          : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
      }`}
    >
      <div className="aspect-square bg-gray-200 dark:bg-gray-600 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
        {previewUrl ? (
          <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <FileIcon fileType={file.type} />
        )}
      </div>
      <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
        {file.name}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {formatFileSize(file.size)}
      </div>
    </button>
  );
};

const FilePreviewMain = ({ file, previewUrl, sourceFormat, targetFormat }) => {
  const isImage = file.type.startsWith('image/');
  
  return (
    <div className="space-y-4">
      {/* Conversion Info */}
      <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Source</div>
          <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
            {sourceFormat}
          </div>
        </div>
        <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Target</div>
          <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">
            {targetFormat}
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        {isImage && previewUrl ? (
          <div className="text-center">
            <img 
              src={previewUrl} 
              alt={file.name}
              className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
            />
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Image Preview • Original Resolution
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileIcon fileType={file.type} size="large" />
            </div>
            <div className="font-medium text-gray-900 dark:text-white mb-2">
              {file.name}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {file.type || 'Unknown file type'} • Preview not available
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FileMetadata = ({ file }) => {
  const metadata = [
    { label: 'File Name', value: file.name },
    { label: 'File Size', value: formatFileSize(file.size) },
    { label: 'File Type', value: file.type || 'Unknown' },
    { label: 'Last Modified', value: new Date(file.lastModified).toLocaleString() },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
      <h4 className="font-medium text-gray-900 dark:text-white mb-3">File Metadata</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {metadata.map((item, index) => (
          <div key={index}>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {item.label}
            </div>
            <div className="text-sm text-gray-900 dark:text-white mt-1 break-all">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FileIcon = ({ fileType, size = 'normal' }) => {
  const iconSize = size === 'large' ? 'w-10 h-10' : 'w-6 h-6';
  
  if (fileType.startsWith('image/')) {
    return <svg className={`${iconSize} text-blue-500`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>;
  }
  if (fileType.startsWith('video/')) {
    return <svg className={`${iconSize} text-purple-500`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2.5a.5.5 0 01.8-.4l4.5 3a.5.5 0 010 .8l-4.5 3a.5.5 0 01-.8-.4v-6z" clipRule="evenodd" /></svg>;
  }
  if (fileType.startsWith('audio/')) {
    return <svg className={`${iconSize} text-green-500`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" clipRule="evenodd" /></svg>;
  }
  if (fileType.includes('pdf')) {
    return <svg className={`${iconSize} text-red-500`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>;
  }
  return <svg className={`${iconSize} text-gray-500`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>;
};

const getFileExtension = (filename) => {
  return filename.slice(filename.lastIndexOf('.') + 1) || '';
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default FilePreview;
