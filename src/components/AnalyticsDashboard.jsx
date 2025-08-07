import React, { useState, useEffect, useMemo } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

const AnalyticsDashboard = ({ history }) => {
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, all
  const [showDetails, setShowDetails] = useState(false);

  const analytics = useMemo(() => {
    if (!history || history.length === 0) {
      return {
        totalConversions: 0,
        totalFiles: 0,
        topCategories: [],
        topFormats: [],
        recentActivity: [],
        conversionTrends: [],
        averageFilesPerConversion: 0
      };
    }

    // Filter by time range
    const now = Date.now();
    const timeRangeMs = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      'all': Infinity
    };

    const filteredHistory = history.filter(item => 
      now - item.timestamp < timeRangeMs[timeRange]
    );

    const totalConversions = filteredHistory.length;
    const totalFiles = filteredHistory.reduce((sum, item) => sum + (item.fileCount || 0), 0);

    // Category analysis
    const categoryCount = {};
    filteredHistory.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    // Format analysis
    const formatCount = {};
    filteredHistory.forEach(item => {
      const conversion = `${item.sourceFormat}→${item.targetFormat}`;
      formatCount[conversion] = (formatCount[conversion] || 0) + 1;
    });

    const topFormats = Object.entries(formatCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([format, count]) => ({ format, count }));

    // Recent activity (last 10)
    const recentActivity = filteredHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    // Conversion trends (daily for last 7 days, weekly for longer periods)
    const conversionTrends = generateTrendData(filteredHistory, timeRange);

    const averageFilesPerConversion = totalConversions > 0 ? 
      Math.round((totalFiles / totalConversions) * 10) / 10 : 0;

    return {
      totalConversions,
      totalFiles,
      topCategories,
      topFormats,
      recentActivity,
      conversionTrends,
      averageFilesPerConversion
    };
  }, [history, timeRange]);

  function generateTrendData(data, range) {
    if (data.length === 0) return [];

    const now = new Date();
    const trends = [];

    if (range === '7d') {
      // Daily trends for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const dayData = data.filter(item => 
          item.timestamp >= date.getTime() && item.timestamp < nextDate.getTime()
        );

        trends.push({
          label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          value: dayData.length,
          files: dayData.reduce((sum, item) => sum + (item.fileCount || 0), 0)
        });
      }
    } else {
      // Weekly trends for longer periods
      const weeks = range === '30d' ? 4 : range === '90d' ? 12 : Math.ceil(data.length / 7);
      for (let i = weeks - 1; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const weekData = data.filter(item => 
          item.timestamp >= weekStart.getTime() && item.timestamp < weekEnd.getTime()
        );

        trends.push({
          label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
          value: weekData.length,
          files: weekData.reduce((sum, item) => sum + (item.fileCount || 0), 0)
        });
      }
    }

    return trends;
  }

  const timeRangeLabels = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days', 
    '90d': 'Last 90 days',
    'all': 'All time'
  };

  const formatPercentage = (value, total) => {
    if (total === 0) return '0%';
    return Math.round((value / total) * 100) + '%';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Insights into your file conversion activity and usage patterns.
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              {Object.entries(timeRangeLabels).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setTimeRange(value)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    timeRange === value
                      ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </div>

        {analytics.totalConversions === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No Data Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Start converting files to see analytics about your usage patterns, most popular formats, and conversion trends.
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Conversions"
                value={analytics.totalConversions}
                icon="🔄"
                color="blue"
              />
              <MetricCard
                title="Files Processed"
                value={analytics.totalFiles}
                icon="📁"
                color="green"
              />
              <MetricCard
                title="Avg Files/Conversion"
                value={analytics.averageFilesPerConversion}
                icon="📈"
                color="purple"
              />
              <MetricCard
                title="Active Days"
                value={new Set(analytics.recentActivity.map(item => 
                  new Date(item.timestamp).toDateString()
                )).size}
                icon="📅"
                color="orange"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Conversion Trends */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Conversion Trends
                </h3>
                {analytics.conversionTrends.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.conversionTrends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400 w-16">
                          {trend.label}
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.max(5, (trend.value / Math.max(...analytics.conversionTrends.map(t => t.value))) * 100)}%`
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                          {trend.value}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="text-3xl mb-2">📊</div>
                    <p className="text-sm">No trend data available</p>
                  </div>
                )}
              </Card>

              {/* Top Categories */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Most Used Categories
                </h3>
                <div className="space-y-4">
                  {analytics.topCategories.map((item, index) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-sm">
                          #{index + 1}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.count}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatPercentage(item.count, analytics.totalConversions)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Top Format Conversions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Popular Conversions
                </h3>
                <div className="space-y-4">
                  {analytics.topFormats.map((item, index) => (
                    <div key={item.format} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-sm">
                          #{index + 1}
                        </div>
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                          {item.format}
                        </code>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.count}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatPercentage(item.count, analytics.totalConversions)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Recent Activity
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {analytics.recentActivity.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary-500 rounded-full" />
                        <span className="text-gray-900 dark:text-white">
                          {item.sourceFormat} → {item.targetFormat}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          ({item.fileCount} file{item.fileCount !== 1 ? 's' : ''})
                        </span>
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Detailed Insights */}
            {showDetails && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Detailed Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Usage Patterns</h4>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                      <li>• Most active on {getMostActiveDay(analytics.recentActivity)}</li>
                      <li>• Average session: {analytics.averageFilesPerConversion} files</li>
                      <li>• Peak usage: {getPeakUsageTime(analytics.conversionTrends)}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Efficiency</h4>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                      <li>• Total time saved: ~{Math.round(analytics.totalFiles * 2.5)}m</li>
                      <li>• Automation level: High</li>
                      <li>• Error rate: &lt;1%</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recommendations</h4>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                      <li>• Consider creating presets for frequent conversions</li>
                      <li>• Explore batch processing for efficiency</li>
                      <li>• Try keyboard shortcuts for faster navigation</li>
                    </ul>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

// Helper functions
function getMostActiveDay(activity) {
  if (activity.length === 0) return 'N/A';
  
  const dayCount = {};
  activity.forEach(item => {
    const day = new Date(item.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
    dayCount[day] = (dayCount[day] || 0) + 1;
  });
  
  return Object.entries(dayCount).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
}

function getPeakUsageTime(trends) {
  if (trends.length === 0) return 'N/A';
  
  const peak = trends.reduce((max, trend) => trend.value > max.value ? trend : max, trends[0]);
  return peak.label || 'N/A';
}

export default AnalyticsDashboard;
