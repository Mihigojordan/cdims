/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import authService, {
  type User,
  type AuthResponse,
} from '../services/authService';

export interface AuthContextType {
  user: User | null;
  login: (data: LoginData) => Promise<AuthResponse>;
  logout: () => Promise<unknown>;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface LoginData {
  email: string;
  password: string;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => Promise.resolve({} as AuthResponse),
  logout: () => Promise.resolve(),
  updateProfile: () => Promise.resolve({} as User),
  isAuthenticated: false,
  isLoading: true,
});

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const updateAuthState = (authData: AuthState) => {
    setUser(authData.user);
    setIsAuthenticated(authData.isAuthenticated);
  };

  const login = async (data: LoginData): Promise<AuthResponse> => {
    try {
      console.log(data);
      
      const response = await authService.login(data);

      if (response.success && response.data?.user) {
        updateAuthState({
          user: response.data.user,
          isAuthenticated: true,
        });
      }

      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const logout = async (): Promise<unknown> => {
    try {
      const response = await authService.logout();
      updateAuthState({ user: null, isAuthenticated: false });
      return response;
    } catch (error: any) {
      updateAuthState({ user: null, isAuthenticated: false });
      throw new Error(error.message);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    try {
      const updatedUser = await authService.updateProfile(updates);
      updateAuthState({
        user: updatedUser,
        isAuthenticated: true,
      });
      return updatedUser;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const userProfile = await authService.getProfile();

      if (userProfile) {
        updateAuthState({
          user: userProfile,
          isAuthenticated: true,
        });
      } else {
        updateAuthState({ user: null, isAuthenticated: false });
      }
    } catch {
      updateAuthState({ user: null, isAuthenticated: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const values: AuthContextType = {
    login,
    logout,
    updateProfile,
    user,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
  );
};

export default function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthContextProvider');
  }
  return context;
}
