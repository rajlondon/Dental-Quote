import React, { useEffect } from "react";

interface RTLProviderProps {
  children: React.ReactNode;
}

/**
 * RTLProvider - Handles RTL text direction for languages like Arabic
 * 
 * This component sets LTR direction by default since i18next has been removed.
 */
export function RTLProvider({ children }: RTLProviderProps) {
  // Set LTR direction by default
  useEffect(() => {
    document.documentElement.dir = "ltr";
    document.body.dir = "ltr";
    document.documentElement.classList.remove("rtl");
    
    // Cleanup when component unmounts
    return () => {
      document.documentElement.classList.remove("rtl");
    };
  }, []);
  
  return <>{children}</>;
}