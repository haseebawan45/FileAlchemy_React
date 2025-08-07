import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

const AboutPage = () => {
  const features = [
    {
      icon: '🖼️',
      title: 'Image Conversion',
      description: 'Support for JPEG, PNG, WEBP, BMP, TIFF, GIF, SVG, ICO, and HEIC formats',
      formats: '15+ formats'
    },
    {
      icon: '📄',
      title: 'Document Processing', 
      description: 'Convert PDF, DOCX, TXT, HTML, RTF, XLSX, CSV, PPTX and more',
      formats: '20+ formats'
    },
    {
      icon: '🎥',
      title: 'Video & Audio',
      description: 'Handle MP4, AVI, MOV, MKV, MP3, WAV, AAC, FLAC formats',
      formats: '15+ formats'
    },
    {
      icon: '📦',
      title: 'Archive Tools',
      description: 'Extract and compress ZIP, RAR, 7Z, TAR, GZ archives',
      formats: '10+ formats'
    }
  ];

  const stats = [
    { number: '50+', label: 'File Formats' },
    { number: '6', label: 'Categories' },
    { number: '100%', label: 'Client-Side' },
    { number: '0ms', label: 'Upload Time' }
  ];

  const teamMembers = [
    {
      role: 'Frontend Architecture',
      tech: 'React 19 + Hooks',
      description: 'Modern functional components with optimized state management'
    },
    {
      role: 'UI/UX Design',
      tech: 'Tailwind CSS',
      description: 'Responsive, accessible design with dark mode support'
    },
    {
      role: 'File Processing',
      tech: 'Web APIs',
      description: 'Browser-native file handling with drag & drop support'
    },
    {
      role: 'State Management',
      tech: 'Context API',
      description: 'Centralized state with persistent user preferences'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-purple-600 rounded-3xl mb-6">
            <span className="text-3xl">⚡</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About FileAlchemy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            A powerful, modern file conversion tool built with React. Transform your files instantly 
            with our sleek interface and comprehensive format support - all running securely in your browser.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Comprehensive Format Support
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center h-full">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {feature.description}
                </p>
                <div className="inline-flex px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                  {feature.formats}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Built With Modern Technology
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {member.role}
                    </h3>
                    <div className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-2">
                      {member.tech}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {member.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Security & Privacy */}
        <Card className="p-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Your Privacy is Our Priority
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              All file conversions happen entirely in your browser. Your files never leave your device, 
              ensuring complete privacy and security. No uploads, no servers, no tracking - just pure client-side processing.
            </p>
          </div>
        </Card>

        {/* Mission Statement */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Our Mission
          </h2>
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-xl text-gray-600 dark:text-gray-400 italic leading-relaxed">
              "To democratize file conversion by making it accessible, fast, and secure for everyone. 
              We believe powerful tools should be simple to use, respect user privacy, and work seamlessly across all devices."
            </blockquote>
          </div>
        </div>

        {/* Version & Updates */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Version Information
              </h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div><strong>Current Version:</strong> 1.0.0</div>
                <div><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</div>
                <div><strong>Build:</strong> React {React.version}</div>
              </div>
            </div>
            <div className="text-right">
              <Button variant="outline" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Check for Updates
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
