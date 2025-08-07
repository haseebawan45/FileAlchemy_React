import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqCategories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'conversion', name: 'File Conversion', icon: '🔄' },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: '🔧' },
    { id: 'privacy', name: 'Privacy & Security', icon: '🔒' }
  ];

  const faqs = [
    {
      category: 'getting-started',
      question: 'How do I convert my first file?',
      answer: 'Simply select a conversion category from the home page, choose your source and target formats, then drag and drop your files or click to browse. Click "Convert" and download your results!'
    },
    {
      category: 'getting-started', 
      question: 'What file formats are supported?',
      answer: 'We support 50+ formats across 6 categories: Images (JPEG, PNG, WEBP, etc.), Documents (PDF, DOCX, etc.), Video (MP4, AVI, etc.), Audio (MP3, WAV, etc.), Archives (ZIP, RAR, etc.), and other formats.'
    },
    {
      category: 'conversion',
      question: 'How many files can I convert at once?',
      answer: 'There\'s no limit! You can upload multiple files and convert them all in one batch. The progress tracker will show you the status of each file individually.'
    },
    {
      category: 'conversion',
      question: 'What\'s the maximum file size limit?',
      answer: 'Since all processing happens in your browser, the limit depends on your device\'s available memory. Generally, files up to 1GB work well on most modern devices.'
    },
    {
      category: 'conversion',
      question: 'Can I convert files to multiple formats at once?',
      answer: 'Currently, each conversion session converts to one target format. However, you can run multiple conversions simultaneously in different browser tabs.'
    },
    {
      category: 'privacy',
      question: 'Are my files uploaded to any servers?',
      answer: 'No! All conversions happen entirely in your browser. Your files never leave your device, ensuring complete privacy and security. We don\'t store, process, or see any of your files.'
    },
    {
      category: 'privacy',
      question: 'Do you collect any personal data?',
      answer: 'We only store your preferences (like dark mode setting) locally in your browser. We don\'t collect any personal data, track your usage, or require any registration.'
    },
    {
      category: 'troubleshooting',
      question: 'Why is my conversion taking so long?',
      answer: 'Conversion time depends on file size and your device\'s processing power. Large files or complex conversions may take longer. Try closing other browser tabs to free up memory.'
    },
    {
      category: 'troubleshooting',
      question: 'My file failed to convert. What should I do?',
      answer: 'This could happen due to file corruption, unsupported features, or memory limitations. Try with a smaller file first, or check if your file is corrupted.'
    },
    {
      category: 'troubleshooting',
      question: 'The app is running slowly. How can I improve performance?',
      answer: 'Close unnecessary browser tabs, ensure you have sufficient free RAM, and try refreshing the page. For large files, consider converting them one at a time.'
    }
  ];

  const keyboardShortcuts = [
    { keys: 'Ctrl + H', action: 'Go to Home page' },
    { keys: 'Ctrl + A', action: 'Go to About page' },
    { keys: 'Ctrl + K', action: 'Go to Help page' },
    { keys: 'Ctrl + ,', action: 'Go to Settings' },
    { keys: 'Esc', action: 'Close modals/menus' },
    { keys: 'Tab', action: 'Navigate between elements' }
  ];

  const tips = [
    {
      icon: '💡',
      title: 'Batch Processing',
      description: 'Select multiple files at once for efficient batch conversion. The progress tracker shows individual file status.'
    },
    {
      icon: '🎯',
      title: 'Format Selection',
      description: 'Choose formats based on your needs: JPEG for photos, PNG for graphics with transparency, WEBP for web optimization.'
    },
    {
      icon: '⚡',
      title: 'Performance Tips',
      description: 'For best performance, close unused tabs and ensure you have enough free memory before converting large files.'
    },
    {
      icon: '🔍',
      title: 'Quality Considerations',
      description: 'Some conversions may affect quality. Test with a sample file first for critical projects.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions and learn how to get the most out of FileAlchemy.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {faqCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {filteredFaqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
              {filteredFaqs.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search terms or category filter.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Keyboard Shortcuts */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                ⌨️ Keyboard Shortcuts
              </h3>
              <div className="space-y-3">
                {keyboardShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{shortcut.action}</span>
                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs font-mono">
                      {shortcut.keys}
                    </code>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Tips */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                💡 Quick Tips
              </h3>
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-xl">{tip.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                        {tip.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Contact Support */}
            <Card className="p-6 text-center">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Still Need Help?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Can't find what you're looking for? Get in touch with our support team.
              </p>
              <Button variant="primary" size="sm">
                Contact Support
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white pr-4">
            {question}
          </h3>
          <div className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {answer}
          </p>
        </div>
      )}
    </Card>
  );
};

export default HelpPage;
