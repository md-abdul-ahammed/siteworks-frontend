import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');

    const backendUrl = new URL('/api/admin/analytics/billing', BACKEND_URL);
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
    console.error('Error proxying admin billing analytics request:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch admin billing analytics' },
      { status: 500 }
    );
  }
}