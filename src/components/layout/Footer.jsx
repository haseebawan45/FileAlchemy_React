import React from 'react';

const Footer = ({ onNavigate, onCategorySelect }) => {
  const handleCategoryNavigation = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  const handlePageNavigation = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent mb-4">
              ⚡ FileAlchemy
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Transform your files instantly with our powerful conversion tools. 
              Supporting dozens of formats with a beautiful, modern interface.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Features
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => handleCategoryNavigation('images')}
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
                >
                  Image Conversion
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCategoryNavigation('documents')}
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
                >
                  Document Processing
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCategoryNavigation('video')}
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
                >
                  Video & Audio
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCategoryNavigation('archives')}
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
                >
                  Archive Tools
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => handlePageNavigation('help')}
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handlePageNavigation('contact')}
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handlePageNavigation('privacy')}
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handlePageNavigation('terms')}
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © 2025 FileAlchemy. Built with React & Tailwind CSS.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
