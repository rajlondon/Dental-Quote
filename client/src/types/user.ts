export type UserRole = 'admin' | 'admin_staff' | 'clinic_admin' | 'clinic_staff' | 'patient';

export interface User {
  id: number;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  clinicId?: number;
  status?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser extends User {
  role: 'admin' | 'admin_staff';
}

export interface ClinicUser extends User {
  role: 'clinic_admin' | 'clinic_staff';
  clinicId: number;
}

export interface PatientUser extends User {
  role: 'patient';
  phone?: string;
  country?: string;
  city?: string;
  preferredLanguage?: string;
}