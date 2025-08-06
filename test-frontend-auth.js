// Test frontend authentication flow
const testFrontendAuth = async () => {
  console.log('🧪 Testing Frontend Authentication Flow...\n');
  
  // Test 1: Check if frontend is accessible
  try {
    const response = await fetch('http://localhost:3000');
    console.log('✅ Frontend is accessible');
  } catch (error) {
    console.log('❌ Frontend is not accessible:', error.message);
    return;
  }
  
  // Test 2: Check if backend is accessible from frontend
  try {
    const response = await fetch('http://localhost:8000/health');
    const data = await response.json();
    console.log('✅ Backend is accessible from frontend');
  } catch (error) {
    console.log('❌ Backend is not accessible from frontend:', error.message);
    return;
  }
  
  // Test 3: Test authentication endpoint
  try {
    const response = await fetch('http://localhost:8000/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Authentication endpoint is working');
      console.log('📝 Customer data structure:', Object.keys(data.customer));
    } else {
      const error = await response.json();
      console.log('⚠️ Authentication endpoint error:', error);
    }
  } catch (error) {
    console.log('❌ Authentication endpoint failed:', error.message);
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Try signing in with: test@example.com / TestPass123!');
  console.log('3. Check browser console for any errors');
  console.log('4. After sign-in, you should be redirected to /dashboard');
};

// Run the test
testFrontendAuth().catch(console.error); 