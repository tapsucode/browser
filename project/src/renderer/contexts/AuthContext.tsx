import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../../common/types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-login for development
    const defaultUser: User = {
      id: 'default-user-id',
      username: 'Demo User',
      email: 'demo@example.com'
    };
    setCurrentUser(defaultUser);
    localStorage.setItem('user', JSON.stringify(defaultUser));
    setIsLoading(false);
  }, []);

  const login = async (_username: string, _password: string): Promise<boolean> => {
    // Auto-login always succeeds
    return true;
  };

  const register = async (_username: string, _email: string, _password: string): Promise<boolean> => {
    // Auto-register always succeeds
    return true;
  };

  const logout = (): void => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};