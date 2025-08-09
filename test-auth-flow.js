// Simple test to check authentication flow
const testAuthFlow = async () => {
  console.log('🔍 Testing authentication flow...');

  try {
    // Test login with admin credentials
    const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@siteworks.com',
        password: 'Admin123!'
      })
    });

    console.log('📊 Login response status:', loginResponse.status);

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful');
      console.log('🔑 Access token:', loginData.tokens?.accessToken?.substring(0, 50) + '...');

      // Test admin users endpoint with the token
      const usersResponse = await fetch('http://localhost:8000/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.tokens.accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('📊 Users response status:', usersResponse.status);

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('✅ Admin users endpoint working!');
        console.log('📋 Users found:', usersData.users?.length || 0);
      } else {
        const errorData = await usersResponse.json();
        console.error('❌ Admin users endpoint failed:', errorData);
      }
    } else {
      const errorData = await loginResponse.json();
      console.error('❌ Login failed:', errorData);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testAuthFlow(); 