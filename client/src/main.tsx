import React, { Suspense } from 'react';
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";
import { Toaster } from "./components/ui/toaster";

// Loading component for your dental platform
function LoadingFallback() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px',
      color: '#0079F2',
      flexDirection: 'column'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>🦷 MyDentalFly</h1>
        <p>Your Trusted Dental Treatment Concierge</p>
        <div style={{ marginTop: '20px' }}>
          <div style={{ 
            width: '200px', 
            height: '4px', 
            backgroundColor: '#e0e0e0', 
            borderRadius: '2px',
            overflow: 'hidden',
            margin: '0 auto'
          }}>
            <div style={{ 
              width: '100%', 
              height: '100%', 
              backgroundColor: '#0079F2',
              animation: 'pulse 2s infinite'
            }} />
          </div>
        </div>
        <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
          Loading your sophisticated dental tourism platform...
        </p>
      </div>
    </div>
  );
}

// Error boundary for your app
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('MyDentalFly App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          maxWidth: '600px',
          margin: '50px auto',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h2 style={{ color: '#d32f2f', marginBottom: '16px' }}>
            🚨 MyDentalFly Loading Error
          </h2>
          <div style={{ 
            backgroundColor: '#fff3e0', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #ffb74d',
            marginBottom: '16px',
            textAlign: 'left'
          }}>
            <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#0079F2', 
              color: 'white', 
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🔄 Reload MyDentalFly
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Render your full MyDentalFly application
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<LoadingFallback />}>
          <App />
          <Toaster />
        </Suspense>
      </QueryClientProvider>
    </ErrorBoundary>
  );
} else {
  console.error("❌ Root element not found!");
}
