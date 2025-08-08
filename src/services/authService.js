import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Auth providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];
    
    // Listen to auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.authStateListeners.forEach(callback => callback(user));
    });
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.authStateListeners = this.authStateListeners.filter(cb => cb !== callback);
    };
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Sign up with email and password
  async signUp(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Create user document in Firestore
      await this.createUserDocument(user, { displayName });

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: displayName || user.displayName,
          emailVerified: user.emailVerified,
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update last login time
      await this.updateUserDocument(user.uid, {
        lastLoginAt: new Date().toISOString()
      });

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          emailVerified: user.emailVerified
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Create or update user document
      await this.createUserDocument(user, {
        provider: 'google',
        lastLoginAt: new Date().toISOString()
      });

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Sign in with Facebook
  async signInWithFacebook() {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      // Create or update user document
      await this.createUserDocument(user, {
        provider: 'facebook',
        lastLoginAt: new Date().toISOString()
      });

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Send password reset email
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Update password
  async updatePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      // Re-authenticate user before updating password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Update user profile
  async updateProfile(updates) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      // Update Firebase Auth profile
      if (updates.displayName !== undefined) {
        await updateProfile(user, { displayName: updates.displayName });
      }

      // Update Firestore document
      await this.updateUserDocument(user.uid, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Create user document in Firestore
  async createUserDocument(user, additionalData = {}) {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = new Date().toISOString();

      try {
        await setDoc(userRef, {
          displayName: displayName || additionalData.displayName || '',
          email,
          photoURL: photoURL || '',
          createdAt,
          updatedAt: createdAt,
          preferences: {
            theme: 'system',
            notifications: true,
            analytics: true
          },
          stats: {
            totalConversions: 0,
            lastConversionAt: null
          },
          ...additionalData
        });
      } catch (error) {
        console.error('Error creating user document:', error);
      }
    }

    return userRef;
  }

  // Update user document in Firestore
  async updateUserDocument(uid, updates) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user document:', error);
    }
  }

  // Get user document from Firestore
  async getUserDocument(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting user document:', error);
      return null;
    }
  }

  // Track conversion for authenticated users
  async trackConversion(conversionData) {
    if (!this.currentUser) return;

    try {
      // Import firestoreService dynamically to avoid circular dependency
      const { default: firestoreService } = await import('./firestoreService');
      
      // Save detailed conversion record
      await firestoreService.saveConversionRecord(conversionData, this.currentUser.uid);
      
      // Legacy stats update for backward compatibility
      await this.updateUserDocument(this.currentUser.uid, {
        'stats.totalConversions': (await this.getUserDocument(this.currentUser.uid))?.stats?.totalConversions + 1 || 1,
        'stats.lastConversionAt': new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  }

  // Get user-friendly error messages
  getErrorMessage(error) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed. Please try again.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/requires-recent-login':
        return 'Please sign in again to complete this action.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;