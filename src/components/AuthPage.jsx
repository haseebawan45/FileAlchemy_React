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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Back Button - Positioned absolutely */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 z-10 inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to FileAlchemy
      </button>

      {/* Main Content - 50/50 Split */}
      <div className="flex min-h-screen">
        {/* Left Side - Branding & Content */}
        <div className="w-1/2 bg-gradient-to-br from-primary-600 to-purple-700 dark:from-primary-800 dark:to-purple-900 flex items-center justify-center p-8">
          <div className="max-w-sm text-center text-white">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <span className="text-2xl">⚡</span>
            </div>
            
            {/* Brand Name */}
            <h1 className="text-3xl font-bold mb-3">
              FileAlchemy
            </h1>
            
            {/* Tagline */}
            <p className="text-lg text-primary-100 mb-6">
              Convert Any File with FileAlchemy
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
        <div className="w-1/2 bg-white dark:bg-gray-800 flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            {/* Form Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isSignUp ? 'Create Account' : 'Login To Your Account'}
              </h2>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Sign Up Only) */}
              {isSignUp && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                  />
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                />
              </div>

              {/* Confirm Password Field (Sign Up Only) */}
              {isSignUp && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                  />
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary-500 hover:bg-primary-600"
                size="md"
                loading={isLoading}
              >
                {isLoading ? (
                  isSignUp ? 'Creating Account...' : 'Signing In...'
                ) : (
                  isSignUp ? 'Create Account' : 'Login'
                )}
              </Button>
            </form>

            {/* Social Login */}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
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
                  className="w-full text-sm py-2"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>

                <Button
                  variant="outline"
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
                  className="w-full text-sm py-2"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>

            {/* Toggle Auth Mode */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="font-medium text-primary-500 hover:text-primary-600 transition-colors"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
