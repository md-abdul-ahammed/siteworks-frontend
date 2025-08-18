import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Frontend API: Received request body:', body);
    
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/customers/bank-details`;
    console.log('Frontend API: Forwarding to backend URL:', backendUrl);
    
    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });

    console.log('Frontend API: Backend response status:', response.status);
    const data = await response.json();
    console.log('Frontend API: Backend response data:', data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to update bank details' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Frontend API: Error updating bank details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
