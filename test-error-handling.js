// Simple test to verify error handling
// This file can be used to test different error scenarios

const testErrorHandling = async () => {
  const baseUrl = 'http://localhost:8000';
  
  console.log('Testing error handling...');
  
  // Test 1: Invalid credentials
  try {
    const response = await fetch(`${baseUrl}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })
    });
    
    const data = await response.json();
    console.log('Test 1 - Invalid credentials:', data);
    console.log('Expected: INVALID_CREDENTIALS error');
    console.log('Actual:', data.code === 'INVALID_CREDENTIALS' ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.error('Test 1 failed:', error);
  }
  
  // Test 2: Missing email
  try {
    const response = await fetch(`${baseUrl}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: 'somepassword'
      })
    });
    
    const data = await response.json();
    console.log('Test 2 - Missing email:', data);
    console.log('Expected: VALIDATION_ERROR');
    console.log('Actual:', data.code === 'VALIDATION_ERROR' ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.error('Test 2 failed:', error);
  }
  
  // Test 3: Invalid email format
  try {
    const response = await fetch(`${baseUrl}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'somepassword'
      })
    });
    
    const data = await response.json();
    console.log('Test 3 - Invalid email format:', data);
    console.log('Expected: VALIDATION_ERROR');
    console.log('Actual:', data.code === 'VALIDATION_ERROR' ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.error('Test 3 failed:', error);
  }
  
  // Test 4: Network error (wrong URL)
  try {
    const response = await fetch('http://localhost:9999/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    console.log('Test 4 - Network error:', data);
  } catch (error) {
    console.log('Test 4 - Network error (expected):', error.message);
    console.log('Expected: Network error');
    console.log('Actual: ✅ PASS (caught network error)');
  }
  
  console.log('Error handling tests completed!');
};

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  testErrorHandling();
}

export { testErrorHandling }; 