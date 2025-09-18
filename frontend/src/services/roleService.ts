import api from '../api/api';

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface CreateRoleInput {
  name: string;
  description: string;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
}

const roleService = {
  getAllRoles: async (): Promise<Role[]> => {
    try {
      const token = localStorage.getItem('auth_token');
      const { data } = await api.get<Role[]>('/users/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch roles');
    }
  },

  getRoleById: async (id: number): Promise<Role> => {
    try {
      const token = localStorage.getItem('auth_token');
      const { data } = await api.get<Role>(`/users/roles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (error: any) {
      console.error('Error fetching role:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch role');
    }
  },

  createRole: async (data: CreateRoleInput): Promise<Role> => {
    try {
      const token = localStorage.getItem('auth_token');
      const { data: newRole } = await api.post<Role>('/users/roles', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return newRole;
    } catch (error: any) {
      console.error('Error creating role:', error);
      throw new Error(error.response?.data?.message || 'Failed to create role');
    }
  },

  updateRole: async (id: number, data: UpdateRoleInput): Promise<Role> => {
    try {
      const token = localStorage.getItem('auth_token');
      const { data: updatedRole } = await api.put<Role>(`/users/roles/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return updatedRole;
    } catch (error: any) {
      console.error('Error updating role:', error);
      throw new Error(error.response?.data?.message || 'Failed to update role');
    }
  },

  deleteRole: async (id: number): Promise<void> => {
    try {
      const token = localStorage.getItem('auth_token');
      await api.delete(`/users/roles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error: any) {
      console.error('Error deleting role:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete role');
    }
  },
};

export default roleService;
