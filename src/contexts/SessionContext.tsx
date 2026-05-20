import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface SessionContextType {
  session: Session | null;
  loading: boolean;
  getRedirectPath: () => string;
  updateActivity: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getRedirectPath = useCallback(() => {
    // Simple logic: if logged in, go to dashboard.
    // Can be expanded to handle "return to" URL
    return '/admin/dashboard';
  }, []);

  const updateActivity = useCallback(() => {
    // Placeholder for activity tracking logic
    console.log('User activity updated');
  }, []);

  return (
    <SessionContext.Provider value={{ session, loading, getRedirectPath, updateActivity }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionManager = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessionManager must be used within a SessionProvider');
  }
  return context;
};