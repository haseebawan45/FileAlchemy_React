import React from 'react';

const Footer = () => {
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
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Image Conversion</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Document Processing</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Video & Audio</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Archive Tools</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Help Center</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Contact Us</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">Terms of Service</a></li>
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
