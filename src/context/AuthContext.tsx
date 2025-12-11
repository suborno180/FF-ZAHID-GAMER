import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: 'user' | 'seller' | 'admin' | null;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'user' | 'seller' | 'admin' | null>(null);

  const getUserRole = async (user: User | null): Promise<'user' | 'seller' | 'admin' | null> => {
    if (!user) return null;

    // Try to get role from user_details table first (up to 3 retries)
    let retries = 3;
    while (retries > 0) {
      try {
        const { data, error } = await supabase
          .from('user_details')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data?.role) {
          return data.role as 'user' | 'seller' | 'admin';
        }

        // If no role in user_details, try users table
        if (!error) {
          const { data: usersData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          if (usersData?.role) {
            return usersData.role as 'user' | 'seller' | 'admin';
          }
          break;
        }
      } catch (err) {
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }

    // Fallback to metadata or default to 'user'
    const role = user.user_metadata?.role || user.app_metadata?.role || 'user';
    return role as 'user' | 'seller' | 'admin';
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!error) {
        setSession(session);
        setUser(session?.user ?? null);
        const role = await getUserRole(session?.user ?? null);
        setUserRole(role);
      }
      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        const role = await getUserRole(session?.user ?? null);
        setUserRole(role);
      }
      setLoading(false);
    });

    // Periodic role refresh every 5 minutes to keep it in sync
    const roleRefreshInterval = setInterval(async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        const role = await getUserRole(currentSession.user);
        setUserRole(role);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Debounce timer for visibility/focus handlers
    let debounceTimer: number | null = null;

    // Handle page visibility change (when user returns to tab/app)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Clear any existing timer
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        // Debounce the session refresh to avoid rapid state updates
        debounceTimer = setTimeout(async () => {
          const { data: { session: currentSession } } = await supabase.auth.getSession();

          // Only update state if the session actually changed
          setSession(prevSession => {
            if (JSON.stringify(prevSession) !== JSON.stringify(currentSession)) {
              return currentSession;
            }
            return prevSession;
          });

          setUser(prevUser => {
            const newUser = currentSession?.user ?? null;
            if (prevUser?.id !== newUser?.id) {
              return newUser;
            }
            return prevUser;
          });

          // Only fetch role if user changed
          if (currentSession?.user) {
            const role = await getUserRole(currentSession.user);
            setUserRole(prevRole => prevRole !== role ? role : prevRole);
          } else if (!currentSession) {
            setUserRole(null);
          }
        }, 300); // 300ms debounce
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle window focus (when browser window comes back)
    const handleFocus = () => {
      // Clear any existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Debounce the session refresh
      debounceTimer = setTimeout(async () => {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        // Only update state if the session actually changed
        setSession(prevSession => {
          if (JSON.stringify(prevSession) !== JSON.stringify(currentSession)) {
            return currentSession;
          }
          return prevSession;
        });

        setUser(prevUser => {
          const newUser = currentSession?.user ?? null;
          if (prevUser?.id !== newUser?.id) {
            return newUser;
          }
          return prevUser;
        });

        // Only fetch role if user changed
        if (currentSession?.user) {
          const role = await getUserRole(currentSession.user);
          setUserRole(prevRole => prevRole !== role ? role : prevRole);
        } else if (!currentSession) {
          setUserRole(null);
        }
      }, 300); // 300ms debounce
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      subscription.unsubscribe();
      clearInterval(roleRefreshInterval);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);


  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error ? error.message : null };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'user' // Default role for new users
        }
      }
    });
    return { error: error ? error.message : null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    return { error: error ? error.message : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        userRole,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
