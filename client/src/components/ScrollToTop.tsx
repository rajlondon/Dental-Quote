import { useEffect } from 'react';
import { useLocation } from 'wouter';

// This component scrolls the window to the top whenever the route changes
const ScrollToTop = () => {
  const [location] = useLocation();
  
  useEffect(() => {
    // Scroll to the top of the page when location changes
    window.scrollTo(0, 0);
  }, [location]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;