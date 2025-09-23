// ========================================================================================================

// 5. ======/=> Client <=/========
export interface Client {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  profileImage?: string | null;
  createdAt: string; // ISO date string from backend
  updatedAt: string; // ISO date string from backend
}




export interface Store {
  id: number;
  code: string;
  name: string;
  location: string;
  description?: string;
  manager_name?: string;
  contact_phone?: string;
  contact_email?: string;
  created_at?: Date;
  updated_at?: Date;
}