// Test script for email notifications
import fetch from 'node-fetch';
import fs from 'fs';

async function runTest() {
  try {
    console.log('Testing email notification system...');
    
    // Step 1: Login as patient
    console.log('Logging in as patient...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'patient@mydentalfly.com',
        password: 'Patient123!'
      }),
      credentials: 'include'
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.statusText}`);
    }
    
    // Extract cookies from the response
    const cookies = loginResponse.headers.raw()['set-cookie'];
    console.log('Login successful, cookies received');
    
    // Step 2: Send test notification request
    console.log('Sending test email notification request...');
    const notificationResponse = await fetch('http://localhost:5000/api/test/email-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies.join('; ')
      },
      credentials: 'include'
    });
    
    if (!notificationResponse.ok) {
      const error = await notificationResponse.json();
      throw new Error(`Notification request failed: ${JSON.stringify(error)}`);
    }
    
    const result = await notificationResponse.json();
    console.log('Notification request successful:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\nEmail notification test complete!');
    console.log('Check server logs to verify email processing.');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();