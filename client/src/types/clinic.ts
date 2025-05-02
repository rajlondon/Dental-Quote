import { User } from "./user";

export interface Clinic {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city: string;
  country: string;
  logo?: string;
  description?: string;
  website?: string;
  founded?: string;
  staffCount?: number;
  featured?: boolean;
  verified?: boolean;
  specialties?: string[];
  languages?: string[];
  accreditations?: string[];
  createdAt: string;
  updatedAt: string;
  
  // Relations
  staff?: User[];
  rating?: number;
  reviewCount?: number;
}