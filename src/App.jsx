import React, { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './components/HomePage';
import ConversionPage from './components/ConversionPage';
import Notifications from './components/ui/Notifications';

function App() {
  const [currentView, setCurrentView] = useState('home');

  const handleCategorySelect = (category) => {
    setCurrentView('conversion');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          {currentView === 'home' ? (
            <HomePage onCategorySelect={handleCategorySelect} />
          ) : (
            <ConversionPage onBack={handleBackToHome} />
          )}
        </main>
        
        <Footer />
        
        {/* Global Notifications */}
        <Notifications />
      </div>
    </AppProvider>
  );
}

export default App;