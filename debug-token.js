// Debug script to check authentication status
console.log('🔍 Debugging authentication...');

// Check localStorage
const authTokens = localStorage.getItem('auth_tokens');
const authUser = localStorage.getItem('auth_user');

console.log('📦 Stored tokens:', authTokens);
console.log('👤 Stored user:', authUser);

if (authTokens) {
  try {
    const tokens = JSON.parse(authTokens);
    console.log('🔑 Access token:', tokens.accessToken ? 'Present' : 'Missing');
    console.log('🔄 Refresh token:', tokens.refreshToken ? 'Present' : 'Missing');
    
    // Check if token is expired
    if (tokens.accessToken) {
      const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
      const expTime = payload.exp * 1000;
      const currentTime = Date.now();
      
      console.log('⏰ Token expiration:', new Date(expTime));
      console.log('🕐 Current time:', new Date(currentTime));
      console.log('❓ Token expired:', expTime < currentTime);
    }
  } catch (error) {
    console.error('❌ Error parsing tokens:', error);
  }
}

// Test API connection
fetch('http://localhost:8000/api/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${authTokens ? JSON.parse(authTokens).accessToken : ''}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('🌐 API Response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('📄 API Response data:', data);
})
.catch(error => {
  console.error('❌ API Error:', error);
}); 