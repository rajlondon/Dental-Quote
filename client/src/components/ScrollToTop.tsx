import { useEffect } from 'react';
import { useLocation } from 'wouter';

const ScrollToTop = () => {
  const [location] = useLocation();
  
  useEffect(() => {
    // Use requestAnimationFrame to avoid potential issues
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [location]);

  return null;
};

export default ScrollToTop;
