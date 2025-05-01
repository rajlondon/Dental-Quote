import { useState, useEffect } from 'react';

/**
 * Custom hook for persistent state using localStorage
 * 
 * @param key - The key to store the value under in localStorage
 * @param initialValue - The initial value to use if no value is found in localStorage
 * @returns A stateful value and a function to update it, persisted to localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Initialize state with value from localStorage or initialValue
  const [state, setState] = useState<T>(() => {
    try {
      // Try to get the value from localStorage
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        // Parse stored json or if none return initialValue
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        if (state === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(state));
        }
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, state]);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(state) : value;
      
      // Save state
      setState(valueToStore);
    } catch (error) {
      console.error('Error setting state:', error);
    }
  };

  return [state, setValue];
}