/**
 * Test script to generate notifications for analytics testing
 * 
 * This script creates a set of test notifications with various statuses,
 * priorities, and categories to populate the notification analytics dashboard.
 */

const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// Base URL for API requests
const BASE_URL = 'http://localhost:5000';

// Admin credentials for login
const ADMIN_EMAIL = 'admin@mydentalfly.com';
const ADMIN_PASSWORD = 'Admin123!';

// Test categories, priorities, and types to distribute across notifications
const categories = ['appointment', 'quote', 'payment', 'message', 'document', 'system'];
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
  
  switch (category) {
    case 'appointment':
      title = `New appointment request (#${1000 + index})`;
      message = `A patient has requested an appointment for dental consultation`;
      action_url = '/admin/appointments';
      break;
    case 'quote':
      title = `Quote request update (#${2000 + index})`;
      message = `A clinic has responded to quote request #${2000 + index}`;
      action_url = '/admin/quotes';
      break;
    case 'payment':
      title = `Payment confirmation (#${3000 + index})`;
      message = `Payment of €${randomInt(50, 500)} has been received for treatment plan #${3000 + index}`;
      action_url = '/admin/payments';
      break;
    case 'message':
      title = `New message from clinic`;
      message = `You have received a new message regarding patient treatment options`;
      action_url = '/admin/messages';
      break;
    case 'document':
      title = `Document uploaded`;
      message = `A new document has been uploaded to the treatment plan #${4000 + index}`;
      action_url = '/admin/documents';
      break;
    case 'system':
      title = `System notification`;
      message = `System maintenance is scheduled for this weekend`;
      action_url = '/admin/settings';
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
    subcategory: 'test',
    priority,
    status,
    action_url,
    metadata,
    created_at: new Date(Date.now() - randomInt(60000, 2592000000)), // Between 1 minute and 30 days ago
    updated_at: new Date()
  };
};

// Helper to create an axios instance with cookies for auth
async function createAuthenticatedClient() {
  // First try to login
  console.log(`Logging in as ${ADMIN_EMAIL}...`);
  
  try {
    // Create instance that will handle cookies
    const axiosInstance = axios.create({
      baseURL: BASE_URL,
      withCredentials: true
    });
    
    // Login to get session cookie
    await axiosInstance.post('/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    // Check if login worked
    const { data } = await axiosInstance.get('/api/auth/user');
    console.log(`Successfully logged in as: ${data.user.email} (${data.user.role})`);
    
    return axiosInstance;
  } catch (error) {
    console.error('Login failed:', error.message);
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