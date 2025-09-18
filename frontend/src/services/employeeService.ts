import api from '../api/api'; // Adjust the import path as needed
import { type AxiosInstance, type AxiosResponse } from 'axios'; // Type-only imports for verbatimModuleSyntax
import type { Employee,EmployeeData } from '../types/model';


// Interface for validation result
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Employee Service
 * Handles all employee-related API calls
 */
class EmployeeService {
  private api: AxiosInstance = api; // Reference to axios instance

  /**
   * Create a new employee with optional file uploads
   * @param employeeData - Employee creation data wrapped in FormData
   * @returns Created employee
   */
  async createEmployee(employeeData: globalThis.FormData): Promise<Employee> {
    try {
      const response: AxiosResponse<Employee> = await this.api.post('/employees', employeeData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating employee:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create employee';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all employees
   * @returns Array of employee objects
   */
  async getAllEmployees(): Promise<Employee[]> {
    try {
      const response: AxiosResponse<Employee[]> = await this.api.get('/employees');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch employees';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get employee by ID
   * @param id - Employee's ID
   * @returns Employee object or null if not found
   */
  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const response: AxiosResponse<Employee> = await this.api.get(`/employees/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Employee not found
      }
      console.error('Error fetching employee by ID:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch employee';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update employee
   * @param id - Employee's ID
   * @param updateData - Employee update data wrapped in FormData
   * @returns Updated employee
   */
  async updateEmployee(id: string, updateData: globalThis.FormData): Promise<Employee> {
    try {
      const response: AxiosResponse<Employee> = await this.api.put(`/employees/${id}`, updateData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating employee:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to update employee';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete employee
   * @param id - Employee's ID
   * @returns Promise resolving to void
   */
  async deleteEmployee(id: string): Promise<void> {
    try {
      await this.api.delete(`/employees/${id}`);
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to delete employee';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate employee data before sending to backend
   * @param employeeData - Employee data to validate
   * @returns Validation result with isValid boolean and errors array
   */
  validateEmployeeData(employeeData: EmployeeData): ValidationResult {
    const errors: string[] = [];

    if (!employeeData.first_name?.trim()) {
      errors.push('First name is required');
    }
    if (!employeeData.last_name?.trim()) {
      errors.push('Last name is required');
    }
    if (!employeeData.email?.trim()) {
      errors.push('Email is required');
    }
    if (!employeeData.phone?.trim()) {
      errors.push('Phone number is required');
    }
    if (!employeeData.position?.trim()) {
      errors.push('Position is required');
    }
    if (!employeeData.departmentId?.trim()) {
      errors.push('Department ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate employee ID format
   * @param id - Employee ID to validate
   * @returns True if ID format is valid
   */
  isValidId(id: string): boolean {
    return Boolean(id && typeof id === 'string' && id.trim().length > 0);
  }

  /**
   * Check if employee exists by ID
   * @param id - Employee's ID
   * @returns True if employee exists, false otherwise
   */
  async employeeExists(id: string): Promise<boolean> {
    try {
      const employee = await this.getEmployeeById(id);
      return employee !== null;
    } catch {
      return false;
    }
  }
}

// Create and export a singleton instance
const employeeService = new EmployeeService();
export default employeeService;

// Named exports for individual methods
export const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  validateEmployeeData,
  employeeExists,
} = employeeService;
