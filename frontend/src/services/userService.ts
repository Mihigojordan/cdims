import api from '../api/api';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role_id: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role_id: number;
  active: boolean;
}

export interface UpdateUserInput {
  full_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role_id?: number;
  active?: boolean;
}

const userService = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const token = localStorage.getItem('auth_token');
      const { data } = await api.get<User[]>('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  getUserById: async (id: string): Promise<User> => {
    try {
      const token = localStorage.getItem('auth_token');
      const { data } = await api.get<User>(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  createUser: async (data: CreateUserInput): Promise<User> => {
    try {
      const token = localStorage.getItem('auth_token');
      const { data: newUser } = await api.post<User>('/api/users', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return newUser;
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  },

  updateUser: async (id: string, data: UpdateUserInput): Promise<User> => {
    try {
      const token = localStorage.getItem('auth_token');
      const { data: updatedUser } = await api.put<User>(`/api/users/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return updatedUser;
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    try {
      const token = localStorage.getItem('auth_token');
      await api.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },
};

export default userService;
