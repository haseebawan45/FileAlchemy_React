import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useConversion } from '../hooks/useConversion';
import { conversionCategories } from '../data/conversions';
import Card from './ui/Card';
import Button from './ui/Button';

const ConversionPresets = () => {
  const { state, dispatch, actions } = useApp();
  const { setConversion } = useConversion();
  const [presets, setPresets] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  // Note: Presets are now stored only in component state
  // For persistent presets, integrate with Firestore user preferences

  const defaultPresets = [
    {
      id: 'web-images',
      name: 'Web Images',
      description: 'Optimize images for web use',
      category: 'images',
      sourceFormat: 'JPEG',
      targetFormat: 'WEBP',
      icon: '🌐',
      isDefault: true
    },
    {
      id: 'document-pdf',
      name: 'Document to PDF',
      description: 'Convert documents to PDF format',
      category: 'documents',
      sourceFormat: 'DOCX',
      targetFormat: 'PDF',
      icon: '📄',
      isDefault: true
    },
    {
      id: 'compress-video',
      name: 'Compress Video',
      description: 'Reduce video file size',
      category: 'video',
      sourceFormat: 'AVI',
      targetFormat: 'MP4',
      icon: '🎥',
      isDefault: true
    },
    {
      id: 'audio-mp3',
      name: 'Audio to MP3',
      description: 'Convert audio to MP3',
      category: 'audio',
      sourceFormat: 'WAV',
      targetFormat: 'MP3',
      icon: '🎵',
      isDefault: true
    }
  ];

  const allPresets = [...defaultPresets, ...presets];

  const createPreset = () => {
    if (!newPresetName.trim() || !state.selectedCategory || !state.sourceFormat || !state.targetFormat) {
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Cannot Create Preset',
          message: 'Please select formats and provide a preset name.'
        }
      });
      return;
    }

    const newPreset = {
      id: Date.now().toString(),
      name: newPresetName.trim(),
      description: `Convert ${state.sourceFormat} to ${state.targetFormat}`,
      category: state.selectedCategory,
      sourceFormat: state.sourceFormat,
      targetFormat: state.targetFormat,
      icon: conversionCategories[state.selectedCategory]?.icon || '⚡',
      isDefault: false,
      createdAt: Date.now()
    };

    setPresets([...presets, newPreset]);
    setNewPresetName('');
    setShowCreateForm(false);

    dispatch({
      type: actions.ADD_NOTIFICATION,
      payload: {
        type: 'success',
        title: 'Preset Created',
        message: `"${newPreset.name}" preset has been saved.`
      }
    });
  };

  const applyPreset = (preset) => {
    setConversion(preset.category, preset.sourceFormat, preset.targetFormat);
    
    dispatch({
      type: actions.ADD_NOTIFICATION,
      payload: {
        type: 'success',
        title: 'Preset Applied',
        message: `Applied "${preset.name}" preset.`
      }
    });
  };

  const deletePreset = (presetId) => {
    const updatedPresets = presets.filter(p => p.id !== presetId);
    setPresets(updatedPresets);
    
    dispatch({
      type: actions.ADD_NOTIFICATION,
      payload: {
        type: 'success',
        title: 'Preset Deleted',
        message: 'Preset has been removed.'
      }
    });
  };

  if (allPresets.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Conversion Presets
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Quick access to your favorite conversion settings
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={!state.sourceFormat || !state.targetFormat}
          title={!state.sourceFormat || !state.targetFormat ? "Select formats to create a preset" : "Create new preset"}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Preset
        </Button>
      </div>

      {/* Create Preset Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter preset name..."
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onKeyPress={(e) => e.key === 'Enter' && createPreset()}
              />
            </div>
            <Button onClick={createPreset} size="sm">
              Save
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setShowCreateForm(false);
                setNewPresetName('');
              }}
            >
              Cancel
            </Button>
          </div>
          {state.sourceFormat && state.targetFormat && (
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              This will save: {state.sourceFormat} → {state.targetFormat} ({conversionCategories[state.selectedCategory]?.name})
            </div>
          )}
        </div>
      )}

      {/* Presets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allPresets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            onApply={() => applyPreset(preset)}
            onDelete={preset.isDefault ? undefined : () => deletePreset(preset.id)}
            isActive={
              state.selectedCategory === preset.category &&
              state.sourceFormat === preset.sourceFormat &&
              state.targetFormat === preset.targetFormat
            }
          />
        ))}
      </div>

      {presets.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm">
            Create custom presets to quickly apply your favorite conversion settings.
          </p>
        </div>
      )}
    </Card>
  );
};

const PresetCard = ({ preset, onApply, onDelete, isActive }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
      isActive 
        ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/10'
    }`}>
      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
          title="Delete preset"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}

      <div onClick={onApply}>
        {/* Preset Icon */}
        <div className="text-2xl mb-3">{preset.icon}</div>

        {/* Preset Info */}
        <h4 className="font-semibold text-gray-900 dark:text-white mb-1 pr-6">
          {preset.name}
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          {preset.description}
        </p>

        {/* Format Badge */}
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
            {preset.sourceFormat}
          </span>
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
            {preset.targetFormat}
          </span>
        </div>

        {/* Default Badge */}
        {preset.isDefault && (
          <div className="mt-2">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
              Default
            </span>
          </div>
        )}

        {/* Active Indicator */}
        {isActive && (
          <div className="absolute inset-0 rounded-xl border-2 border-primary-400 pointer-events-none">
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl border-2 border-red-200 dark:border-red-800 p-3 flex flex-col justify-center items-center text-center z-10">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Delete this preset?
          </p>
          <div className="flex space-x-2">
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setShowDeleteConfirm(false);
              }}
            >
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversionPresets;
