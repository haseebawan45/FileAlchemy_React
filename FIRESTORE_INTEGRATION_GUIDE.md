# Firestore Integration Guide for FileAlchemy

## Overview

This guide explains how to integrate and use the comprehensive Firestore service in your FileAlchemy application. The service stores conversion records, user analytics, preferences, and system statistics without storing actual files.

## Architecture

### Collections Structure

```
firestore/
├── users/                    # User profiles and basic stats
├── conversions/              # Detailed conversion records
├── conversion_history/       # Legacy conversion history
├── analytics/               # Daily system analytics
├── user_preferences/        # User settings and preferences
├── system_stats/           # System-wide statistics
├── feedbacks/              # User feedback and support
└── supported_formats/      # Backend format capabilities
```

### Data Models

#### Conversion Record
```javascript
{
  // Basic conversion info
  sourceFormat: "PDF",
  targetFormat: "JPEG",
  category: "documents",
  
  // File metadata (not actual files)
  originalFileNames: ["document.pdf"],
  fileSizes: [1024000],
  totalFiles: 1,
  totalSizeBytes: 1024000,
  
  // Results
  success: true,
  successfulFiles: 1,
  failedFiles: 0,
  errorMessage: null,
  
  // Performance
  startTime: Timestamp,
  endTime: Timestamp,
  processingTimeMs: 2500,
  
  // User context
  userId: "user123",
  isAnonymous: false,
  sessionId: "session_abc123",
  
  // Technical details
  backendUsed: "api", // or "mock"
  apiVersion: "1.0",
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### User Analytics
```javascript
{
  totalConversions: 45,
  totalFilesProcessed: 123,
  totalBytesProcessed: 50000000,
  lastConversionAt: Timestamp,
  formatUsage: {
    "PDF_to_JPEG": 15,
    "PNG_to_WEBP": 8
  },
  categoryUsage: {
    "images": 25,
    "documents": 20
  },
  averageProcessingTime: 2300,
  successRate: 95
}
```

## Usage Examples

### 1. Basic Integration in Components

```javascript
import { useFirestore } from '../hooks/useFirestore';

const ConversionComponent = () => {
  const { saveConversion, loading, error } = useFirestore();
  
  const handleConversionComplete = async (conversionData) => {
    try {
      await saveConversion(conversionData);
      console.log('Conversion saved to Firestore');
    } catch (err) {
      console.error('Failed to save conversion:', err);
    }
  };
  
  // ... rest of component
};
```

### 2. Using Conversion History Hook

```javascript
import { useConversionHistory } from '../hooks/useFirestore';

const HistoryComponent = () => {
  const { history, loading, error, addToHistory, refreshHistory } = useConversionHistory(20);
  
  if (loading) return <div>Loading history...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h3>Conversion History ({history.length})</h3>
      {history.map(record => (
        <div key={record.id}>
          {record.sourceFormat} → {record.targetFormat}
          ({record.totalFiles} files)
        </div>
      ))}
    </div>
  );
};
```

### 3. User Analytics Dashboard

```javascript
import { useUserAnalytics } from '../hooks/useFirestore';

const AnalyticsComponent = () => {
  const { analytics, loading, refreshAnalytics } = useUserAnalytics();
  
  if (loading) return <div>Loading analytics...</div>;
  if (!analytics) return <div>No data available</div>;
  
  return (
    <div>
      <h3>Your Statistics</h3>
      <p>Total Conversions: {analytics.totalConversions}</p>
      <p>Success Rate: {analytics.successRate}%</p>
      <p>Average Processing Time: {analytics.averageProcessingTime}ms</p>
      
      <button onClick={refreshAnalytics}>Refresh</button>
    </div>
  );
};
```

### 4. Saving Conversion Records

```javascript
// In your conversion completion handler
const handleConversionComplete = async (conversionResult) => {
  const conversionData = {
    sourceFormat: 'PDF',
    targetFormat: 'JPEG',
    category: 'documents',
    files: originalFiles,
    success: conversionResult.success,
    successfulFiles: conversionResult.results.filter(r => r.success).length,
    failedFiles: conversionResult.results.filter(r => !r.success).length,
    startTime: conversionStartTime,
    endTime: new Date(),
    processingTimeMs: Date.now() - conversionStartTime.getTime(),
    backendUsed: 'api',
    results: conversionResult.results
  };
  
  // Save to Firestore
  const { default: firestoreService } = await import('./services/firestoreService');
  await firestoreService.saveConversionRecord(conversionData, user?.uid);
};
```

### 5. User Preferences

```javascript
import { useFirestore } from '../hooks/useFirestore';

