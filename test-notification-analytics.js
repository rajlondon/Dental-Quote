/**
 * Test script to generate notifications for analytics testing
 * 
 * This script creates a set of test notifications with various statuses,
 * priorities, and categories to populate the notification analytics dashboard.
 */

import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Base URL for API requests
const BASE_URL = 'https://4a8d63a8-0c27-4d42-977b-381f0b8a3327-00-2nulpa5o3ztvp.worf.replit.dev';

// Admin credentials for login
const ADMIN_EMAIL = 'admin@mydentalfly.com';
const ADMIN_PASSWORD = 'Admin123!';

// Test categories, priorities, and types to distribute across notifications
const categories = ['appointment', 'treatment', 'payment', 'message', 'document', 'system', 'offer'];
const priorities = ['low', 'medium', 'high', 'urgent'];
const targetTypes = ['admin', 'clinic', 'patient'];

// Helper for random selection from array
const randomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper for random integer in range
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Create a notification with random but realistic properties
const createRandomNotification = (index) => {
  const category = randomItem(categories);
  const priority = randomItem(priorities);
  const targetType = randomItem(targetTypes);
  
  // Generate appropriate titles based on category
  let title, message, action_url;
  
  const baseUrl = 'https://mydentalfly.com';
  
  switch (category) {
    case 'appointment':
      title = `New appointment request (#${1000 + index})`;
      message = `A patient has requested an appointment for dental consultation`;
      action_url = `${baseUrl}/admin/appointments`;
      break;
    case 'treatment':
      title = `Treatment plan update (#${2000 + index})`;
      message = `A clinic has proposed a new treatment plan #${2000 + index}`;
      action_url = `${baseUrl}/admin/treatment-plans`;
      break;
    case 'payment':
      title = `Payment confirmation (#${3000 + index})`;
      message = `Payment of €${randomInt(50, 500)} has been received for treatment plan #${3000 + index}`;
      action_url = `${baseUrl}/admin/payments`;
      break;
    case 'message':
      title = `New message from clinic`;
      message = `You have received a new message regarding patient treatment options`;
      action_url = `${baseUrl}/admin/messages`;
      break;
    case 'document':
      title = `Document uploaded`;
      message = `A new document has been uploaded to the treatment plan #${4000 + index}`;
      action_url = `${baseUrl}/admin/documents`;
      break;
    case 'system':
      title = `System notification`;
      message = `System maintenance is scheduled for this weekend`;
      action_url = `${baseUrl}/admin/settings`;
      break;
    case 'offer':
      title = `New special offer submitted`;
      message = `A clinic has submitted a special offer for approval`;
      action_url = `${baseUrl}/admin/offers-approval`;
      break;
  }
  
  // Determine if notification should be read or unread (70% chance of being read)
  const status = Math.random() < 0.7 ? 'read' : 'unread';
  
  // For read notifications, add timing data to simulate user engagement
  let metadata = {};
  if (status === 'read') {
    metadata = {
      engagement: {
        time_to_read: randomInt(30, 3600), // Between 30 seconds and 1 hour
        read_at: new Date(Date.now() - randomInt(60000, 604800000)) // Between 1 minute and 1 week ago
      }
    };
  }
  
  return {
    id: uuidv4(),
    title,
    message,
    target_type: targetType,
    target_id: targetType === 'admin' ? '41' : randomInt(1, 50).toString(), // Admin ID is 41
    source_type: 'system',
    source_id: 'test-script',
    category,
    priority,
    status,
    action_url,
    metadata,
    created_at: new Date(Date.now() - randomInt(60000, 2592000000)), // Between 1 minute and 30 days ago
  };
};

// Helper to create an axios instance with auth token for authentication
async function createAuthenticatedClient() {
  // First try to login
  console.log(`Logging in as ${ADMIN_EMAIL}...`);
  
  try {
    // Create instance
    const axiosInstance = axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // Login to get user data
    const loginResponse = await axiosInstance.post('/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    console.log('Login response:', loginResponse.status);
    
    if (loginResponse.data && loginResponse.data.user) {
      console.log(`Successfully logged in as: ${loginResponse.data.user.email} (${loginResponse.data.user.role})`);
      
      // Add authentication header to future requests (as an alternative to cookies)
      // This doesn't exist yet, but we can implement it on the server if needed
      if (loginResponse.data.token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.token}`;
      }
      
      return axiosInstance;
    } else {
      throw new Error('Invalid login response structure');
    }
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message || error.message);
    throw new Error('Failed to authenticate');
  }
}

// Main function to create test notifications
async function createTestNotifications() {
  try {
    console.log('Creating test notifications for analytics testing...');
    
    // Create authenticated client
    const client = await createAuthenticatedClient();
    
    // Number of test notifications to create
    const numNotifications = 30;
    const notifications = [];
    
    // Create array of notification objects
    for (let i = 0; i < numNotifications; i++) {
      notifications.push(createRandomNotification(i));
    }
    
    // Send each notification to the server using authenticated client
    console.log(`Generating ${numNotifications} test notifications...`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const notification of notifications) {
      try {
        await client.post('/api/notifications', notification);
        successCount++;
        process.stdout.write('.');
      } catch (error) {
        failCount++;
        process.stdout.write('x');
        console.error(`\nFailed to create notification: ${error.response?.data?.error || error.message}`);
      }
    }
    
    console.log(`\nCompleted notification generation: ${successCount} succeeded, ${failCount} failed`);
    console.log('You can now view the notification analytics in the admin portal');
    
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error('Error: Not authenticated. Please log in as an admin user first.');
    } else {
      console.error('Error generating test notifications:', error.message);
    }
  }
}

// Execute the script
createTestNotifications();