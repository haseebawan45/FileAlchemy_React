import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import Card from './ui/Card';
import Button from './ui/Button';

const AuthPage = ({ onSuccess, onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch, actions } = useApp();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      
      // Show success notification
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: isSignUp ? 'Account Created!' : 'Welcome Back!',
          message: isSignUp 
            ? 'Your account has been created successfully. Welcome to FileAlchemy!'
            : 'You have been signed in successfully.'
        }
      });

      // Call success callback
      if (onSuccess) {
        onSuccess({
          email: formData.email || 'demo@filealchemy.com',
          name: formData.name || 'Demo User',
          isSignUp
        });
      }
    }, 1500);
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-25 to-indigo-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary-100/10 to-purple-100/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Back Button - Enhanced */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 z-20 inline-flex items-center px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-gray-600 dark:text-gray-400 hover:text-primary-500 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20 dark:border-gray-700/50"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm font-medium">Back to FileAlchemy</span>
      </button>

      {/* Main Content - 50/50 Split */}
      <div className="flex min-h-screen">
        {/* Left Side - Branding & Content */}
        <div className="w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 dark:from-primary-800 dark:via-primary-900 dark:to-purple-900 flex items-center justify-center p-8 relative">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-300/10 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-primary-300/10 rounded-full blur-xl"></div>
          </div>
          
          <div className="max-w-sm text-center text-white relative z-10">
            {/* Logo - Enhanced */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-3xl mb-8 shadow-2xl border border-white/20 hover:scale-105 transition-transform duration-300">
              <span className="text-3xl drop-shadow-lg">⚡</span>
            </div>
            
            {/* Brand Name - Enhanced */}
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent drop-shadow-sm">
              FileAlchemy
            </h1>
            
            {/* Tagline - Enhanced */}
            <p className="text-xl text-primary-50 mb-8 font-light leading-relaxed">
              Transform any file format with the power of alchemy
            </p>
            
            {/* Support Link */}
            <p className="text-xs text-primary-200 mb-6">
              Having trouble logging in? Contact our support team at{' '}
              <a href="mailto:support@filealchemy.com" className="text-white underline hover:text-primary-100 transition-colors">
                support@filealchemy.com
              </a>
            </p>

            {/* Features List */}
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-primary-100">50+ file formats supported</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-primary-100">Conversion history & analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-primary-100">Custom conversion presets</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-primary-100">100% secure, client-side processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-1/2 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 flex items-center justify-center p-8 relative">
          {/* Subtle decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-10 w-20 h-20 bg-primary-100/20 dark:bg-primary-900/20 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 left-10 w-16 h-16 bg-purple-100/20 dark:bg-purple-900/20 rounded-full blur-lg"></div>
          </div>
          
          <div className="w-full max-w-sm relative z-10">
            {/* Form Header - Enhanced */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSignUp ? "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" : "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"} />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {isSignUp ? 'Join thousands of users transforming files' : 'Sign in to continue your file alchemy'}
              </p>
            </div>

            {/* Auth Form - Enhanced */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field (Sign Up Only) */}
              {isSignUp && (
                <div className="group">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 text-sm shadow-sm hover:shadow-md focus:shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 text-sm shadow-sm hover:shadow-md focus:shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 text-sm shadow-sm hover:shadow-md focus:shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Confirm Password Field (Sign Up Only) */}
              {isSignUp && (
                <div className="group">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 text-sm shadow-sm hover:shadow-md focus:shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              )}

              {/* Remember Me / Forgot Password */}
              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary-500 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 focus:ring-2 bg-white dark:bg-gray-800"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                  </label>
                  <button 
                    type="button"
                    className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Terms (Sign Up Only) */}
              {isSignUp && (
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="w-4 h-4 text-primary-500 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 focus:ring-2 bg-white dark:bg-gray-800 mt-0.5"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-400">
                    I agree to the{' '}
                    <a href="#" className="text-primary-500 hover:text-primary-600">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-primary-500 hover:text-primary-600">Privacy Policy</a>
                  </label>
                </div>
              )}

              {/* Submit Button - Enhanced */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border-0"
                  size="md"
                  loading={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </Button>
              </div>
            </form>

            {/* Social Login - Enhanced */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 text-gray-500 dark:text-gray-400 font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    dispatch({
                      type: actions.ADD_NOTIFICATION,
                      payload: {
                        type: 'info',
                        title: 'Demo Mode',
                        message: 'Social login is not available in demo mode.'
                      }
                    });
                  }}
                  className="w-full inline-flex justify-center items-center px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>

                <button
                  onClick={() => {
                    dispatch({
                      type: actions.ADD_NOTIFICATION,
                      payload: {
                        type: 'info',
                        title: 'Demo Mode',
                        message: 'Social login is not available in demo mode.'
                      }
                    });
                  }}
                  className="w-full inline-flex justify-center items-center px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </div>

            {/* Toggle Auth Mode - Enhanced */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center justify-center px-6 py-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-2xl backdrop-blur-sm border border-gray-100 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </p>
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="font-semibold text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors underline decoration-2 underline-offset-2 hover:decoration-primary-600"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
