/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import adminAuthService, {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type User,
  type AuthResponse,
} from '../services/adminAuthService';

interface Admin {
  id: string;
  adminName: string;
  adminEmail: string;
  phone?: string;
  role?: string;
  active?: boolean;
}

interface LoginData {
  identifier: string;
  password: string;
}

interface AdminAuthContextType {
  user: Admin | null;
  login: (data: LoginData) => Promise<AuthResponse>;
  logout: () => Promise<unknown>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  login: () => Promise.resolve({} as AuthResponse),
  logout: () => Promise.resolve(),
  isAuthenticated: false,
  isLoading: true,
});

interface AuthState {
  user: Admin | null;
  isAuthenticated: boolean;
}

interface AdminAuthContextProviderProps {
  children: ReactNode;
}

export const AdminAuthContextProvider: React.FC<
  AdminAuthContextProviderProps
> = ({ children }) => {
  const [user, setUser] = useState<Admin | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const updateAuthState = (authData: AuthState) => {
    setUser(authData.user);
    setIsAuthenticated(authData.isAuthenticated);
  };


  

  const login = async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await adminAuthService.adminLogin(data);

      if (response.success && response.data?.user) {
        localStorage.setItem('auth_token', response.data.token);

        const userProfile: Admin = {
          id: String(response.data.user.id),
          adminName: response.data.user.full_name,
          adminEmail: response.data.user.email,
          phone: response.data.user.phone,
          role: response.data.user.role.name,
          active: response.data.user.active,
        };

        // Authenticate only if user is active
        updateAuthState({
          user: userProfile,
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
      const response = await adminAuthService.logout();
      updateAuthState({ user: null, isAuthenticated: false });
      return response;
    } catch (error: any) {
      updateAuthState({ user: null, isAuthenticated: false });
      throw new Error(error.message);
    }
  };

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const userProfile = await adminAuthService.getAdminProfile();
      console.log(userProfile);
      
      if (userProfile) {

        const mappedUser: Admin = {
          id: String(userProfile.id),
          adminName: userProfile.full_name,
          adminEmail: userProfile.email,
          phone: userProfile.phone,
          role: userProfile.role.name,
          active: userProfile.active,
        };
        updateAuthState({
          user: mappedUser,
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

  const values: AdminAuthContextType = {
    login,
    logout,
    user,
    isLoading,
    isAuthenticated,
  };

  return (
    <AdminAuthContext.Provider value={values}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthContextProvider');
  }
  return context;
}
