/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../api/api';
import type { AxiosResponse } from 'axios';

interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: Role;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: {
    user: User;
  };
}

interface LoginData {
  email: string; // backend expects "email"
  password: string;
}

class AuthService {
  /**
   * Login user
   */
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post(
        '/api/auth/login',
        loginData
      );

      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('auth_token', response.data.data.token);
      }

      return response.data;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Login failed';
      throw new Error(msg);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User | null> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;

      const response: AxiosResponse<ProfileResponse> = await api.get(
        '/api/auth/profile',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.data.user;
    } catch (error: any) {
      if (error.response?.status === 401) return null;
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch profile';
      throw new Error(msg);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const token = localStorage.getItem('auth_token');
      const response: AxiosResponse<{ success: boolean; data: { user: User } }> =
        await api.put('/api/auth/profile', updates, {
          headers: { Authorization: `Bearer ${token}` },
        });

      return response.data.data.user;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to update profile';
      throw new Error(msg);
    }
  }

  /**
   * Change password
   */
  async changePassword(
    current_password: string,
    new_password: string
  ): Promise<string> {
    try {
      const token = localStorage.getItem('auth_token');
      const response: AxiosResponse<{ success: boolean; message: string }> =
        await api.put(
          '/api/auth/change-password',
          { current_password, new_password },
          { headers: { Authorization: `Bearer ${token}` } }
        );

      return response.data.message;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to change password';
      throw new Error(msg);
    }
  }

  /**
   * Reset password (request reset link)
   */
  async resetPassword(email: string): Promise<string> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> =
        await api.post('/api/auth/reset-password', { email });

      return response.data.message;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to reset password';
      throw new Error(msg);
    }
  }

  /**
   * Delete account
   */
  async deleteAccount(password: string): Promise<string> {
    try {
      const token = localStorage.getItem('auth_token');
      const response: AxiosResponse<{ success: boolean; message: string }> =
        await api.delete('/api/auth/delete-account', {
          headers: { Authorization: `Bearer ${token}` },
          data: { password }, // axios DELETE requires `data` for body
        });

      localStorage.removeItem('auth_token');
      return response.data.message;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete account';
      throw new Error(msg);
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<string> {
    try {
      const token = localStorage.getItem('auth_token');
      const response: AxiosResponse<{ success: boolean; message: string }> =
        await api.post(
          '/api/auth/logout',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

      localStorage.removeItem('auth_token');
      return response.data.message;
    } catch (error: any) {
      localStorage.removeItem('auth_token');
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to logout';
      throw new Error(msg);
    }
  }
}

const authService = new AuthService();
export default authService;
