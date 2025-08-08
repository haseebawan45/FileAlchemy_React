import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import firestoreService from '../services/firestoreService';

/**
 * Custom hook for Firestore operations
 * Provides easy access to Firestore functionality with loading states
 */
export const useFirestore = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear error when user changes
  useEffect(() => {
    setError(null);
  }, [user]);

  /**
   * Save conversion record with loading state
   */
  const saveConversion = async (conversionData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await firestoreService.saveConversionRecord(
        conversionData, 
        user?.uid
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get user conversion history with loading state
   */
  const getConversionHistory = async (limitCount = 50) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firestoreService.getUserConversionHistory(
        user.uid, 
        limitCount
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get user analytics with loading state
   */
  const getUserAnalytics = async () => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firestoreService.getUserAnalytics(user.uid);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save user preferences with loading state
   */
  const savePreferences = async (preferences) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firestoreService.saveUserPreferences(
        user.uid, 
        preferences
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get user preferences with loading state
   */
  const getPreferences = async () => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firestoreService.getUserPreferences(user.uid);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save feedback with loading state
   */
  const saveFeedback = async (feedbackData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await firestoreService.saveFeedback(
        feedbackData, 
        user?.uid
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get recent conversions (public data) with loading state
   */
  const getRecentConversions = async (limitCount = 100) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await firestoreService.getRecentConversions(limitCount);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get system analytics with loading state
   */
  const getSystemAnalytics = async (startDate, endDate) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await firestoreService.getSystemAnalytics(startDate, endDate);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    loading,
    error,
    
    // Methods
    saveConversion,
    getConversionHistory,
    getUserAnalytics,
    savePreferences,
    getPreferences,
    saveFeedback,
    getRecentConversions,
    getSystemAnalytics,
    
    // Direct service access for advanced usage
    firestoreService
  };
};

/**
 * Hook for conversion history with real-time updates
 */
export const useConversionHistory = (limitCount = 50) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadHistory = async () => {
    if (!user) {
      setHistory([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await firestoreService.getUserConversionHistory(
        user.uid, 
        limitCount
      );

      if (result.success) {
        setHistory(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading conversion history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load history when user changes
  useEffect(() => {
    loadHistory();
  }, [user, limitCount]);

  const addToHistory = async (conversionData) => {
    try {
      const result = await firestoreService.saveConversionRecord(
        conversionData, 
        user?.uid
      );

      if (result.success) {
        // Reload history to get the latest data
        await loadHistory();
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    history,
    loading,
    error,
    addToHistory,
    refreshHistory: loadHistory
  };
};

/**
 * Hook for user analytics with caching
 */
export const useUserAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadAnalytics = async (forceRefresh = false) => {
    if (!user) {
      setAnalytics(null);
      return;
    }

    // Use cache if data is less than 5 minutes old
    const cacheAge = lastUpdated ? Date.now() - lastUpdated : Infinity;
    if (!forceRefresh && cacheAge < 5 * 60 * 1000 && analytics) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await firestoreService.getUserAnalytics(user.uid);

      if (result.success) {
        setAnalytics(result.data);
        setLastUpdated(Date.now());
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading user analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load analytics when user changes
  useEffect(() => {
    loadAnalytics();
  }, [user]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics: () => loadAnalytics(true),
    lastUpdated
  };
};

export default useFirestore;