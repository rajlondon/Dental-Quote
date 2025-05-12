import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * This is a completely new test page to verify the build pipeline
 * It has very distinctive styling that cannot be missed
 */
const DebugRenderTestPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [timestamp, setTimestamp] = useState('');
  
  // Add component mounting timestamp
  useEffect(() => {
    setMounted(true);
    setTimestamp(new Date().toISOString());
    console.log('DEBUG RENDER TEST PAGE MOUNTED AT:', new Date().toISOString());
    
    // Set a distinctive page title
    document.title = 'Debug Render Test';
    
    // Try to find special offers
    setTimeout(() => {
      const offerElements = document.querySelectorAll('[class*="offer"], [class*="special"], [id*="offer"]');
      console.log('Found potential offer elements from debug page:', offerElements.length);
    }, 1000);
  }, []);
  
  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: 'black',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {/* Header with extremely distinctive styling */}
      <div style={{
        backgroundColor: 'red',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        textAlign: 'center',
        width: '100%',
        maxWidth: '800px',
        boxShadow: '0 0 20px rgba(255, 0, 0, 0.7)'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
          DEBUG RENDER TEST PAGE
        </h1>
        <p>This page was created at: {new Date().toLocaleTimeString()}</p>
        <p>Component mounted: {mounted ? 'YES' : 'NO'}</p>
        <p>Mount timestamp: {timestamp}</p>
      </div>
      
      {/* Test card with zebra pattern background */}
      <div style={{
        background: 'repeating-linear-gradient(45deg, yellow, yellow 10px, black 10px, black 20px)',
        padding: '10px',
        borderRadius: '10px',
        marginBottom: '20px',
        width: '100%',
        maxWidth: '800px'
      }}>
        <Card style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            Special Offer Test 
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              backgroundColor: 'lightblue',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px'
            }}>
              💉
            </div>
            <div style={{ flex: 1, marginLeft: '20px' }}>
              <h3 style={{ fontWeight: 'bold' }}>Dental Implant Special</h3>
              <p style={{ marginBottom: '10px' }}>
                Get 20% off on all dental implant procedures. Limited time offer!
              </p>
              <Button
                style={{ 
                  backgroundColor: 'green',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                Apply to Quote
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Navigation buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        gap: '10px',
        marginTop: '20px'
      }}>
        <Button onClick={() => window.location.href = '/'}>
          Back to Home
        </Button>
        <Button onClick={() => window.location.reload()}>
          Reload Page
        </Button>
        <Button onClick={() => alert('Current time: ' + new Date().toLocaleTimeString())}>
          Show Time
        </Button>
      </div>
      
      {/* Timestamp footer */}
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        Page rendered at: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default DebugRenderTestPage;