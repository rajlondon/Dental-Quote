import { z } from "zod";

// Define notification priority levels
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

// Define notification categories
export type NotificationCategory = 
  | 'appointment' 
  | 'treatment' 
  | 'message' 
  | 'payment' 
  | 'document' 
  | 'system' 
  | 'offer';

// Define notification status
export type NotificationStatus = 'unread' | 'read' | 'archived';

// Define notification target audiences
export type NotificationTarget = 'patient' | 'clinic' | 'admin' | 'all';

// Base notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  status: NotificationStatus;
  created_at: string;
  target_type: NotificationTarget;
  target_id?: string; // Optional specific target ID (user, clinic, etc.)
  source_type: 'patient' | 'clinic' | 'admin' | 'system';
  source_id?: string; // Optional specific source ID
  action_url?: string; // Optional URL to navigate to when clicked
  expires_at?: string; // Optional expiration date
  metadata?: Record<string, any>; // Optional additional data
}

// Define notification creation schema (for validation)
export const createNotificationSchema = z.object({
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  category: z.enum(['appointment', 'treatment', 'message', 'payment', 'document', 'system', 'offer']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  target_type: z.enum(['patient', 'clinic', 'admin', 'all']),
  target_id: z.string().optional(),
  source_type: z.enum(['patient', 'clinic', 'admin', 'system']),
  source_id: z.string().optional(),
  action_url: z.string().url().optional(),
  expires_at: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Type for creating a notification
export type CreateNotification = z.infer<typeof createNotificationSchema>;

// Type for notification update
export interface UpdateNotification {
  id: string;
  status?: NotificationStatus;
  read_at?: string;
}

// Type for notification response from server
export interface NotificationResponse {
  notifications: Notification[];
  unread_count: number;
}