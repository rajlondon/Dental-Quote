/**
 * Global API client configuration
 * This ensures consistent behavior across all axios requests
 */
import axios from 'axios';

// Create a pre-configured axios instance with consistent settings
export const api = axios.create({
  baseURL: '',
  withCredentials: true, // CRITICAL: This ensures cookies are sent with EVERY request
  headers: {
    'Content-Type': 'application/json',
  }
});

// Configure global defaults for all axios instances
// This affects both our api instance and any direct axios usage
axios.defaults.withCredentials = true;

// Export for convenience
export default api;