import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, AuthContextType, UserProfile } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();
        
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: userData?.name || firebaseUser.displayName || '',
          createdAt: userData?.createdAt || new Date().toISOString(),
          profile: userData?.profile || {}
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/user-not-found') {
        throw new Error('User doesn\'t exist');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Wrong email id or password');
      } else {
        throw new Error(getFirebaseErrorMessage(error.code));
      }
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update the user's display name
      await firebaseUpdateProfile(firebaseUser, { displayName: name });

      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
        profile: {}
      });

    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Clear any local storage data
      localStorage.clear();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateProfile = async (profile: UserProfile) => {
    if (!user) return;

    try {
      // Update Firestore document
      await setDoc(doc(db, 'users', user.id), { profile }, { merge: true });

      // Update local state
      setUser(prev => prev ? { ...prev, profile } : null);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const getFirebaseErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'User doesn\'t exist';
      case 'auth/wrong-password':
        return 'Wrong email id or password';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password must be at least 8 characters long';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/invalid-credential':
        return 'Wrong email id or password';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      default:
        return 'An error occurred. Please try again';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
