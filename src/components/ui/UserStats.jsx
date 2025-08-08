import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UserStats = ({ className = '' }) => {
  const { user, getUserDocument } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (user) {
        try {
          const userData = await getUserDocument();
          setUserStats(userData?.stats || { totalConversions: 0, lastConversionAt: null });
        } catch (error) {
          console.error('Error fetching user stats:', error);
          setUserStats({ totalConversions: 0, lastConversionAt: null });
        }
      }
      setLoading(false);
    };

    fetchUserStats();
  }, [user, getUserDocument]);

  // Don't show if user is not authenticated
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const formatLastConversion = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Your Stats
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Welcome back, {user.name}!
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
            {userStats?.totalConversions || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            conversions
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>Last conversion:</span>
        <span className="font-medium">
          {formatLastConversion(userStats?.lastConversionAt)}
        </span>
      </div>
      
      {userStats?.totalConversions > 0 && (
        <div className="mt-2 pt-2 border-t border-primary-200 dark:border-primary-800">
          <div className="flex items-center text-xs text-green-600 dark:text-green-400">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            All conversions synced to cloud
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStats;