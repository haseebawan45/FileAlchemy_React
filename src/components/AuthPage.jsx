import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import Card from './ui/Card';
import Button from './ui/Button';

const AuthPage = ({ onSuccess, onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    resetToken: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch, actions } = useApp();
  const { signUp, signIn, signInWithGoogle, signInWithFacebook, resetPassword } = useAuth();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        // Handle forgot password submission
        const result = await resetPassword(formData.email);
        
        if (result.success) {
          dispatch({
            type: actions.ADD_NOTIFICATION,
            payload: {
              type: 'success',
              title: 'Reset Link Sent!',
              message: `Password reset instructions have been sent to ${formData.email}. Check your inbox and spam folder.`
            }
          });
          // Reset to login form after successful reset email
          resetToLogin();
        } else {
          dispatch({
            type: actions.ADD_NOTIFICATION,
            payload: {
              type: 'error',
              title: 'Reset Failed',
              message: result.error
            }
          });
        }
        return;
      }

      if (isResetPassword) {
        // Handle password reset submission (this would typically be handled by Firebase Auth UI)
        if (formData.newPassword !== formData.confirmNewPassword) {
          dispatch({
            type: actions.ADD_NOTIFICATION,
            payload: {
              type: 'error',
              title: 'Password Mismatch',
              message: 'New passwords do not match. Please try again.'
            }
          });
          return;
        }

        // In a real app, this would be handled by Firebase Auth's password reset flow
        dispatch({
          type: actions.ADD_NOTIFICATION,
          payload: {
            type: 'info',
            title: 'Demo Mode',
            message: 'Password reset is handled through the email link in production.'
          }
        });
        resetToLogin();
        return;
      }

      // Regular login/signup flow
      let result;
      
      if (isSignUp) {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          dispatch({
            type: actions.ADD_NOTIFICATION,
            payload: {
              type: 'error',
              title: 'Password Mismatch',
              message: 'Passwords do not match. Please try again.'
            }
          });
          return;
        }

        // Sign up with Firebase
        result = await signUp(formData.email, formData.password, formData.name);
      } else {
        // Sign in with Firebase
        result = await signIn(formData.email, formData.password);
      }

      if (result.success) {
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

        // Call success callback with user data
        if (onSuccess) {
          onSuccess({
            email: result.user.email,
            name: result.user.name,
            uid: result.user.uid,
            isSignUp
          });
        }
      } else {
        // Show error notification
        dispatch({
          type: actions.ADD_NOTIFICATION,
          payload: {
            type: 'error',
            title: isSignUp ? 'Sign Up Failed' : 'Sign In Failed',
            message: result.error
          }
        });
      }
    } catch (error) {
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Authentication Error',
          message: 'An unexpected error occurred. Please try again.'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      resetToken: '',
      newPassword: '',
      confirmNewPassword: ''
    });
  };

  const handleForgotPassword = () => {
    setIsForgotPassword(true);
    setIsSignUp(false);
    setIsResetPassword(false);
    setFormData({
      email: formData.email, // Keep email if already entered
      password: '',
      confirmPassword: '',
      name: '',
      resetToken: '',
      newPassword: '',
      confirmNewPassword: ''
    });
  };

  const resetToLogin = () => {
    setIsForgotPassword(false);
    setIsResetPassword(false);
    setIsSignUp(false);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      resetToken: '',
      newPassword: '',
      confirmNewPassword: ''
    });
  };

  const backToLogin = () => {
    if (isResetPassword) {
      setIsResetPassword(false);
      setIsForgotPassword(true);
    } else if (isForgotPassword) {
      setIsForgotPassword(false);
    }
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
              {/* Back to Login Button for Forgot/Reset Password */}
              {(isForgotPassword || isResetPassword) && (
                <button
                  onClick={backToLogin}
                  className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors mb-4"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {isResetPassword ? 'Back to Forgot Password' : 'Back to Sign In'}
                </button>
              )}

              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                    isForgotPassword ? "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" :
                    isResetPassword ? "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" :
                    isSignUp ? "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" : 
                    "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  } />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-2">
                {isForgotPassword ? 'Reset Password' : 
                 isResetPassword ? 'Create New Password' :
                 isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {isForgotPassword ? 'Enter your email to receive reset instructions' :
                 isResetPassword ? 'Enter your new password below' :
                 isSignUp ? 'Join thousands of users transforming files' : 'Sign in to continue your file alchemy'}
              </p>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Forgot Password Form */}
              {isForgotPassword && (
                <>
                  {/* Email Field for Password Reset */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                    />
                  </div>

                  {/* Info Message */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Password Reset Instructions</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          We'll send you a secure link to reset your password. The link will expire in 1 hour for security.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Reset Password Form */}
              {isResetPassword && (
                <>
                  {/* Reset Token Field (Hidden in real app, shown for demo) */}
                  <div>
                    <label htmlFor="resetToken" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reset Token <span className="text-xs text-gray-500">(Demo - auto-filled)</span>
                    </label>
                    <input
                      type="text"
                      id="resetToken"
                      name="resetToken"
                      value={formData.resetToken || 'demo-reset-token-12345'}
                      onChange={handleInputChange}
                      placeholder="Reset token from email"
                      readOnly
                      className="w-full px-3 py-2.5 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-sm cursor-not-allowed"
                    />
                  </div>

                  {/* New Password Field */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter your new password"
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                    />
                  </div>

                  {/* Confirm New Password Field */}
                  <div>
                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      value={formData.confirmNewPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your new password"
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                    />
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Password Requirements:</p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <li className="flex items-center">
                        <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        At least 8 characters long
                      </li>
                      <li className="flex items-center">
                        <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Contains uppercase and lowercase letters
                      </li>
                      <li className="flex items-center">
                        <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Contains at least one number
                      </li>
                    </ul>
                  </div>
                </>
              )}

              {/* Regular Login/Signup Forms */}
              {!isForgotPassword && !isResetPassword && (
                <>
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
                        onClick={handleForgotPassword}
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
                </>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary-500 hover:bg-primary-600"
                size="md"
                loading={isLoading}
              >
                {isLoading ? (
                  isForgotPassword ? 'Sending Reset Link...' :
                  isResetPassword ? 'Updating Password...' :
                  isSignUp ? 'Creating Account...' : 'Signing In...'
                ) : (
                  isForgotPassword ? 'Send Reset Link' :
                  isResetPassword ? 'Update Password' :
                  isSignUp ? 'Create Account' : 'Login'
                )}
              </Button>
            </form>

            {/* Social Login - Only show for regular login/signup */}
            {!isForgotPassword && !isResetPassword && (
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
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        const result = await signInWithGoogle();
                        if (result.success) {
                          dispatch({
                            type: actions.ADD_NOTIFICATION,
                            payload: {
                              type: 'success',
                              title: 'Welcome!',
                              message: 'You have been signed in with Google successfully.'
                            }
                          });
                          
                          if (onSuccess) {
                            onSuccess({
                              email: result.user.email,
                              name: result.user.name,
                              uid: result.user.uid,
                              photoURL: result.user.photoURL,
                              provider: 'google'
                            });
                          }
                        } else {
                          dispatch({
                            type: actions.ADD_NOTIFICATION,
                            payload: {
                              type: 'error',
                              title: 'Google Sign In Failed',
                              message: result.error
                            }
                          });
                        }
                      } catch (error) {
                        dispatch({
                          type: actions.ADD_NOTIFICATION,
                          payload: {
                            type: 'error',
                            title: 'Authentication Error',
                            message: 'Failed to sign in with Google. Please try again.'
                          }
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
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
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        const result = await signInWithFacebook();
                        if (result.success) {
                          dispatch({
                            type: actions.ADD_NOTIFICATION,
                            payload: {
                              type: 'success',
                              title: 'Welcome!',
                              message: 'You have been signed in with Facebook successfully.'
                            }
                          });
                          
                          if (onSuccess) {
                            onSuccess({
                              email: result.user.email,
                              name: result.user.name,
                              uid: result.user.uid,
                              photoURL: result.user.photoURL,
                              provider: 'facebook'
                            });
                          }
                        } else {
                          dispatch({
                            type: actions.ADD_NOTIFICATION,
                            payload: {
                              type: 'error',
                              title: 'Facebook Sign In Failed',
                              message: result.error
                            }
                          });
                        }
                      } catch (error) {
                        dispatch({
                          type: actions.ADD_NOTIFICATION,
                          payload: {
                            type: 'error',
                            title: 'Authentication Error',
                            message: 'Failed to sign in with Facebook. Please try again.'
                          }
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                    className="w-full text-sm py-2"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>
            </div>
            )}

            {/* Toggle Auth Mode - Only show for regular login/signup */}
            {!isForgotPassword && !isResetPassword && (
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
            )}

            {/* Additional Help Text for Forgot Password */}
            {isForgotPassword && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({
                        type: actions.ADD_NOTIFICATION,
                        payload: {
                          type: 'info',
                          title: 'Demo Mode',
                          message: 'In demo mode, the reset link is automatically simulated.'
                        }
                      });
                    }}
                    className="text-primary-500 hover:text-primary-600 transition-colors underline"
                  >
                    contact support
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
