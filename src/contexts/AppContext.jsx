import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Get initial dark mode from localStorage or system preference
const getInitialDarkMode = () => {
  const saved = localStorage.getItem('filealchemy-darkmode');
  if (saved !== null) {
    return saved === 'true';
  }
  // Check system preference
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

// Initial state
const initialState = {
  // Theme
  darkMode: getInitialDarkMode(),
  
  // Current conversion
  selectedCategory: null,
  sourceFormat: null,
  targetFormat: null,
  
  // File handling
  selectedFiles: [],
  previewUrls: [],
  
  // Conversion status
  isConverting: false,
  progress: 0,
  conversionResults: [],
  
  // UI state
  notifications: []
};

// Action types
const ActionTypes = {
  TOGGLE_DARK_MODE: 'TOGGLE_DARK_MODE',
  SET_CONVERSION: 'SET_CONVERSION', 
  SET_FILES: 'SET_FILES',
  ADD_FILES: 'ADD_FILES',
  REMOVE_FILE: 'REMOVE_FILE',
  CLEAR_FILES: 'CLEAR_FILES',
  START_CONVERSION: 'START_CONVERSION',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  COMPLETE_CONVERSION: 'COMPLETE_CONVERSION',
  RESET_CONVERSION: 'RESET_CONVERSION',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS'
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.TOGGLE_DARK_MODE:
      return {
        ...state,
        darkMode: !state.darkMode
      };

    case ActionTypes.SET_CONVERSION:
      return {
        ...state,
        selectedCategory: action.payload.category,
        sourceFormat: action.payload.sourceFormat,
        targetFormat: action.payload.targetFormat
      };

    case ActionTypes.SET_FILES:
      return {
        ...state,
        selectedFiles: action.payload.files,
        previewUrls: action.payload.previews || []
      };

    case ActionTypes.ADD_FILES:
      return {
        ...state,
        selectedFiles: [...state.selectedFiles, ...action.payload.files],
        previewUrls: [...state.previewUrls, ...(action.payload.previews || [])]
      };

    case ActionTypes.REMOVE_FILE:
      const newFiles = state.selectedFiles.filter((_, index) => index !== action.payload.index);
      const newPreviews = state.previewUrls.filter((_, index) => index !== action.payload.index);
      return {
        ...state,
        selectedFiles: newFiles,
        previewUrls: newPreviews
      };

    case ActionTypes.CLEAR_FILES:
      return {
        ...state,
        selectedFiles: [],
        previewUrls: [],
        conversionResults: []
      };

    case ActionTypes.START_CONVERSION:
      return {
        ...state,
        isConverting: true,
        progress: 0,
        conversionResults: []
      };

    case ActionTypes.UPDATE_PROGRESS:
      return {
        ...state,
        progress: action.payload.progress
      };

    case ActionTypes.COMPLETE_CONVERSION:
      return {
        ...state,
        isConverting: false,
        progress: 100,
        conversionResults: action.payload.results
      };

    case ActionTypes.RESET_CONVERSION:
      return {
        ...state,
        selectedCategory: null,
        sourceFormat: null,
        targetFormat: null,
        selectedFiles: [],
        previewUrls: [],
        isConverting: false,
        progress: 0,
        conversionResults: []
      };

    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, {
          id: Date.now() + Math.random(),
          ...action.payload
        }]
      };

    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload.id)
      };

    case ActionTypes.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: []
      };

    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Context provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize dark mode class on first render
  useEffect(() => {
    // Set initial class based on state
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []); // Empty dependency array - runs only once

  // Update localStorage and document class when dark mode changes
  useEffect(() => {
    localStorage.setItem('filealchemy-darkmode', state.darkMode.toString());
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    if (state.notifications.length > 0) {
      const latestNotification = state.notifications[state.notifications.length - 1];
      const timer = setTimeout(() => {
        dispatch({ 
          type: ActionTypes.REMOVE_NOTIFICATION, 
          payload: { id: latestNotification.id } 
        });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [state.notifications]);

  const value = {
    state,
    dispatch,
    actions: ActionTypes
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the app context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export { ActionTypes };
