import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // Get the search params from the request
    const { searchParams } = new URL(request.url);
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // Build the backend URL with query parameters
    const backendUrl = new URL('/api/billing/history', BACKEND_URL);
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

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
    console.error('Error proxying billing history request:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch billing history'
      },
      { status: 500 }
    );
  }
} 