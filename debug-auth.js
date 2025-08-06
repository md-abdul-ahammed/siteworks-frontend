// Debug authentication flow
const debugAuth = async () => {
  console.log('🔍 Debugging Authentication Flow...\n');
  
  // Test 1: Check if frontend is running
  try {
    const response = await fetch('http://localhost:3000');
    console.log('✅ Frontend is accessible');
  } catch (error) {
    console.log('❌ Frontend is not accessible:', error.message);
    return;
  }
  
  // Test 2: Check if backend is running
  try {
    const response = await fetch('http://localhost:8000/health');
    const data = await response.json();
    console.log('✅ Backend is accessible');
  } catch (error) {
    console.log('❌ Backend is not accessible:', error.message);
    return;
  }
  
  // Test 3: Test signin endpoint
  try {
    console.log('🔐 Testing signin endpoint...');
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
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📊 Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Signin successful');
      console.log('🔑 Access token received:', !!data.tokens?.accessToken);
      console.log('👤 User data received:', !!data.customer);
    } else {
      console.log('❌ Signin failed:', data);
    }
  } catch (error) {
    console.log('❌ Signin request failed:', error.message);
  }
  
  // Test 4: Check localStorage
  console.log('\n💾 Checking localStorage...');
  if (typeof window !== 'undefined') {
    const tokens = localStorage.getItem('auth_tokens');
    const user = localStorage.getItem('auth_user');
    console.log('🔑 Stored tokens:', !!tokens);
    console.log('👤 Stored user:', !!user);
    if (tokens) {
      console.log('📝 Tokens data:', JSON.parse(tokens));
    }
    if (user) {
      console.log('📝 User data:', JSON.parse(user));
    }
  }
  
  console.log('\n🎯 Debug Steps:');
  console.log('1. Open browser console (F12)');
  console.log('2. Go to http://localhost:3000/sign-in');
  console.log('3. Try signing in with: test@example.com / TestPass123!');
  console.log('4. Check for any console errors');
  console.log('5. Check Network tab for failed requests');
  console.log('6. Check if router.push("/dashboard") is called');
};

// Run the debug
debugAuth().catch(console.error); 