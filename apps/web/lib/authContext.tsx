'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, db, googleProvider } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type UserRole = 'citizen' | 'department_staff' | 'admin' | 'superadmin' | 'super_admin' | 'worker';

export interface AppUser {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  workerBadgeId?: string;
}

const DEFAULT_SUPERADMINS = [
  'aniketpandey7599@gmail.com',
  'superadmin@civicpulse.org',
  'ayushsingh6394871986@gmail.com',
  'aniketpandey077@gmail.com',
  'admin@jaipurmc.org',
  'admin@civicpulse.org'
];

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  isAdmin: boolean;
  role: UserRole;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: string | null; user?: AppUser }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null; user?: AppUser }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error: string | null; user?: AppUser }>;
  signInAsDemo: (role?: UserRole) => Promise<{ error: string | null; user?: AppUser }>;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<UserRole>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Helper to fetch the official role from Firestore users collection */
async function fetchUserRoleFromFirestore(email: string, name: string): Promise<UserRole> {
  if (!email) return 'citizen';
  const cleanEmail = email.toLowerCase().trim();
  const isDefaultAdmin = DEFAULT_SUPERADMINS.includes(cleanEmail);

  try {
    const userDocRef = doc(db, 'users', cleanEmail);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data();
      if (data && data.role) {
        return (data.role as UserRole) || (isDefaultAdmin ? 'superadmin' : 'citizen');
      }
    }

    // Default role assignment
    const assignedRole: UserRole = isDefaultAdmin ? 'superadmin' : 'citizen';
    await setDoc(
      userDocRef,
      {
        name: name || cleanEmail.split('@')[0] || 'Citizen',
        email: cleanEmail,
        role: assignedRole,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );

    return assignedRole;
  } catch (err) {
    console.warn('[authContext] Firestore role check note:', err);
    return isDefaultAdmin ? 'superadmin' : 'citizen';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if demo user saved locally
    if (typeof window !== 'undefined') {
      const savedDemo = localStorage.getItem('civic_demo_user');
      if (savedDemo) {
        try {
          setUser(JSON.parse(savedDemo));
          setLoading(false);
        } catch (e) {}
      }
    }

    // Listen for Firebase auth state changes in real-time
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email) {
        const name = fbUser.displayName || fbUser.email.split('@')[0] || 'Citizen';
        const role = await fetchUserRoleFromFirestore(fbUser.email, name);

        const appUser: AppUser = {
          id: fbUser.uid,
          email: fbUser.email,
          displayName: name,
          photoURL: fbUser.photoURL,
          role: role,
        };
        setUser(appUser);
        setFirebaseUser(fbUser);
      } else {
        if (typeof window !== 'undefined' && !localStorage.getItem('civic_demo_user')) {
          setUser(null);
          setFirebaseUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshRole = useCallback(async (): Promise<UserRole> => {
    if (!user?.email) return 'citizen';
    const updatedRole = await fetchUserRoleFromFirestore(user.email, user.displayName || '');
    setUser(prev => prev ? { ...prev, role: updatedRole } : null);
    return updatedRole;
  }, [user]);

  // 1. Google 1-Click Popup Login
  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const name = fbUser.displayName || fbUser.email?.split('@')[0] || 'Citizen';
      const role = await fetchUserRoleFromFirestore(fbUser.email || '', name);

      const appUser: AppUser = {
        id: fbUser.uid,
        email: fbUser.email,
        displayName: name,
        photoURL: fbUser.photoURL,
        role: role,
      };
      setUser(appUser);
      return { error: null, user: appUser };
    } catch (err: any) {
      console.error('[Firebase Auth] Google login error:', err);
      let msg = err.message || 'Google Sign-In failed';
      if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in cancelled';
      } else if (err.code === 'auth/cancelled-popup-request') {
        msg = 'Another popup is already open';
      }
      return { error: msg };
    }
  }, []);

  // 2. Email + Password Sign In
  const signInWithPassword = useCallback(async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = result.user;
      const name = fbUser.displayName || fbUser.email?.split('@')[0] || 'Citizen';
      const role = await fetchUserRoleFromFirestore(fbUser.email || email, name);

      const appUser: AppUser = {
        id: fbUser.uid,
        email: fbUser.email,
        displayName: name,
        photoURL: fbUser.photoURL,
        role: role,
      };
      setUser(appUser);
      return { error: null, user: appUser };
    } catch (err: any) {
      let msg = err.message || 'Invalid credentials';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email or password';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address';
      }
      return { error: msg };
    }
  }, []);

  // 3. Email + Password Sign Up
  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = result.user;
      const name = email.split('@')[0] || 'Citizen';
      const role = await fetchUserRoleFromFirestore(email, name);

      const appUser: AppUser = {
        id: fbUser.uid,
        email: fbUser.email,
        displayName: name,
        photoURL: null,
        role: role,
      };
      setUser(appUser);
      return { error: null, user: appUser };
    } catch (err: any) {
      let msg = err.message || 'Registration failed';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Account already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      return { error: msg };
    }
  }, []);

  // 4. Instant Demo Multi-Role Login (Worker / Citizen / Admin)
  const signInAsDemo = useCallback(async (customRole: UserRole = 'citizen') => {
    let demoEmail = 'citizen.punjab@gov.in';
    let demoName = 'Gurpreet Singh (Verified Citizen)';
    let workerBadgeId: string | undefined = undefined;

    if (customRole === 'worker' || customRole === 'department_staff') {
      demoEmail = 'ramesh.worker@jaipurmc.org';
      demoName = 'Ramesh Kumar (Swachhata Field Lead)';
      workerBadgeId = 'MC-SWM-2026-882';
    } else if (customRole === 'admin' || customRole === 'superadmin') {
      demoEmail = 'admin@jaipurmc.org';
      demoName = 'Er. Rajesh Meena (Zonal Executive Officer)';
    }

    const appUser: AppUser = {
      id: `demo-${customRole}-uid-${Date.now()}`,
      email: demoEmail,
      displayName: demoName,
      photoURL: null,
      role: customRole,
      workerBadgeId,
    };
    setUser(appUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('civic_demo_user', JSON.stringify(appUser));
    }
    return { error: null, user: appUser };
  }, []);

  // 5. Sign Out
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {}
    setUser(null);
    setFirebaseUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('civic_demo_user');
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    return { error: null };
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string) => {
    return { error: null };
  }, []);

  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'superadmin' ||
    user?.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAdmin,
        role: user?.role || 'citizen',
        loading,
        signInWithGoogle,
        signInWithPassword,
        signUpWithPassword,
        signInAsDemo,
        signInWithEmail,
        verifyOtp,
        signOut,
        refreshRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
