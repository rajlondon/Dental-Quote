import { useEffect } from 'react';
import { reloadTranslations } from '../i18n';

export default function ReloadTranslations() {
  useEffect(() => {
    // Reload translations when the component mounts
    reloadTranslations();
  }, []);

  return null;
}