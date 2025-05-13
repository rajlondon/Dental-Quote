/**
 * Test script for the Admin Promo Manager functionality
 * This script tests the CRUD operations for managing promotions
 */

const axios = require('axios');
const chalk = require('chalk');

const API_URL = 'http://localhost:3000';
let adminAuthCookie = '';

// Mock promotion data
const mockPromotion = {
  clinic_id: '1',
  title: 'Test Promotion',
  description: 'This is a test promotion created by the automated test script',
  discount_type: 'percentage',
  discount_value: 15,
  applicable_treatments: ['dental_implant_standard', 'porcelain_veneers'],
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  promo_code: `TEST${Math.floor(Math.random() * 1000)}`,
  terms_conditions: 'Test terms and conditions. For testing purposes only.',
  banner_image: '/images/test-banner.jpg',
  is_active: true,
  admin_approved: true,
  commission_percentage: 10,
  promotion_level: 'standard',
  homepage_display: false,
  treatment_price_gbp: 100,
  treatment_price_usd: 130
};

let createdPromoId = null;

// Helper functions for logging
function logSuccess(message) {
  console.log(chalk.green(`✅ ${message}`));
}

function logError(message, error) {
  console.log(chalk.red(`❌ ${message}`));
  if (error) {
    console.log(chalk.red('Error details:'));
    console.log(error.response?.data || error.message || error);
  }
}

function logInfo(message) {
  console.log(chalk.blue(`ℹ️ ${message}`));
}

// Login as admin
async function loginAsAdmin() {
  try {
    logInfo('Logging in as admin...');
    const response = await axios.post(`${API_URL}/api/admin/auth/login`, {
      username: 'admin',
      password: 'admin123'
    }, {
      withCredentials: true
    });
    
    adminAuthCookie = response.headers['set-cookie'][0];
    logSuccess('Admin login successful');
    return adminAuthCookie;
  } catch (error) {
    logError('Admin login failed', error);
    throw error;
  }
}

// Create a new promotion
async function createPromotion() {
  try {
    logInfo('Creating test promotion...');
    const response = await axios.post(`${API_URL}/api/admin/promotions`, mockPromotion, {
      headers: {
        Cookie: adminAuthCookie
      }
    });
    
    createdPromoId = response.data.id;
    logSuccess(`Promotion created with ID: ${createdPromoId}`);
    return response.data;
  } catch (error) {
    logError('Failed to create promotion', error);
    throw error;
  }
}

// Get all promotions
async function getAllPromotions() {
  try {
    logInfo('Fetching all promotions...');
    const response = await axios.get(`${API_URL}/api/admin/promotions`, {
      headers: {
        Cookie: adminAuthCookie
      }
    });
    
    logSuccess(`Retrieved ${response.data.length} promotions`);
    return response.data;
  } catch (error) {
    logError('Failed to fetch promotions', error);
    throw error;
  }
}

// Get single promotion
async function getPromotion(id) {
  try {
    logInfo(`Fetching promotion with ID: ${id}...`);
    const response = await axios.get(`${API_URL}/api/admin/promotions/${id}`, {
      headers: {
        Cookie: adminAuthCookie
      }
    });
    
    logSuccess('Promotion details retrieved successfully');
    return response.data;
  } catch (error) {
    logError(`Failed to fetch promotion with ID: ${id}`, error);
    throw error;
  }
}

// Update promotion
async function updatePromotion(id, updates) {
  try {
    logInfo(`Updating promotion with ID: ${id}...`);
    const response = await axios.patch(`${API_URL}/api/admin/promotions/${id}`, updates, {
      headers: {
        Cookie: adminAuthCookie
      }
    });
    
    logSuccess('Promotion updated successfully');
    return response.data;
  } catch (error) {
    logError(`Failed to update promotion with ID: ${id}`, error);
    throw error;
  }
}

// Delete promotion
async function deletePromotion(id) {
  try {
    logInfo(`Deleting promotion with ID: ${id}...`);
    const response = await axios.delete(`${API_URL}/api/admin/promotions/${id}`, {
      headers: {
        Cookie: adminAuthCookie
      }
    });
    
    logSuccess('Promotion deleted successfully');
    return response.data;
  } catch (error) {
    logError(`Failed to delete promotion with ID: ${id}`, error);
    throw error;
  }
}

// Toggle promotion status
async function togglePromotionStatus(id, isActive) {
  try {
    logInfo(`Toggling promotion status to ${isActive ? 'active' : 'inactive'}...`);
    const response = await axios.patch(`${API_URL}/api/admin/promotions/${id}`, {
      is_active: isActive
    }, {
      headers: {
        Cookie: adminAuthCookie
      }
    });
    
    logSuccess(`Promotion status toggled to ${isActive ? 'active' : 'inactive'}`);
    return response.data;
  } catch (error) {
    logError(`Failed to toggle promotion status`, error);
    throw error;
  }
}

// Run all tests
async function runTests() {
  try {
    logInfo('Starting Admin Promo Manager tests...');
    
    // Step 1: Login as admin
    await loginAsAdmin();
    
    // Step 2: Create a new promotion
    const createdPromo = await createPromotion();
    
    // Step 3: Get all promotions and verify our test promotion is included
    const allPromotions = await getAllPromotions();
    const foundInList = allPromotions.some(promo => promo.id === createdPromoId);
    if (foundInList) {
      logSuccess('Test promotion found in promotions list');
    } else {
      logError('Test promotion not found in promotions list');
    }
    
    // Step 4: Get individual promotion details
    const promoDetails = await getPromotion(createdPromoId);
    if (promoDetails.title === mockPromotion.title) {
      logSuccess('Promotion details match expected values');
    } else {
      logError('Promotion details do not match expected values');
    }
    
    // Step 5: Update promotion
    const updateData = {
      title: 'Updated Test Promotion',
      discount_value: 20
    };
    await updatePromotion(createdPromoId, updateData);
    
    // Step 6: Verify update
    const updatedPromo = await getPromotion(createdPromoId);
    if (updatedPromo.title === updateData.title && 
        updatedPromo.discount_value === updateData.discount_value) {
      logSuccess('Promotion was updated successfully');
    } else {
      logError('Promotion update verification failed');
    }
    
    // Step 7: Toggle status
    await togglePromotionStatus(createdPromoId, false);
    
    // Step 8: Verify status toggle
    const inactivePromo = await getPromotion(createdPromoId);
    if (inactivePromo.is_active === false) {
      logSuccess('Promotion status toggled successfully');
    } else {
      logError('Promotion status toggle verification failed');
    }
    
    // Step 9: Delete the test promotion
    await deletePromotion(createdPromoId);
    
    // Step 10: Verify deletion
    try {
      await getPromotion(createdPromoId);
      logError('Promotion was not deleted as expected');
    } catch (error) {
      logSuccess('Promotion was deleted successfully');
    }
    
    logSuccess('All Admin Promo Manager tests completed successfully!');
  } catch (error) {
    logError('Test suite failed', error);
  }
}

// Run all tests
runTests();