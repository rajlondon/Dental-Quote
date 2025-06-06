import React, { Suspense } from 'react';
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";
import i18n from "./i18n"; // Import i18n configuration
import { RTLProvider } from '@/components/ui/rtl-provider'; // Import RTL provider for Arabic support

// Extend global CSS with custom styles
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  :root {
    --primary: 195 100% 27%;
    --primary-dark: 195 100% 20%;
    --primary-light: 195 100% 33%;
    --secondary: 174 60% 56%;
    --secondary-dark: 174 60% 46%;
    --secondary-light: 174 60% 66%;
    --accent: 0 100% 70%;
  }

  body {
    font-family: 'Open Sans', sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Poppins', sans-serif;
  }
`;

// Loading component for Suspense fallback
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

// Enhanced iframe compatibility and error handling
console.log('MyDentalFly: Initializing React application...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('MyDentalFly: Root element not found');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;">Application root element not found</div>';
} else {
  try {
    console.log('MyDentalFly: Creating React root...');
    const root = createRoot(rootElement);
    
    console.log('MyDentalFly: Rendering application...');
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <GlobalStyle />
          <Suspense fallback={<Loading />}>
            <RTLProvider>
              <App />
            </RTLProvider>
          </Suspense>
        </QueryClientProvider>
      </React.StrictMode>
    );
    
    console.log('MyDentalFly: Application rendered successfully');
    
    // Remove Replit loading overlay after app loads
    setTimeout(() => {
      const replitLoading = document.getElementById('replit-loading');
      if (replitLoading && !sessionStorage.getItem('replit-force-iframe')) {
        replitLoading.remove();
      }
    }, 2000);
    
  } catch (error) {
    console.error('MyDentalFly: Error rendering application:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #e74c3c;">
        <h2>Application Loading Error</h2>
        <p>Please refresh the page or open in a new tab.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; margin: 10px;">Refresh</button>
        <button onclick="window.open(window.location.href, '_blank')" style="padding: 10px 20px; margin: 10px;">Open New Tab</button>
      </div>
    `;
  }
}
