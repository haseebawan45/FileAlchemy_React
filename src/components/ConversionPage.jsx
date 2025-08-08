import React from 'react';
import { conversionCategories, supportedConversions, getConversionDescription, isMultiPageConversion } from '../data/conversions';
import { useApp } from '../contexts/AppContext';
import { useConversion } from '../hooks/useConversion';
import Button from './ui/Button';
import Card from './ui/Card';
import Breadcrumb from './ui/Breadcrumb';
import FileUpload from './FileUpload';
import FilePreview from './FilePreview';
import ConversionPresets from './ConversionPresets';
import ConversionProgress from './ConversionProgress';
import ConversionResults from './ConversionResults';

const ConversionPage = ({ onBack, onComplete }) => {
  const { state, dispatch, actions } = useApp();
  const { convertFiles, setConversion } = useConversion();
  
  const category = conversionCategories[state.selectedCategory];
  const availableFormats = category?.formats || [];
  const targetFormats = state.sourceFormat ? supportedConversions[state.sourceFormat] || [] : [];
  
  const handleFormatChange = (type, format) => {
    if (type === 'source') {
      setConversion(state.selectedCategory, format, null);
    } else {
      setConversion(state.selectedCategory, state.sourceFormat, format);
    }
  };

  const canConvert = state.selectedFiles.length > 0 && state.sourceFormat && state.targetFormat && !state.isConverting;

  const handleConvert = async () => {
    await convertFiles();
    // Add to history when conversion completes
    if (onComplete) {
      onComplete({
        category: state.selectedCategory,
        sourceFormat: state.sourceFormat,
        targetFormat: state.targetFormat,
        fileCount: state.selectedFiles.length,
        timestamp: Date.now()
      });
    }
  };

  if (state.isConverting || (state.conversionResults.length > 0 && !state.isConverting)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ConversionProgress />
          {state.conversionResults.length > 0 && <ConversionResults onNewConversion={onBack} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { 
              label: 'Home', 
              icon: '🏠', 
              onClick: onBack 
            },
            { 
              label: 'File Conversion',
              icon: '🔄'
            },
            { 
              label: category?.name || 'Unknown',
              icon: category?.icon
            }
          ]} 
        />

        {/* Header */}
        <div className="mb-8">
          
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center`}>
              <span className="text-2xl">{category.icon}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {category.name} Conversion
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {category.description}
              </p>
            </div>
          </div>
        </div>

        {/* Conversion Presets */}
        <ConversionPresets />

        {/* Conversion Setup */}
        <div className="space-y-8">
          {/* Format Selection */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Choose Conversion Formats
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  From (Source Format)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableFormats.map(format => (
                    <FormatButton
                      key={format}
                      format={format}
                      isSelected={state.sourceFormat === format}
                      onClick={() => handleFormatChange('source', format)}
                    />
                  ))}
                </div>
              </div>

              {/* Target Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  To (Target Format)
                </label>
                {state.sourceFormat ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {targetFormats.map(format => (
                      <FormatButton
                        key={format}
                        format={format}
                        isSelected={state.targetFormat === format}
                        onClick={() => handleFormatChange('target', format)}
                        variant="target"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    Select a source format first
                  </div>
                )}
              </div>
            </div>

            {/* Conversion Arrow */}
            {state.sourceFormat && state.targetFormat && (
              <div className="flex items-center justify-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4 text-lg font-medium text-gray-900 dark:text-white">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">
                    {state.sourceFormat}
                  </span>
                  <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
                    {state.targetFormat}
                  </span>
                </div>
              </div>
            )}

            {/* Special Info for PDF to Image Conversion */}
            {state.sourceFormat && state.targetFormat && isMultiPageConversion(state.sourceFormat, state.targetFormat) && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      📄➡️📦 Multi-Page Conversion
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                      {getConversionDescription(state.sourceFormat, state.targetFormat)}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-500 mt-2">
                      Each PDF page will be converted to a separate {state.targetFormat} image. All images will be packaged in a ZIP file for easy download.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* File Upload */}
          {state.sourceFormat && state.targetFormat && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Select Files to Convert
              </h2>
              <FileUpload />
            </Card>
          )}

          {/* File Preview */}
          {state.selectedFiles.length > 0 && (
            <FilePreview />
          )}

          {/* Convert Button */}
          {canConvert && (
            <div className="text-center">
              <Button 
                size="lg" 
                onClick={handleConvert}
                className="px-12"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Convert {state.selectedFiles.length} File{state.selectedFiles.length !== 1 ? 's' : ''}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FormatButton = ({ format, isSelected, onClick, variant = 'source' }) => {
  const baseClasses = 'px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer text-center';
  const selectedClasses = variant === 'source' 
    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-700'
    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-300 dark:border-green-700';
  const unselectedClasses = 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700';
  
  return (
    <div 
      className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
      onClick={onClick}
    >
      {format}
    </div>
  );
};

export default ConversionPage;
