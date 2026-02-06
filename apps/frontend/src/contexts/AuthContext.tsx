'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { getAccessToken, parseJwt, refreshAccessToken } from '@/lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  accessScopes: string[];
  loading: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessScopes, setAccessScopes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    console.log('[AuthProvider] Checking auth...');
    setLoading(true);

    try {
      let token = getAccessToken();

      // 如果没有 token，尝试刷新
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
          isAdmin: scopes.includes('ADMIN_SCOPE'),
        });

        setIsAuthenticated(true);
        setAccessScopes(scopes);
        setIsAdmin(scopes.includes('ADMIN_SCOPE'));
      } else {
        console.log('[AuthProvider] No token available');
        setIsAuthenticated(false);
        setAccessScopes([]);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('[AuthProvider] Auth check failed:', error);
      setIsAuthenticated(false);
      setAccessScopes([]);
      setIsAdmin(false);
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
        isAdmin,
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
