// Simple translation utility
export const t = (key: string, fallback: string, options?: any) => {
  // Return fallback for now - can be enhanced with actual i18n later
  if (options && options.name) {
    return fallback.replace('{name}', options.name);
  }
  return fallback;
};
