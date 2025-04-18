// Default empty EmailJS configuration
export const EMAILJS_CONFIG = {
  serviceId: '',
  templateId: '',
  publicKey: ''
};

// Load the EmailJS configuration from the server
// This avoids issues with Vite environment variables not being accessible
export async function loadEmailJSConfig() {
  try {
    // Add cache busting parameter to avoid cached responses
    const response = await fetch('/api/config/emailjs?t=' + Date.now());
    if (!response.ok) {
      throw new Error(`Error fetching EmailJS config: ${response.status}`);
    }
    
    const config = await response.json();
    
    // Verify that all required fields are present
    if (!config.serviceId || !config.templateId || !config.publicKey) {
      console.warn('EmailJS configuration incomplete:', {
        serviceIdAvailable: !!config.serviceId,
        templateIdAvailable: !!config.templateId,
        publicKeyAvailable: !!config.publicKey
      });
    }
    
    // Update the configuration
    EMAILJS_CONFIG.serviceId = config.serviceId || '';
    EMAILJS_CONFIG.templateId = config.templateId || '';
    EMAILJS_CONFIG.publicKey = config.publicKey || '';
    
    // Log config status for debugging
    console.log('EmailJS Config Loaded:', {
      serviceIdAvailable: !!EMAILJS_CONFIG.serviceId,
      templateIdAvailable: !!EMAILJS_CONFIG.templateId,
      publicKeyAvailable: !!EMAILJS_CONFIG.publicKey
    });
    
    return config;
  } catch (error) {
    console.error('Failed to load EmailJS configuration:', error);
    return null;
  }
}

// Load the configuration immediately
loadEmailJSConfig();