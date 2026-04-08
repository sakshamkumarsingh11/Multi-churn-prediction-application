import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state changes and fetch Firestore profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || '',
              email: data.email || firebaseUser.email,
              createdAt: data.createdAt || firebaseUser.metadata.creationTime,
            });
          } else {
            // Firestore doc doesn't exist yet (edge case), use Firebase Auth data
            setUser({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || '',
              email: firebaseUser.email,
              createdAt: firebaseUser.metadata.creationTime,
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to Firebase Auth data
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || '',
            email: firebaseUser.email,
            createdAt: firebaseUser.metadata.creationTime,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (name, email, password) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      // Set the display name on the Firebase user profile
      await updateProfile(credential.user, { displayName: name });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', credential.user.uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
      });

      setUser({
        uid: credential.user.uid,
        name: name,
        email: credential.user.email,
        createdAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: getFirebaseErrorMessage(error.code) };
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle fetching the Firestore profile
      return { success: true };
    } catch (error) {
      return { success: false, message: getFirebaseErrorMessage(error.code) };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, message: getFirebaseErrorMessage(error.code) };
    }
  };

  const updateUser = async (updates) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Update Firebase Auth profile
      if (updates.name) {
        await updateProfile(currentUser, { displayName: updates.name });
      }
      if (updates.email && updates.email !== currentUser.email) {
        await updateEmail(currentUser, updates.email);
      }

      // Update Firestore document
      const userRef = doc(db, 'users', currentUser.uid);
      const firestoreUpdates = {};
      if (updates.name) firestoreUpdates.name = updates.name;
      if (updates.email) firestoreUpdates.email = updates.email;

      if (Object.keys(firestoreUpdates).length > 0) {
        await updateDoc(userRef, firestoreUpdates);
      }

      setUser((prev) => ({
        ...prev,
        name: updates.name || prev.name,
        email: updates.email || prev.email,
      }));
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  };

  const value = { user, loading, signup, login, logout, updateUser, resetPassword };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Map Firebase error codes to user-friendly messages
function getFirebaseErrorMessage(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/requires-recent-login':
      return 'Please log out and log back in to update your email.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
