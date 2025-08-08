import React, { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './components/HomePage';
import ConversionPage from './components/ConversionPage';
import AboutPage from './components/AboutPage';
import HelpPage from './components/HelpPage';
import SettingsPage from './components/SettingsPage';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AuthPage from './components/AuthPage';
import ContactPage from './components/ContactPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import AllFormatsPage from './components/AllFormatsPage';
import Notifications from './components/ui/Notifications';
import PWAInstallPrompt, { PWAServiceWorker } from './components/PWAInstallPrompt';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [conversionHistory, setConversionHistory] = useState([]);
  const [user, setUser] = useState(null);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('filealchemy-history');
    if (savedHistory) {
      setConversionHistory(JSON.parse(savedHistory));
    }
  }, []);

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

  const addToHistory = (conversion) => {
    setConversionHistory(prev => [conversion, ...prev.slice(0, 9)]); // Keep last 10
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
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
        return <ConversionPage onBack={() => handleNavigation('home')} onComplete={addToHistory} />;
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
    <AppProvider>
      <div className="min-h-screen flex flex-col">
        {/* Hide Header on auth pages (signin/signup) */}
        {currentView !== 'auth' && (
          <Header currentView={currentView} onNavigate={handleNavigation} user={user} />
        )}

        <main className="flex-1">
          <PWAInstallPrompt />
          {renderCurrentView()}
        </main>

        {/* Hide Footer on auth pages (signin/signup) */}
        {currentView !== 'auth' && <Footer onNavigate={handleNavigation} onCategorySelect={handleCategorySelect} />}

        {/* Global Notifications */}
        <Notifications />

        {/* PWA Service Worker */}
        <PWAServiceWorker />
      </div>
    </AppProvider>
  );
}

export default App;