// Test script to check authentication flow
const testAuthFlow = async () => {
  console.log('🧪 Testing authentication flow...');
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.log('❌ This script must run in a browser environment');
    return;
  }
  
  // Check localStorage for tokens
  const storedTokens = localStorage.getItem('auth_tokens');
  const storedUser = localStorage.getItem('auth_user');
  
  console.log('📦 Stored tokens:', storedTokens ? 'Found' : 'Not found');
  console.log('👤 Stored user:', storedUser ? 'Found' : 'Not found');
  
  if (storedTokens) {
    try {
      const tokens = JSON.parse(storedTokens);
      console.log('🔐 Token details:', {
        hasAccessToken: !!tokens.accessToken,
        accessTokenLength: tokens.accessToken?.length || 0,
        hasRefreshToken: !!tokens.refreshToken,
        refreshTokenLength: tokens.refreshToken?.length || 0,
        expiresAt: tokens.expiresAt
      });
      
      // Check if token is expired
      if (tokens.expiresAt) {
        const expiresAt = new Date(tokens.expiresAt);
        const now = new Date();
        const isExpired = expiresAt < now;
        console.log('⏰ Token expiration:', {
          expiresAt: expiresAt.toISOString(),
          now: now.toISOString(),
          isExpired: isExpired,
          timeUntilExpiry: expiresAt.getTime() - now.getTime()
        });
      }
    } catch (error) {
      console.error('❌ Error parsing stored tokens:', error);
    }
  }
  
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      console.log('👤 User details:', {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive
      });
    } catch (error) {
      console.error('❌ Error parsing stored user:', error);
    }
  }
  
  // Test API call
  try {
    console.log('🌐 Testing API call to /api/auth/profile...');
    const response = await fetch('/api/auth/profile', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Profile API response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Profile data:', data);
    } else {
      const errorData = await response.json();
      console.log('❌ Profile error:', errorData);
    }
  } catch (error) {
    console.error('❌ Error testing API call:', error);
  }
};

// Run the test
testAuthFlow(); 