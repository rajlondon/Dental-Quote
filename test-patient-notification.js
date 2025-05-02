// Test script for patient portal notifications with email integration
import fetch from 'node-fetch';

async function runTest() {
  try {
    console.log('Testing patient notification system with email...');
    
    // Step 1: Login as admin (to create notifications for patients)
    console.log('Logging in as admin...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@mydentalfly.com',
        password: 'Admin123!'
      }),
      credentials: 'include'
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.statusText}`);
    }
    
    // Extract cookies from the response
    const cookies = loginResponse.headers.raw()['set-cookie'];
    console.log('Login successful, cookies received');
    
    // Step 2: Create a notification for a patient
    console.log('Creating notification for patient...');
    const notificationData = {
      title: "Important Appointment Update",
      message: "Your dental check-up has been scheduled for next week. Please confirm your availability.",
      target_type: "patient",
      target_id: "45", // Patient ID (from test)
      source_type: "admin",
      source_id: "41", // Admin ID
      category: "appointment",
      subcategory: "update",
      priority: "high", // High priority to trigger email
      action_url: "https://mydentalfly.com/patient/appointments" // Must be a full URL
    };
    
    const notificationResponse = await fetch('http://localhost:5000/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies.join('; ')
      },
      body: JSON.stringify(notificationData),
      credentials: 'include'
    });
    
    if (!notificationResponse.ok) {
      const error = await notificationResponse.json();
      throw new Error(`Notification creation failed: ${JSON.stringify(error)}`);
    }
    
    const result = await notificationResponse.json();
    console.log('Notification created successfully:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\nPatient notification test complete!');
    console.log('Check server logs to verify email processing.');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();