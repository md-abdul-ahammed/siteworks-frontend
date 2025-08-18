import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🌐 Frontend API route called: /api/billing/subscription');
    
    const authHeader = request.headers.get('authorization');
    
    // Debug logging
    console.log('🔐 Auth header:', {
      hasAuthorization: !!authHeader,
      authorizationLength: authHeader?.length || 0,
      tokenPreview: authHeader ? authHeader.substring(0, 50) + '...' : 'No token'
    });
    
    // Check if we have a valid authorization header
    if (!authHeader) {
      console.log('❌ No authorization token provided');
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
    
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}/api/billing/subscription`;
    console.log('📡 Making request to backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // Debug logging
    console.log('📡 Backend response:', {
      status: response.status,
      statusText: response.statusText,
      data: data
    });

    if (!response.ok) {
      console.error('❌ Backend request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: data
      });
      
      return NextResponse.json(
        { error: data.error || 'Failed to fetch subscription' },
        { status: response.status }
      );
    }

    console.log('✅ Backend request successful');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error in frontend API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}/api/billing/subscription`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to create subscription' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
    
    console.log('🔍 Frontend DELETE request body:', body);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}/api/billing/subscription`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    console.log('📡 Backend DELETE response:', {
      status: response.status,
      statusText: response.statusText,
      data: data
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to cancel subscription' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
