import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');

    const backendUrl = new URL('/api/admin/zoho/test', BACKEND_URL);
    searchParams.forEach((value, key) => backendUrl.searchParams.append(key, value));

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error proxying zoho test request:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to test Zoho API' },
      { status: 500 }
    );
  }
} 