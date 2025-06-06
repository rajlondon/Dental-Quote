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

// Iframe compatibility with immediate fallback
console.log('MyDentalFly: Initializing React application...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('MyDentalFly: Root element not found');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;">Application root element not found</div>';
} else {
  // Immediate check for iframe environment
  const isInIframe = window.self !== window.top;
  
  if (isInIframe) {
    // In iframe, set a flag to show we attempted to load
    window.myDentalFlyAttempted = true;
  }
  
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
    
    // Mark as successfully loaded
    window.myDentalFlyLoaded = true;
    
  } catch (error) {
    console.error('MyDentalFly: Error rendering application:', error);
    
    // Show error or fallback interface
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-family: system-ui, -apple-system, sans-serif;">
        <div style="background: rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; backdrop-filter: blur(10px); max-width: 500px;">
          <div style="font-size: 48px; margin-bottom: 20px;">🦷</div>
          <h1 style="margin: 0 0 15px 0; font-size: 28px;">MyDentalFly</h1>
          <p style="margin: 0 0 15px 0; font-size: 16px; opacity: 0.9;">
            Application needs to be opened in a new tab for full functionality
          </p>
          <p style="margin: 0 0 25px 0; font-size: 14px; opacity: 0.7;">
            Replit's preview environment has limitations for complex applications
          </p>
          <button onclick="window.open(window.location.href, '_blank')" 
                  style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); 
                         padding: 15px 30px; border-radius: 25px; cursor: pointer; font-size: 16px; font-weight: 500;
                         backdrop-filter: blur(10px); transition: all 0.3s ease;">
            Open Full Application
          </button>
        </div>
      </div>
    `;
  }
}
