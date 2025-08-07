import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // Build the backend URL
    const backendUrl = new URL('/api/dashboard/analytics', BACKEND_URL);

    // Make the request to the backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
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
    console.error('Error proxying dashboard analytics request:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch dashboard analytics'
      },
      { status: 500 }
    );
  }
} 