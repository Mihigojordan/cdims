import { type AxiosInstance, type AxiosResponse } from 'axios'; // Type-only imports for verbatimModuleSyntax
import api from '../api/api'; // Adjust the import path as needed

// Interface for User
export interface User {
  id: number;
  role_id: number;
  full_name: string;
  email: string;
  phone?: string;
  active: boolean;
  created_at?: Date;
  updated_at?: Date;
  role?: Role;
}

// Interface for Role
export interface Role {
  id: number;
  name: string;
  description?: string;
}

// Interfaces for input data
export type CreateUserInput = {
  role_id: number;
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  active?: boolean;
};

export type UpdateUserInput = Partial<{
  role_id: number;
  full_name: string;
  email: string;
  phone: string;
  active: boolean;
}>;

// Interface for filtering
interface FilterParams {
  page?: number;
  limit?: number;
  role?: string;
  active?: boolean;
}

// Interface for pagination response
interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

// Interface for validation result
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Interface for delete response
interface DeleteResponse {
  success: boolean;
  message: string;
}

/**
 * User Service
 * Handles all user and role-related API calls
 */
class UserService {
  private api: AxiosInstance = api; // Reference to axios instance

  /**
   * Get all users with optional filtering and pagination
   * @param params - Query parameters for filtering and pagination
   * @returns Object containing users array and pagination info
   */
  async getAllUsers(params?: FilterParams): Promise<{ users: User[]; pagination: Pagination }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.role) queryParams.append('role', params.role);
      if (params?.active !== undefined) queryParams.append('active', params.active.toString());

      const response: AxiosResponse<{ success: boolean; data: { users: User[]; pagination: Pagination } }> = 
        await this.api.get(`/users?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch users';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get user by ID
   * @param id - User ID
   * @returns User or null if not found
   */
  async getUserById(id: number | string): Promise<User | null> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { user: User } }> = 
        await this.api.get(`/users/${id}`);
      return response.data.data.user;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching user by ID:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch user';
      throw new Error(errorMessage);
    }
  }

  /**
   * Create a new user
   * @param userData - User data
   * @returns Created user
   */
  async createUser(userData: CreateUserInput): Promise<User> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { user: User }; message: string }> = 
        await this.api.post('/users', userData);
      return response.data.data.user;
    } catch (error: any) {
      console.error('Error creating user:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create user';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update a user
   * @param id - User ID
   * @param updateData - Data to update
   * @returns Updated user
   */
  async updateUser(id: number | string, updateData: UpdateUserInput): Promise<User> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { user: User }; message: string }> = 
        await this.api.put(`/users/${id}`, updateData);
      return response.data.data.user;
    } catch (error: any) {
      console.error('Error updating user:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update user';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete a user
   * @param id - User ID
   * @returns Response with success message
   */
  async deleteUser(id: number | string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = 
        await this.api.delete(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete user';
      throw new Error(errorMessage);
    }
  }

  /**
   * Toggle user active status
   * @param id - User ID
   * @param active - New active status
   * @returns Updated user
   */
  async toggleUserStatus(id: number | string, active: boolean): Promise<User> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { user: User }; message: string }> = 
        await this.api.put(`/users/${id}/toggle-status`, { active });
      return response.data.data.user;
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to toggle user status';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all roles
   * @returns Array of roles
   */
  async getRoles(): Promise<Role[]> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { roles: Role[] } }> = 
        await this.api.get('/users/roles');
      return response.data.data.roles;
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch roles';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate user data
   * @param data - User data to validate
   * @returns Validation result with isValid boolean and errors array
   */
  validateUserData(data: CreateUserInput): ValidationResult {
    const errors: string[] = [];

    if (!data.role_id) {
      errors.push('Role ID is required');
    }
    if (!data.full_name?.trim()) {
      errors.push('Full name is required');
    }
    if (!data.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }
    if (!data.password?.trim()) {
      errors.push('Password is required');
    }

    return { isValid: errors.length === 0, errors };
  }
}

// Singleton instance
const userService = new UserService();
export default userService;

// Named exports for individual methods
export const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getRoles,
  validateUserData,
} = userService;