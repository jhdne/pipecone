import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { authService, User, LoginCredentials, RegisterData } from '../services/auth';
import { useErrorHandler } from '../components/ErrorBoundary';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { handleError } = useErrorHandler();

  // 初始化认证状态
  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser && authService.isAuthenticated()) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const authResponse = await authService.login(credentials);
      setUser(authResponse.user);
    } catch (error) {
      handleError(error, 'Login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const authResponse = await authService.register(data);
      setUser(authResponse.user);
    } catch (error) {
      handleError(error, 'Register');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      handleError(error, 'Logout');
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = await authService.updateProfile(updates);
      setUser(updatedUser);
    } catch (error) {
      handleError(error, 'Update Profile');
      throw error;
    }
  }, [user, handleError]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };
};

export { AuthContext };
