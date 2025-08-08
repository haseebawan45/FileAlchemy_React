import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          isAnonymous: firebaseUser.isAnonymous
        });
      } else {
        // User is signed out
        setUser(null);
      }
      
      setLoading(false);
      setInitialized(true);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  // Sign up function
  const signUp = async (email, password, displayName) => {
    setLoading(true);
    try {
      const result = await authService.signUp(email, password, displayName);
      return result;
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await authService.signInWithGoogle();
      return result;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Facebook
  const signInWithFacebook = async () => {
    setLoading(true);
    try {
      const result = await authService.signInWithFacebook();
      return result;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    try {
      const result = await authService.signOut();
      return result;
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    const result = await authService.resetPassword(email);
    return result;
  };

  // Update password function
  const updatePassword = async (currentPassword, newPassword) => {
    const result = await authService.updatePassword(currentPassword, newPassword);
    return result;
  };

  // Update profile function
  const updateProfile = async (updates) => {
    const result = await authService.updateProfile(updates);
    if (result.success && user) {
      // Update local user state
      setUser(prev => ({
        ...prev,
        ...updates
      }));
    }
    return result;
  };

  // Get user document from Firestore
  const getUserDocument = async () => {
    if (!user) return null;
    return await authService.getUserDocument(user.uid);
  };

  // Track conversion for authenticated users
  const trackConversion = async (conversionData) => {
    if (user) {
      await authService.trackConversion(conversionData);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Check if user can access premium features
  const canAccessPremiumFeatures = () => {
    // For now, all authenticated users get premium features
    // This can be extended with subscription logic later
    return isAuthenticated();
  };

  const value = {
    // State
    user,
    loading,
    initialized,
    
    // Auth methods
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    
    // Utility methods
    isAuthenticated,
    canAccessPremiumFeatures,
    getUserDocument,
    trackConversion
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};