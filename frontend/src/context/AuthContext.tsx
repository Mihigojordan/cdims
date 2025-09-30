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
  requiresPasswordChange: boolean; // Add this field
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
  requiresPasswordChange: false,
});

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  requiresPasswordChange?: boolean;
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
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  const updateAuthState = (authData: AuthState) => {
    setUser(authData.user);
    setIsAuthenticated(authData.isAuthenticated);
    setRequiresPasswordChange(authData.requiresPasswordChange || authData.user?.first_login || false);
  };

  const login = async (data: LoginData): Promise<AuthResponse> => {
    try {
      console.log(data);
     
      const response = await authService.login(data);
      if (response.success && response.data?.user) {
        updateAuthState({
          user: response.data.user,
          isAuthenticated: true,
          requiresPasswordChange: response.data.user.first_login || false,
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
      updateAuthState({ 
        user: null, 
        isAuthenticated: false,
        requiresPasswordChange: false 
      });
      return response;
    } catch (error: any) {
      updateAuthState({ 
        user: null, 
        isAuthenticated: false,
        requiresPasswordChange: false 
      });
      throw new Error(error.message);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    try {
      const updatedUser = await authService.updateProfile(updates);
      updateAuthState({
        user: updatedUser,
        isAuthenticated: true,
        requiresPasswordChange: updatedUser.first_login || false,
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
          requiresPasswordChange: userProfile.first_login || false,
        });
      } else {
        updateAuthState({ 
          user: null, 
          isAuthenticated: false,
          requiresPasswordChange: false 
        });
      }
    } catch {
      updateAuthState({ 
        user: null, 
        isAuthenticated: false,
        requiresPasswordChange: false 
      });
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
    requiresPasswordChange,
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