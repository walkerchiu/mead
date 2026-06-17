'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { getAccessToken, parseJwt, refreshAccessToken } from '@/lib/auth';
import { setErrorTrackingUser } from '@/lib/error-user-tracking';

interface AuthContextType {
  isAuthenticated: boolean;
  accessScopes: string[];
  loading: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessScopes, setAccessScopes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    console.log('[AuthProvider] Checking auth...');
    setLoading(true);

    try {
      let token = getAccessToken();

      // 如果没有 token，嘗試重新整理
      if (!token) {
        console.log('[AuthProvider] No token found, attempting refresh...');
        const refreshed = await refreshAccessToken('auth-context');
        if (refreshed) {
          token = getAccessToken();
        }
      }

      if (token) {
        const payload = parseJwt(token);
        const scopes = (payload?.accessScopes as string[]) || [];

        console.log('[AuthProvider] Auth check complete:', {
          isAuthenticated: true,
          scopes,
        });

        setIsAuthenticated(true);
        setAccessScopes(scopes);

        // Set user information for error tracking
        if (payload?.sub && payload?.email) {
          setErrorTrackingUser({
            id: payload.sub as string,
            email: payload.email as string,
            username: (payload.email as string).split('@')[0],
          });
        }
      } else {
        console.log('[AuthProvider] No token available');
        setIsAuthenticated(false);
        setAccessScopes([]);
      }
    } catch (error) {
      console.error('[AuthProvider] Auth check failed:', error);
      setIsAuthenticated(false);
      setAccessScopes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        accessScopes,
        loading,
        refreshAuth: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
