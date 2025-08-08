import React, { useState } from 'react';
import { conversionCategories, supportedConversions, getConversionsByCategory } from '../data/conversions';
import { useApp } from '../contexts/AppContext';
import { useConversion } from '../hooks/useConversion';
import Card from './ui/Card';
import Button from './ui/Button';

const AllFormatsPage = ({ onCategorySelect, onBack }) => {
  const { dispatch, actions } = useApp();
  const { resetConversion } = useConversion();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleConversionSelect = (sourceFormat, targetFormat) => {
    const categoryKey = Object.keys(conversionCategories).find(key => 
      conversionCategories[key].formats.includes(sourceFormat)
    );
    
    resetConversion();
    dispatch({
      type: actions.SET_CONVERSION,
      payload: { 
        category: categoryKey,
        sourceFormat,
        targetFormat
      }
    });
    onCategorySelect(categoryKey);
  };

  const getAllConversions = () => {
    const allConversions = [];
    Object.entries(supportedConversions).forEach(([source, targets]) => {
      targets.forEach(target => {
        allConversions.push({
          from: source,
          to: target,
          category: Object.keys(conversionCategories).find(key => 
            conversionCategories[key].formats.includes(source)
          )
        });
      });
    });
    return allConversions;
  };

  const getFilteredConversions = () => {
    let conversions = selectedCategory === 'all' 
      ? getAllConversions() 
      : getConversionsByCategory(selectedCategory);

    if (searchTerm) {
      conversions = conversions.filter(conv => 
        conv.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.to.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return conversions;
  };

  const filteredConversions = getFilteredConversions();
  const totalFormats = Object.keys(supportedConversions).length;
  const totalConversions = getAllConversions().length;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Button 
              variant="secondary" 
              onClick={onBack}
              className="mr-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent">
                All Supported Formats
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Explore our complete collection of {totalFormats} file formats and {totalConversions} conversion options.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500 mb-2">{totalFormats}</div>
                <div className="text-gray-600 dark:text-gray-400">File Formats</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500 mb-2">{totalConversions}</div>
                <div className="text-gray-600 dark:text-gray-400">Conversions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500 mb-2">{Object.keys(conversionCategories).length}</div>
                <div className="text-gray-600 dark:text-gray-400">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search formats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              {Object.entries(conversionCategories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === key
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Conversions Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredConversions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No conversions found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedCategory === 'all' ? 'All Conversions' : conversionCategories[selectedCategory]?.name + ' Conversions'}
                  <span className="text-lg font-normal text-gray-500 dark:text-gray-400 ml-2">
                    ({filteredConversions.length} results)
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredConversions.map((conversion, index) => (
                  <ConversionCard
                    key={`${conversion.from}-${conversion.to}-${index}`}
                    conversion={conversion}
                    onClick={() => handleConversionSelect(conversion.from, conversion.to)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

const ConversionCard = ({ conversion, onClick }) => {
  const category = conversionCategories[conversion.category];
  
  return (
    <Card 
      onClick={onClick}
      className="p-4 cursor-pointer group hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{category?.icon}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {conversion.category}
          </span>
        </div>
        <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
      
      <div className="flex items-center justify-center space-x-3">
        <div className="text-center">
          <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {conversion.from}
            </span>
          </div>
        </div>
        
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        
        <div className="text-center">
          <div className="px-3 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
              {conversion.to}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AllFormatsPage;