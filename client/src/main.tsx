import React, { Suspense } from 'react';
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";
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

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
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
}