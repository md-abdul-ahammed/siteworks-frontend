import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // Build the backend URL
    const backendUrl = new URL('/api/billing/sync', BACKEND_URL);

    // Make the request to the backend
    const response = await fetch(backendUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    // Get the response data
    const data = await response.json();

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Error proxying billing sync request:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to sync billing data'
      },
      { status: 500 }
    );
  }
} 