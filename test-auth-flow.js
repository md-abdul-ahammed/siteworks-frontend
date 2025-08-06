const axios = require('axios');

const BASE_URL = 'http://localhost:8000';
const FRONTEND_URL = 'http://localhost:3000';

// Test data
const testCustomer = {
  email: 'test@example.com',
  password: 'TestPass123!',
  firstName: 'Test',
  lastName: 'User',
  companyName: 'Test Company',
  phone: '1234567890',
  countryOfResidence: 'United States',
  addressLine1: '123 Test Street',
  addressLine2: 'Apt 1',
  city: 'Test City',
  postcode: '12345',
  state: 'Test State'
};

let accessToken = '';
let refreshToken = '';

// Helper function to make requests
const makeRequest = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method} ${endpoint} failed:`, error.response?.data || error.message);
    return null;
  }
};

// Test functions
const testRegistration = async () => {
  console.log('\n🔐 Testing Customer Registration...');
  const result = await makeRequest('POST', '/api/auth/register', testCustomer);
  
  if (result && result.success) {
    console.log('✅ Registration successful');
    console.log('Customer ID:', result.customer.id);
    console.log('Customer Name:', `${result.customer.firstName} ${result.customer.lastName}`);
    accessToken = result.tokens.accessToken;
    refreshToken = result.tokens.refreshToken;
    return true;
  }
  return false;
};

const testLogin = async () => {
  console.log('\n🔑 Testing Customer Login...');
  const result = await makeRequest('POST', '/api/auth/signin', {
    email: testCustomer.email,
    password: testCustomer.password
  });
  
  if (result && result.success) {
    console.log('✅ Login successful');
    console.log('Customer:', `${result.customer.firstName} ${result.customer.lastName}`);
    accessToken = result.tokens.accessToken;
    refreshToken = result.tokens.refreshToken;
    return true;
  }
  return false;
};

const testProfile = async () => {
  console.log('\n👤 Testing Get Profile...');
  const result = await makeRequest('GET', '/api/auth/profile', null, {
    'Authorization': `Bearer ${accessToken}`
  });
  
  if (result && result.success) {
    console.log('✅ Profile retrieved successfully');
    console.log('Customer:', `${result.customer.firstName} ${result.customer.lastName}`);
    return true;
  }
  return false;
};

const testHealthCheck = async () => {
  console.log('\n🏥 Testing Health Check...');
  const result = await makeRequest('GET', '/health');
  
  if (result && result.status === 'OK') {
    console.log('✅ Health check passed');
    console.log('Server uptime:', result.uptime);
    return true;
  }
  return false;
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Authentication Flow Tests...\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Registration', fn: testRegistration },
    { name: 'Login', fn: testLogin },
    { name: 'Get Profile', fn: testProfile }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    console.log(`\n📋 Running: ${test.name}`);
    const success = await test.fn();
    if (success) {
      passed++;
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Authentication system is working correctly.');
    console.log('\n🌐 You can now test the frontend at:', FRONTEND_URL);
    console.log('📝 Test credentials:');
    console.log('   Email:', testCustomer.email);
    console.log('   Password:', testCustomer.password);
  } else {
    console.log('\n⚠️ Some tests failed. Please check the server logs and configuration.');
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testRegistration,
  testLogin,
  testProfile,
  testHealthCheck
}; 