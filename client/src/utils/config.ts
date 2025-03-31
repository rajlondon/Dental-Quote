// EmailJS configuration
export const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''
};

// Expose to console for debugging
console.log('EmailJS Config Loaded:', {
  serviceIdAvailable: !!EMAILJS_CONFIG.serviceId,
  templateIdAvailable: !!EMAILJS_CONFIG.templateId,
  publicKeyAvailable: !!EMAILJS_CONFIG.publicKey
});