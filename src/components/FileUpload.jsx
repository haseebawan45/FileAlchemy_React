import React, { useRef, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useConversion } from '../hooks/useConversion';
import Button from './ui/Button';
import Card from './ui/Card';

const FileUpload = () => {
  const { state } = useApp();
  const { addFiles, removeFile, clearFiles } = useConversion();
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addFiles(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      addFiles(files);
    }
    // Reset input to allow selecting the same files again
    e.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        className={`upload-zone ${dragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept={getAcceptedFileTypes(state.sourceFormat)}
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {dragOver ? 'Drop your files here' : 'Drag and drop your files'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              or click to browse your computer
            </p>
            {state.sourceFormat && (
              <p className="text-xs text-primary-500 mt-2">
                Accepted: {state.sourceFormat} files
              </p>
            )}
          </div>
        </div>
      </div>

      {/* File List */}
      {state.selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Selected Files ({state.selectedFiles.length})
            </h3>
            <Button variant="ghost" size="sm" onClick={clearFiles}>
              Clear All
            </Button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {state.selectedFiles.map((file, index) => (
              <FileItem
                key={`${file.name}-${file.size}-${index}`}
                file={file}
                preview={state.previewUrls[index]}
                onRemove={() => removeFile(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const FileItem = ({ file, preview, onRemove }) => {
  const isImage = file.type.startsWith('image/');
  
  return (
    <Card className="p-4" hover={false}>
      <div className="flex items-center space-x-4">
        {/* Preview/Icon */}
        <div className="flex-shrink-0 w-12 h-12">
          {preview ? (
            <img 
              src={preview} 
              alt={file.name}
              className="w-12 h-12 object-cover rounded-lg"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <FileIcon fileType={file.type} />
            </div>
          )}
        </div>
        
        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {file.name}
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{formatFileSize(file.size)}</span>
            <span>•</span>
            <span>{file.type || 'Unknown type'}</span>
          </div>
        </div>
        
        {/* Remove Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="flex-shrink-0 text-gray-400 hover:text-red-500 p-1"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Button>
      </div>
    </Card>
  );
};

const FileIcon = ({ fileType }) => {
  if (fileType.startsWith('image/')) {
    return (
      <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
      </svg>
    );
  }
  
  if (fileType.startsWith('video/')) {
    return (
      <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2.5a.5.5 0 01.8-.4l4.5 3a.5.5 0 010 .8l-4.5 3a.5.5 0 01-.8-.4v-6z" clipRule="evenodd" />
      </svg>
    );
  }
  
  if (fileType.startsWith('audio/')) {
    return (
      <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" clipRule="evenodd" />
      </svg>
    );
  }
  
  return (
    <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
    </svg>
  );
};

const getAcceptedFileTypes = (sourceFormat) => {
  if (!sourceFormat) return '';
  
  const mimeTypes = {
    'JPEG': 'image/jpeg',
    'PNG': 'image/png',
    'WEBP': 'image/webp',
    'GIF': 'image/gif',
    'BMP': 'image/bmp',
    'TIFF': 'image/tiff',
    'SVG': 'image/svg+xml',
    'ICO': 'image/x-icon',
    'HEIC': 'image/heic',
    'PDF': 'application/pdf',
    'DOCX': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'XLSX': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'PPTX': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'TXT': 'text/plain',
    'HTML': 'text/html',
    'CSV': 'text/csv',
    'MP4': 'video/mp4',
    'AVI': 'video/avi',
    'MOV': 'video/quicktime',
    'MKV': 'video/x-matroska',
    'WMV': 'video/x-ms-wmv',
    'WEBM': 'video/webm',
    'MP3': 'audio/mpeg',
    'WAV': 'audio/wav',
    'AAC': 'audio/aac',
    'FLAC': 'audio/flac',
    'OGG': 'audio/ogg',
    'ZIP': 'application/zip',
    'RAR': 'application/x-rar-compressed',
    '7Z': 'application/x-7z-compressed',
    'TAR': 'application/x-tar'
  };
  
  return mimeTypes[sourceFormat] || '';
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default FileUpload;
