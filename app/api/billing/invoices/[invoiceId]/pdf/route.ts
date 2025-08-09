import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    // Get the search params from the request
    const { searchParams } = new URL(request.url);
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // Build the backend URL with the invoice ID and query parameters
    const backendUrl = new URL(`/api/billing/invoices/${params.invoiceId}/pdf`, BACKEND_URL);
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

    // If the response is a PDF (binary), handle it differently
    if (response.headers.get('content-type')?.includes('application/pdf')) {
      const pdfBuffer = await response.arrayBuffer();
      return new NextResponse(pdfBuffer, {
        status: response.status,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': response.headers.get('content-disposition') || 'attachment; filename="invoice.pdf"',
        },
      });
    }

    // Get the response data (JSON)
    const data = await response.json();

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Error proxying invoice PDF request:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch invoice PDF'
      },
      { status: 500 }
    );
  }
}
