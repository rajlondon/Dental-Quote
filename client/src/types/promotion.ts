export interface Promotion {
  id: string;
  code: string;
  title: string;
  description?: string;
  discount_type: 'PERCENT' | 'FIXED';
  discount_value: number;
  start_date: string;
  end_date: string;
  max_uses?: number;
  use_count?: number;
  clinic_id?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PromotionFormData {
  code: string;
  title: string;
  description?: string;
  discount_type: 'PERCENT' | 'FIXED';
  discount_value: number | string;
  start_date: string;
  end_date: string;
  max_uses?: number | string;
  clinic_id?: string;
  is_active: boolean;
}