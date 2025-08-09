import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const backendUrl = new URL('/api/admin/zoho/invoices', BACKEND_URL);
    searchParams.forEach((value, key) => backendUrl.searchParams.append(key, value));

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying admin Zoho invoices request:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch Zoho invoices' },
      { status: 500 }
    );
  }
}

