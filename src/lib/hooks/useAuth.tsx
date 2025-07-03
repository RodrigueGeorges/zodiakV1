import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../supabase';
import { StorageService } from '../storage';
import type { Profile } from '../types/supabase';
import type { AuthSession, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  session: AuthSession | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<Profile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const refreshProfile = async () => {
    if (session?.user) {
      const userProfile = await StorageService.getProfile(session.user.id);
      setProfile(userProfile);
      return userProfile;
    }
    return null;
  };

  const _handleAuthStateChange = async (event: string, _session: AuthSession | null) => {
    if (event === 'SIGNED_IN' && _session?.user) {
      setUser(_session.user);
      setIsAuthenticated(true);
      await loadProfile(_session.user.id);
    } else if (event === 'SIGNED_OUT') {
      setUser(null);
      setIsAuthenticated(false);
      setProfile(null);
      StorageService.clearUserCache(_session?.user?.id || '');
    }
    setIsLoading(false);
  };

  const loadProfile = async (userId: string) => {
    const userProfile = await StorageService.getProfile(userId);
    setProfile(userProfile);
  };

  useEffect(() => {
    const setData = async (session: AuthSession | null) => {
      setIsLoading(true);
      if (session?.user) {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        setSession(session);
        setUser(session.user);
        setIsAuthenticated(true);
        const userProfile = await StorageService.getProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setData(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        // Token invalide ou expiré
        navigate('/login', { replace: true });
      }
      
      setData(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signOut,
    isAuthenticated,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 