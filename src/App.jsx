import React, { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './components/HomePage';
import ConversionPage from './components/ConversionPage';
import AboutPage from './components/AboutPage';
import HelpPage from './components/HelpPage';
import SettingsPage from './components/SettingsPage';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import UserAnalyticsDashboard from './components/UserAnalyticsDashboard';
import AuthPage from './components/AuthPage';
import ContactPage from './components/ContactPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import AllFormatsPage from './components/AllFormatsPage';
import Notifications from './components/ui/Notifications';


// Main App Content Component that uses Auth Context
function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const [conversionHistory, setConversionHistory] = useState([]);
  const { user, trackConversion } = useAuth();

  // Load history from localStorage and Firestore
  useEffect(() => {
    const loadHistory = async () => {
      // Load from localStorage first for immediate display
      const savedHistory = localStorage.getItem('filealchemy-history');
      if (savedHistory) {
        setConversionHistory(JSON.parse(savedHistory));
      }

      // If user is authenticated, load from Firestore
      if (user) {
        try {
          const { default: firestoreService } = await import('./services/firestoreService');
          const result = await firestoreService.getUserConversionHistory(user.uid, 20);
          
          if (result.success && result.data.length > 0) {
            // Convert Firestore data to local format for backward compatibility
            const firestoreHistory = result.data.map(record => ({
              id: record.id,
              timestamp: record.createdAt?.toDate?.()?.getTime() || Date.now(),
              category: record.category,
              sourceFormat: record.sourceFormat,
              targetFormat: record.targetFormat,
              fileCount: record.totalFiles,
              success: record.success,
              // Additional Firestore data
              firestoreData: record
            }));
            
            // Merge with localStorage data, prioritizing Firestore
            const mergedHistory = [...firestoreHistory];
            setConversionHistory(mergedHistory);
          }
        } catch (error) {
          console.error('Error loading Firestore history:', error);
        }
      }
    };

    loadHistory();
  }, [user]); // Re-run when user changes

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('filealchemy-history', JSON.stringify(conversionHistory));
  }, [conversionHistory]);

  const handleCategorySelect = () => {
    setCurrentView('conversion');
  };

  const handleNavigation = (view) => {
    setCurrentView(view);
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToHistory = async (conversion) => {
    // Add to local state for immediate UI update
    setConversionHistory(prev => [conversion, ...prev.slice(0, 9)]); // Keep last 10
    
    // Save to Firestore (includes tracking for authenticated users)
    try {
      const { default: firestoreService } = await import('./services/firestoreService');
      await firestoreService.saveConversionRecord(conversion, user?.uid);
      
      // Legacy tracking for backward compatibility
      if (user) {
        await trackConversion(conversion);
      }
    } catch (error) {
      console.error('Error saving conversion to Firestore:', error);
      // Continue with local storage fallback
      if (user) {
        await trackConversion(conversion);
      }
    }
  };

  const handleAuthSuccess = (userData) => {
    handleNavigation('home');
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'h':
            e.preventDefault();
            handleNavigation('home');
            break;
          case 'a':
            e.preventDefault();
            handleNavigation('about');
            break;
          case 'k':
            e.preventDefault();
            handleNavigation('help');
            break;
          case 'd':
            e.preventDefault();
            handleNavigation('analytics');
            break;
          case ',':
            e.preventDefault();
            handleNavigation('settings');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onCategorySelect={handleCategorySelect} onNavigate={handleNavigation} />;
      case 'conversion':
        return <ConversionPage onBack={() => handleNavigation('home')} onComplete={addToHistory} onNavigate={handleNavigation} />;
      case 'about':
        return <AboutPage />;
      case 'help':
        return <HelpPage />;
      case 'settings':
        return <SettingsPage history={conversionHistory} onClearHistory={() => setConversionHistory([])} />;
      case 'analytics':
        return <AnalyticsDashboard history={conversionHistory} />;
      case 'auth':
        return <AuthPage onSuccess={handleAuthSuccess} onBack={() => handleNavigation('home')} />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'terms':
        return <TermsOfServicePage />;
      case 'formats':
        return <AllFormatsPage onCategorySelect={handleCategorySelect} onBack={() => handleNavigation('home')} />;
      default:
        return <HomePage onCategorySelect={handleCategorySelect} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hide Header on auth pages (signin/signup) */}
      {currentView !== 'auth' && (
        <Header currentView={currentView} onNavigate={handleNavigation} user={user} />
      )}

      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* Hide Footer on auth pages (signin/signup) */}
      {currentView !== 'auth' && <Footer onNavigate={handleNavigation} onCategorySelect={handleCategorySelect} />}

      {/* Global Notifications */}
      <Notifications />
    </div>
  );
}

// Main App Component with Providers
function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AppProvider>
  );
}

export default App;