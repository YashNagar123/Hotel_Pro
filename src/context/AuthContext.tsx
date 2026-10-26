import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiUser, authAPI } from '../services/api';

interface AuthContextType {
  user: ApiUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  quickLogin: (role: 'admin' | 'guest') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('hotel_pro_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('hotel_pro_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.user);
          setToken(storedToken);
        } catch {
          localStorage.removeItem('hotel_pro_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('hotel_pro_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string }) => {
    const res = await authAPI.register(payload);
    localStorage.setItem('hotel_pro_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const quickLogin = async (role: 'admin' | 'guest') => {
    if (role === 'admin') {
      await login('admin@hotelpro.com', 'Admin123!');
    } else {
      await login('guest@example.com', 'Guest123!');
    }
  };

  const logout = () => {
    localStorage.removeItem('hotel_pro_token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        quickLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