const SettingsComponent = () => {
  const { savePreferences, getPreferences } = useFirestore();
  const [preferences, setPreferences] = useState(null);
  
  useEffect(() => {
    const loadPreferences = async () => {
      const result = await getPreferences();
      if (result.success) {
        setPreferences(result.data);
      }
    };
    loadPreferences();
  }, []);
  
  const handleSavePreferences = async (newPreferences) => {
    const result = await savePreferences(newPreferences);
    if (result.success) {
      setPreferences(newPreferences);
    }
  };
  
  // ... rest of component
};
```

### 6. Feedback System

```javascript
const FeedbackComponent = () => {
  const { saveFeedback } = useFirestore();
  
  const handleSubmitFeedback = async (feedbackData) => {
    const result = await saveFeedback({
      type: 'feature',
      title: 'New Feature Request',
      message: feedbackData.message,
      rating: feedbackData.rating,
      category: 'general'
    });
    
    if (result.success) {
      console.log('Feedback submitted successfully');
    }
  };
  
  // ... rest of component
};
```

## Integration with Existing Code

### 1. Update ConversionPage Component

```javascript
// In ConversionPage.jsx
import { useFirestore } from '../hooks/useFirestore';

const ConversionPage = ({ onComplete }) => {
  const { saveConversion } = useFirestore();
  
  const handleConversionComplete = async (result) => {
    // Save to Firestore
    if (result.conversionData) {
      try {
        await saveConversion(result.conversionData);
      } catch (error) {
        console.error('Failed to save conversion record:', error);
      }
    }
    
    // Call original completion handler
    onComplete(result);
  };
  
  // ... rest of component
};
```

### 2. Update ConversionApi Service

The ConversionApi service has already been updated to include `conversionData` in the response. Make sure your conversion handlers use this data:

```javascript
// In your conversion handler
const result = await SmartConversionService.convertFiles(files, sourceFormat, targetFormat, onProgress);

// The result now includes conversionData for Firestore
if (result.conversionData) {
  // This will be automatically saved by the component
}
```

### 3. Enhanced Analytics Dashboard

Replace your existing AnalyticsDashboard with the new UserAnalyticsDashboard:

```javascript
// In App.jsx or wherever you render analytics
import UserAnalyticsDashboard from './components/UserAnalyticsDashboard';

// Replace existing analytics component
<UserAnalyticsDashboard />
```

### 4. Enhanced History Panel

Add the new ConversionHistoryPanel to your settings or dashboard:

```javascript
import ConversionHistoryPanel from './components/ConversionHistoryPanel';

// In your settings page or dashboard
<ConversionHistoryPanel className="mb-6" />
```

## Security Rules

Add these Firestore security rules to protect user data:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own conversions
    match /conversions/{conversionId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || request.auth.uid == resource.data.userId);
      allow create: if request.auth != null;
    }
    
    // Users can read/write their own preferences
    match /user_preferences/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read recent conversions (anonymized)
    match /conversions/{conversionId} {
      allow read: if true;
    }
    
    // Anyone can read system analytics
    match /analytics/{document} {
      allow read: if true;
    }
    
    // Anyone can create feedback
    match /feedbacks/{feedbackId} {
      allow create: if true;
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Anyone can read supported formats
    match /supported_formats/{document} {
      allow read: if true;
    }
  }
}
```

## Performance Considerations

1. **Pagination**: Use the `limit` and `startAfter` parameters for large datasets
2. **Caching**: The hooks implement automatic caching for analytics data
3. **Batch Operations**: Use batch writes for multiple related operations
4. **Indexes**: Create composite indexes for complex queries

## Monitoring and Maintenance

1. **Cleanup**: Use the `cleanupOldRecords()` method to remove old conversion records
2. **Analytics**: Monitor system analytics to understand usage patterns
3. **Error Tracking**: All operations return success/error status for monitoring
4. **Performance**: Track processing times and success rates

## Migration from Local Storage

If you have existing local storage data, you can migrate it:

```javascript
const migrateLocalStorageData = async () => {
  const localHistory = localStorage.getItem('filealchemy-history');
  if (localHistory && user) {
    const history = JSON.parse(localHistory);
    
    for (const record of history) {
      // Convert local storage format to Firestore format
      const conversionData = {
        sourceFormat: record.sourceFormat,
        targetFormat: record.targetFormat,
        // ... map other fields
      };
      
      await firestoreService.saveConversionRecord(conversionData, user.uid);
    }
    
    // Clear local storage after migration
    localStorage.removeItem('filealchemy-history');
  }
};
```

## Troubleshooting

1. **Permission Errors**: Check Firestore security rules
2. **Network Issues**: All methods handle network errors gracefully
3. **Data Inconsistency**: Use transactions for critical operations
4. **Performance Issues**: Implement proper pagination and caching

This integration provides a robust, scalable data layer for your FileAlchemy application while maintaining excellent user experience and performance.