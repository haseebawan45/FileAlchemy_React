import React, { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './components/HomePage';
import ConversionPage from './components/ConversionPage';
import AboutPage from './components/AboutPage';
import HelpPage from './components/HelpPage';
import SettingsPage from './components/SettingsPage';
import Notifications from './components/ui/Notifications';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [conversionHistory, setConversionHistory] = useState([]);

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

  const handleCategorySelect = (category) => {
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
        return <HomePage onCategorySelect={handleCategorySelect} />;
      case 'conversion':
        return <ConversionPage onBack={() => handleNavigation('home')} onComplete={addToHistory} />;
      case 'about':
        return <AboutPage />;
      case 'help':
        return <HelpPage />;
      case 'settings':
        return <SettingsPage history={conversionHistory} onClearHistory={() => setConversionHistory([])} />;
      default:
        return <HomePage onCategorySelect={handleCategorySelect} />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col">
        <Header currentView={currentView} onNavigate={handleNavigation} />
        
        <main className="flex-1">
          {renderCurrentView()}
        </main>
        
        <Footer />
        
        {/* Global Notifications */}
        <Notifications />
      </div>
    </AppProvider>
  );
}

export default App;