import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import Button from '../ui/Button';

const Header = ({ currentView, onNavigate }) => {
  const { state, dispatch, actions } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleDarkMode = () => {
    dispatch({ type: actions.TOGGLE_DARK_MODE });
  };

  const handleNavClick = (view, event) => {
    event.preventDefault();
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const navigationItems = [
    { id: 'home', label: 'Home', shortcut: 'Ctrl+H' },
    { id: 'analytics', label: 'Analytics', shortcut: 'Ctrl+D' },
    { id: 'about', label: 'About', shortcut: 'Ctrl+A' },
    { id: 'help', label: 'Help', shortcut: 'Ctrl+K' },
    { id: 'settings', label: 'Settings', shortcut: 'Ctrl+,' }
  ];

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Clickable */}
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate('home')}
              className="flex-shrink-0 hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl p-1"
              title="Go to Home"
            >
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent">
                ⚡ FileAlchemy
              </h1>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={(e) => handleNavClick(item.id, e)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }`}
                title={`${item.label} (${item.shortcut})`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-2">
            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20"
              aria-label={`Switch to ${state.darkMode ? 'light' : 'dark'} mode`}
              title={`Toggle ${state.darkMode ? 'Light' : 'Dark'} Mode`}
            >
              {state.darkMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </Button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-100 dark:border-gray-700">
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={(e) => handleNavClick(item.id, e)}
                className={`block w-full text-left px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{item.label}</span>
                  <span className="text-xs opacity-60">{item.shortcut}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
