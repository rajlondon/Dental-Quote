// Simple toast hook to display notifications
export type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
};

type ToastContextType = {
  toast: (props: ToastProps) => void;
};

// Global toast state
let toasts: Array<ToastProps & { id: string }> = [];
let listeners: Array<(toasts: Array<ToastProps & { id: string }>) => void> = [];

// Update all listeners with current toasts
const updateListeners = () => {
  listeners.forEach((listener) => {
    listener([...toasts]);
  });
};

// Add a new toast to the state
const addToast = (props: ToastProps) => {
  const id = Math.random().toString(36).substring(2, 9);
  toasts = [...toasts, { ...props, id }];
  
  updateListeners();
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    dismissToast(id);
  }, 5000);
  
  return id;
};

// Remove a toast from the state
const dismissToast = (id: string) => {
  toasts = toasts.filter((toast) => toast.id !== id);
  updateListeners();
};

// Subscribe to toast updates
const subscribeToToasts = (callback: (toasts: Array<ToastProps & { id: string }>) => void) => {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((listener) => listener !== callback);
  };
};

// Toast hook for components
export const useToast = (): ToastContextType => {
  return {
    toast: addToast,
  };
};

// For components that need to access current toasts
export const useToasts = () => {
  const [currentToasts, setCurrentToasts] = useState<Array<ToastProps & { id: string }>>([]);
  
  useEffect(() => {
    // Subscribe to toast updates
    const unsubscribe = subscribeToToasts(setCurrentToasts);
    
    // Initial state
    setCurrentToasts([...toasts]);
    
    // Cleanup
    return unsubscribe;
  }, []);
  
  return {
    toasts: currentToasts,
    dismiss: dismissToast,
  };
};

// Import React hooks to make TypeScript happy
import { useState, useEffect } from 'react';