import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Firestore Service for FileAlchemy
 * Handles all database operations for conversion records, user data, and analytics
 * Note: We only store metadata and records, not actual files
 */
class FirestoreService {
  constructor() {
    this.collections = {
      users: 'users',
      conversions: 'conversions',
      conversionHistory: 'conversion_history',
      analytics: 'analytics',
      userPreferences: 'user_preferences',
      systemStats: 'system_stats',
      feedbacks: 'feedbacks',
      supportedFormats: 'supported_formats'
    };
  }

  // ==================== CONVERSION RECORDS ====================
  
  /**
   * Save a conversion record to Firestore
   * @param {Object} conversionData - Conversion details
   * @param {string} userId - User ID (optional for anonymous users)
   */
  async saveConversionRecord(conversionData, userId = null) {
    try {
      const record = {
        // Basic conversion info
        sourceFormat: conversionData.sourceFormat?.toUpperCase(),
        targetFormat: conversionData.targetFormat?.toUpperCase(),
        category: conversionData.category,
        
        // File metadata (not actual files)
        originalFileNames: conversionData.files?.map(f => f.name) || [],
        fileSizes: conversionData.files?.map(f => f.size) || [],
        totalFiles: conversionData.files?.length || 0,
        totalSizeBytes: conversionData.files?.reduce((sum, f) => sum + f.size, 0) || 0,
        
        // Conversion results
        success: conversionData.success || false,
        successfulFiles: conversionData.successfulFiles || 0,
        failedFiles: conversionData.failedFiles || 0,
        errorMessage: conversionData.errorMessage || null,
        
        // Timing and performance
        startTime: conversionData.startTime || serverTimestamp(),
        endTime: conversionData.endTime || serverTimestamp(),
        processingTimeMs: conversionData.processingTimeMs || 0,
        
        // User and session info
        userId: userId,
        isAnonymous: !userId,
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId(),
        
        // Technical details
        backendUsed: conversionData.backendUsed || 'unknown', // 'api' or 'mock'
        apiVersion: conversionData.apiVersion || '1.0',
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.collections.conversions), record);
      
      // Update user stats if user is authenticated
      if (userId) {
        await this.updateUserConversionStats(userId, record);
      }
      
      // Update system analytics
      await this.updateSystemAnalytics(record);
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error saving conversion record:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get conversion history for a user
   * @param {string} userId - User ID
   * @param {number} limitCount - Number of records to fetch
   */
  async getUserConversionHistory(userId, limitCount = 50) {
    try {
      const q = query(
        collection(db, this.collections.conversions),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const history = [];
      
      querySnapshot.forEach((doc) => {
        history.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { success: true, data: history };
    } catch (error) {
      console.error('Error fetching user conversion history:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get recent conversions (public, anonymized data for analytics)
   * @param {number} limitCount - Number of records to fetch
   */
  async getRecentConversions(limitCount = 100) {
    try {
      const q = query(
        collection(db, this.collections.conversions),
        where('success', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const conversions = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Return anonymized data only
        conversions.push({
          id: doc.id,
          sourceFormat: data.sourceFormat,
          targetFormat: data.targetFormat,
          category: data.category,
          totalFiles: data.totalFiles,
          processingTimeMs: data.processingTimeMs,
          createdAt: data.createdAt
        });
      });
      
      return { success: true, data: conversions };
    } catch (error) {
      console.error('Error fetching recent conversions:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== USER ANALYTICS & STATS ====================
  
  /**
   * Update user conversion statistics
   * @param {string} userId - User ID
   * @param {Object} conversionRecord - Conversion record data
   */
  async updateUserConversionStats(userId, conversionRecord) {
    try {
      const userRef = doc(db, this.collections.users, userId);
      
      const updates = {
        'stats.totalConversions': increment(1),
        'stats.lastConversionAt': serverTimestamp(),
        'stats.totalFilesProcessed': increment(conversionRecord.totalFiles),
        'stats.totalBytesProcessed': increment(conversionRecord.totalSizeBytes),
        updatedAt: serverTimestamp()
      };
      
      // Track format usage
      const formatKey = `${conversionRecord.sourceFormat}_to_${conversionRecord.targetFormat}`;
      updates[`stats.formatUsage.${formatKey}`] = increment(1);
      
      // Track category usage
      updates[`stats.categoryUsage.${conversionRecord.category}`] = increment(1);
      
      await updateDoc(userRef, updates);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user analytics and statistics
   * @param {string} userId - User ID
   */
  async getUserAnalytics(userId) {
    try {
      const userRef = doc(db, this.collections.users, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return { success: false, error: 'User not found' };
      }
      
      const userData = userDoc.data();
      const stats = userData.stats || {};
      
      // Get detailed conversion history for analytics
      const historyResult = await this.getUserConversionHistory(userId, 100);
      const history = historyResult.success ? historyResult.data : [];
      
      // Calculate additional analytics
      const analytics = {
        totalConversions: stats.totalConversions || 0,
        totalFilesProcessed: stats.totalFilesProcessed || 0,
        totalBytesProcessed: stats.totalBytesProcessed || 0,
        lastConversionAt: stats.lastConversionAt,
        formatUsage: stats.formatUsage || {},
        categoryUsage: stats.categoryUsage || {},
        
        // Calculated from history
        averageProcessingTime: this.calculateAverageProcessingTime(history),
        mostUsedFormats: this.getMostUsedFormats(stats.formatUsage || {}),
        conversionTrends: this.getConversionTrends(history),
        successRate: this.calculateSuccessRate(history)
      };
      
      return { success: true, data: analytics };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== SYSTEM ANALYTICS ====================
  
  /**
   * Update system-wide analytics
   * @param {Object} conversionRecord - Conversion record data
   */
  async updateSystemAnalytics(conversionRecord) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const analyticsRef = doc(db, this.collections.analytics, today);
      
      const updates = {
        date: today,
        totalConversions: increment(1),
        totalFiles: increment(conversionRecord.totalFiles),
        totalBytes: increment(conversionRecord.totalSizeBytes),
        successfulConversions: increment(conversionRecord.success ? 1 : 0),
        failedConversions: increment(conversionRecord.success ? 0 : 1),
        updatedAt: serverTimestamp()
      };
      
      // Track format combinations
      const formatCombo = `${conversionRecord.sourceFormat}_to_${conversionRecord.targetFormat}`;
      updates[`formatCombinations.${formatCombo}`] = increment(1);
      
      // Track categories
      updates[`categories.${conversionRecord.category}`] = increment(1);
      
      // Track backend usage
      updates[`backendUsage.${conversionRecord.backendUsed}`] = increment(1);
      
      await updateDoc(analyticsRef, updates);
      
      return { success: true };
    } catch (error) {
      // If document doesn't exist, create it
      try {
        await addDoc(collection(db, this.collections.analytics), {
          date: today,
          totalConversions: 1,
          totalFiles: conversionRecord.totalFiles,
          totalBytes: conversionRecord.totalSizeBytes,
          successfulConversions: conversionRecord.success ? 1 : 0,
          failedConversions: conversionRecord.success ? 0 : 1,
          formatCombinations: {
            [`${conversionRecord.sourceFormat}_to_${conversionRecord.targetFormat}`]: 1
          },
          categories: {
            [conversionRecord.category]: 1
          },
          backendUsage: {
            [conversionRecord.backendUsed]: 1
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return { success: true };
      } catch (createError) {
        console.error('Error creating analytics document:', createError);
        return { success: false, error: createError.message };
      }
    }
  }

  /**
   * Get system analytics for a date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   */
  async getSystemAnalytics(startDate, endDate) {
    try {
      const q = query(
        collection(db, this.collections.analytics),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const analytics = [];
      
      querySnapshot.forEach((doc) => {
        analytics.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { success: true, data: analytics };
    } catch (error) {
      console.error('Error fetching system analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== TTS-SPECIFIC METHODS ====================
  
  /**
   * Save TTS preferences specifically
   * @param {string} userId - User ID
   * @param {Object} ttsPreferences - TTS preferences object
   */
  async saveTTSPreferences(userId, ttsPreferences) {
    try {
      const preferences = {
        tts: {
          ...ttsPreferences,
          lastUpdated: new Date().toISOString()
        }
      };
      
      return await this.saveUserPreferences(userId, preferences);
    } catch (error) {
      console.error('Error saving TTS preferences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get TTS preferences specifically
   * @param {string} userId - User ID
   */
  async getTTSPreferences(userId) {
    try {
      const result = await this.getUserPreferences(userId);
      if (result.success && result.data.tts) {
        return { success: true, data: result.data.tts };
      } else {
        // Return default TTS preferences
        const defaultTTSPrefs = {
          selectedVoice: '',
          rate: 200,
          volume: 0.9,
          autoSave: true,
          preferredFormat: 'wav'
        };
        return { success: true, data: defaultTTSPrefs };
      }
    } catch (error) {
      console.error('Error fetching TTS preferences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get TTS conversion history for a user
   * @param {string} userId - User ID
   * @param {number} limitCount - Number of records to fetch
   */
  async getTTSConversionHistory(userId, limitCount = 10) {
    try {
      const q = query(
        collection(db, this.collections.conversions),
        where('userId', '==', userId),
        where('category', '==', 'tts'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const history = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
          id: doc.id,
          text: data.originalText?.substring(0, 100) + (data.originalText?.length > 100 ? '...' : '') || 'TTS Conversion',
          wordCount: data.wordCount || 0,
          voice: data.voiceName || 'Default',
          rate: data.speechRate || 200,
          volume: data.speechVolume || 0.9,
          timestamp: data.createdAt?.toDate?.()?.toLocaleString() || new Date().toLocaleString(),
          filename: data.outputFileName || 'audio.wav',
          size: data.outputFileSize || 0,
          createdAt: data.createdAt
        });
      });
      
      return { success: true, data: history };
    } catch (error) {
      console.error('Error fetching TTS conversion history:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== USER PREFERENCES ====================
  
  /**
   * Save user preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - User preferences object
   */
  async saveUserPreferences(userId, preferences) {
    try {
      const prefsRef = doc(db, this.collections.userPreferences, userId);
      
      const prefsData = {
        userId,
        ...preferences,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(prefsRef, prefsData);
      
      return { success: true };
    } catch (error) {
      // If document doesn't exist, create it
      try {
        await addDoc(collection(db, this.collections.userPreferences), {
          userId,
          ...preferences,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return { success: true };
      } catch (createError) {
        console.error('Error saving user preferences:', createError);
        return { success: false, error: createError.message };
      }
    }
  }

  /**
   * Get user preferences
   * @param {string} userId - User ID
   */
  async getUserPreferences(userId) {
    try {
      const prefsRef = doc(db, this.collections.userPreferences, userId);
      const prefsDoc = await getDoc(prefsRef);
      
      if (prefsDoc.exists()) {
        return { success: true, data: prefsDoc.data() };
      } else {
        // Return default preferences
        const defaultPrefs = {
          theme: 'system',
          notifications: true,
          analytics: true,
          defaultQuality: 'high',
          autoDownload: false,
          preferredFormats: {
            images: 'PNG',
            documents: 'PDF',
            video: 'MP4',
            audio: 'MP3'
          }
        };
        return { success: true, data: defaultPrefs };
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== FEEDBACK & SUPPORT ====================
  
  /**
   * Save user feedback
   * @param {Object} feedbackData - Feedback data
   * @param {string} userId - User ID (optional)
   */
  async saveFeedback(feedbackData, userId = null) {
    try {
      const feedback = {
        type: feedbackData.type, // 'bug', 'feature', 'general'
        title: feedbackData.title,
        message: feedbackData.message,
        rating: feedbackData.rating || null,
        category: feedbackData.category || 'general',
        userId: userId,
        isAnonymous: !userId,
        userAgent: navigator.userAgent,
        url: window.location.href,
        status: 'open', // 'open', 'in-progress', 'resolved', 'closed'
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, this.collections.feedbacks), feedback);
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error saving feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== SUPPORTED FORMATS MANAGEMENT ====================
  
  /**
   * Update supported formats from backend
   * @param {Object} formatsData - Formats data from backend
   */
  async updateSupportedFormats(formatsData) {
    try {
      const formatsRef = doc(db, this.collections.supportedFormats, 'current');
      
      const data = {
        formats: formatsData,
        lastUpdated: serverTimestamp(),
        version: '1.0'
      };
      
      await updateDoc(formatsRef, data);
      
      return { success: true };
    } catch (error) {
      // If document doesn't exist, create it
      try {
        await addDoc(collection(db, this.collections.supportedFormats), {
          id: 'current',
          formats: formatsData,
          lastUpdated: serverTimestamp(),
          version: '1.0'
        });
        return { success: true };
      } catch (createError) {
        console.error('Error updating supported formats:', createError);
        return { success: false, error: createError.message };
      }
    }
  }

  /**
   * Get supported formats from Firestore
   */
  async getSupportedFormats() {
    try {
      const formatsRef = doc(db, this.collections.supportedFormats, 'current');
      const formatsDoc = await getDoc(formatsRef);
      
      if (formatsDoc.exists()) {
        return { success: true, data: formatsDoc.data().formats };
      } else {
        return { success: false, error: 'No formats data found' };
      }
    } catch (error) {
      console.error('Error fetching supported formats:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== UTILITY METHODS ====================
  
  /**
   * Generate or get session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('filealchemy-session-id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('filealchemy-session-id', sessionId);
    }
    return sessionId;
  }

  /**
   * Calculate average processing time from history
   * @param {Array} history - Conversion history
   */
  calculateAverageProcessingTime(history) {
    if (!history.length) return 0;
    
    const totalTime = history.reduce((sum, record) => {
      return sum + (record.processingTimeMs || 0);
    }, 0);
    
    return Math.round(totalTime / history.length);
  }

  /**
   * Get most used format combinations
   * @param {Object} formatUsage - Format usage stats
   */
  getMostUsedFormats(formatUsage) {
    const sorted = Object.entries(formatUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    return sorted.map(([format, count]) => ({
      format: format.replace('_to_', ' → '),
      count
    }));
  }

  /**
   * Get conversion trends from history
   * @param {Array} history - Conversion history
   */
  getConversionTrends(history) {
    const trends = {};
    
    history.forEach(record => {
      if (record.createdAt && record.createdAt.toDate) {
        const date = record.createdAt.toDate().toISOString().split('T')[0];
        trends[date] = (trends[date] || 0) + 1;
      }
    });
    
    return Object.entries(trends)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .slice(0, 30); // Last 30 days
  }

  /**
   * Calculate success rate from history
   * @param {Array} history - Conversion history
   */
  calculateSuccessRate(history) {
    if (!history.length) return 100;
    
    const successful = history.filter(record => record.success).length;
    return Math.round((successful / history.length) * 100);
  }

  /**
   * Clean up old conversion records (for maintenance)
   * @param {number} daysOld - Delete records older than this many days
   */
  async cleanupOldRecords(daysOld = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const q = query(
        collection(db, this.collections.conversions),
        where('createdAt', '<', cutoffDate),
        limit(100) // Process in batches
      );
      
      const querySnapshot = await getDocs(q);
      const deletePromises = [];
      
      querySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      await Promise.all(deletePromises);
      
      return { success: true, deletedCount: deletePromises.length };
    } catch (error) {
      console.error('Error cleaning up old records:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create and export singleton instance
const firestoreService = new FirestoreService();
export default firestoreService;