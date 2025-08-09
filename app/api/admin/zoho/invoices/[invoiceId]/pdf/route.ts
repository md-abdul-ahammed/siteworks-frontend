import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest, { params }: { params: { invoiceId: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const stream = searchParams.get('stream') === 'true';
    const disposition = searchParams.get('disposition') || 'inline';
    const token = searchParams.get('token');
    const backendUrl = `${BACKEND_URL}/api/admin/zoho/invoices/${params.invoiceId}/pdf?stream=${stream}&disposition=${disposition}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(!token && authHeader ? { Authorization: authHeader } : {}),
      },
    });

    // If streaming and response is PDF, proxy the binary data
    if (stream && response.ok && response.headers.get('content-type')?.includes('application/pdf')) {
      const arrayBuffer = await response.arrayBuffer();
      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `${disposition}; filename="invoice-${params.invoiceId}.pdf"`,
        },
      });
    }

    // If not streaming or not PDF, try to parse as JSON
    try {
      const data = await response.json();
      
      // If we got a download URL, redirect to it
      if (response.ok && data?.data?.downloadUrl) {
        return NextResponse.redirect(data.data.downloadUrl);
      }
      
      return NextResponse.json(data, { status: response.status });
    } catch (jsonError) {
      // If JSON parsing fails, it might be a binary response
      console.error('Failed to parse response as JSON:', jsonError);
      return NextResponse.json(
        { error: 'Invalid response format', message: 'Expected JSON but got binary data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error proxying zoho invoice pdf request:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch invoice PDF' },
      { status: 500 }
    );
  }
}

