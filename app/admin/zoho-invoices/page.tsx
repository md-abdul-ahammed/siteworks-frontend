"use client";

import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, FileText, Calendar, CreditCard, Receipt, Eye, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ReceiptItem {
  id: string;
  fileName: string;
  fileUrl: string | null;
  isDownloaded: boolean;
  createdAt: string;
}

interface InvoiceRecord {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'draft';
  description?: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  receipts: ReceiptItem[];
  _count: { receipts: number };
  zohoInvoiceId?: string;
  reference?: string;
  customerName?: string;
  customerId?: string;
}

interface InvoicesResponse {
  billingHistory: InvoiceRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  summary: { totalBills: number; totalAmount: number; paidAmount: number; pendingAmount: number };
}

export default function AdminZohoInvoicesPage() {
  const { getAuthHeaders } = useAuth();
  const [data, setData] = useState<InvoicesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [status, setStatus] = useState<string>('');
  const [source, setSource] = useState<'db' | 'zoho'>('zoho');
  const [selected, setSelected] = useState<InvoiceRecord | null>(null); // kept for modal state

  const isMounted = useRef(true);

  const fetchInvoices = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10', source });
      if (status) params.append('status', status);
      const res = await fetch(`/api/admin/zoho/invoices?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to fetch invoices');
      setData(json.data);
    } catch (e) {
      console.error(e);
      setData({
        billingHistory: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        summary: { totalBills: 0, totalAmount: 0, paidAmount: 0, pendingAmount: 0 },
      });
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [page, status, source, getAuthHeaders]);

  useEffect(() => {
    isMounted.current = true;
    fetchInvoices();
    return () => {
      isMounted.current = false;
    };
  }, [fetchInvoices]);

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency || 'GBP' }).format(amount);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });

  const getStatusBadge = (s: string) => {
    const map: Record<string, { color: string; text: string }> = {
      paid: { color: 'bg-green-100 text-green-800', text: 'Paid' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
      cancelled: { color: 'bg-gray-100 text-gray-800', text: 'Cancelled' },
      draft: { color: 'bg-blue-100 text-blue-800', text: 'Draft' },
    };
    const cfg = map[s] || map.pending;
    return <Badge className={cfg.color}>{cfg.text}</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-card-foreground">
              <Receipt className="h-5 w-5" />
              <span>Zoho Invoices</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Zoho Invoices</h2>
          <p className="text-muted-foreground">All customer invoices synced from Zoho</p>
        </div>

        {/* Summary */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{data.summary.totalBills}</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{formatCurrency(data.summary.totalAmount, 'GBP')}</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Paid Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(data.summary.paidAmount, 'GBP')}</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{formatCurrency(data.summary.pendingAmount, 'GBP')}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Button variant={status === '' ? 'default' : 'outline'} size="sm" onClick={() => setStatus('')}>All</Button>
          <Button variant={status === 'paid' ? 'default' : 'outline'} size="sm" onClick={() => setStatus('paid')}>Paid</Button>
          <Button variant={status === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setStatus('pending')}>Pending</Button>
          <Button variant={status === 'failed' ? 'default' : 'outline'} size="sm" onClick={() => setStatus('failed')}>Failed</Button>
          <Button variant={status === 'cancelled' ? 'default' : 'outline'} size="sm" onClick={() => setStatus('cancelled')}>Cancelled</Button>
          <div className="ml-auto flex gap-2">
            <Button variant={source === 'zoho' ? 'default' : 'outline'} size="sm" onClick={() => setSource('zoho')}>Source: Zoho</Button>
            <Button variant={source === 'db' ? 'default' : 'outline'} size="sm" onClick={() => setSource('db')}>Source: DB</Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                const testId = '5442941000002835015'; // Use first invoice ID from your list
                try {
                  const res = await fetch(`/api/admin/zoho/test?invoiceId=${testId}`, {
                    headers: getAuthHeaders()
                  });
                  const data = await res.json();
                  console.log('🔍 Zoho Test Result:', data);
                  alert(`Test completed. Check console for details.\n\nInvoice Details: ${data.data.invoiceDetails ? '✅' : '❌'}\nPDF URL: ${data.data.pdfUrl ? '✅' : '❌'}\nBinary: ${data.data.binaryResult.success ? '✅' : '❌'}`);
                } catch (e) {
                  console.error('Test failed:', e);
                  alert('Test failed. Check console.');
                }
              }}
            >
              Test Zoho API
            </Button>
          </div>
        </div>

        {/* List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-card-foreground">
              <Receipt className="h-5 w-5" />
              <span>Invoices</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground">View and download invoice receipts</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.billingHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p>No invoices found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data?.billingHistory.map((record) => (
                  <div key={record.id} className="border border-border rounded-lg p-4 hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <span className="font-medium text-card-foreground">{record.description || `Invoice ${record.zohoInvoiceId || record.id.slice(-8)}`}</span>
                            {record.zohoInvoiceId && (
                              <span className="text-sm text-muted-foreground ml-2">#{record.zohoInvoiceId}</span>
                            )}
                            {record.customerName && (
                              <span className="text-sm text-muted-foreground ml-2">{record.customerName}</span>
                            )}
                          </div>
                          {getStatusBadge(record.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(record.createdAt)}</span>
                          </div>
                          {record.dueDate && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Due: {formatDate(record.dueDate)}</span>
                            </div>
                          )}
                          {record.paidAt && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Paid: {formatDate(record.paidAt)}</span>
                            </div>
                          )}
                          <div className="font-medium text-card-foreground">{formatCurrency(record.amount, record.currency)}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                          <Dialog>
                          <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelected(record)} className="border-border text-card-foreground hover:bg-accent">
                                <Eye className="h-4 w-4 mr-1" />
                                {(() => {
                                  const count = (record.receipts && record.receipts.length > 0)
                                    ? record.receipts.length
                                    : ((record.zohoInvoiceId || record.id) ? 1 : 0);
                                  return <>View Receipts ({count})</>;
                                })()}
                              </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-popover border-border">
                            <DialogHeader>
                              <DialogTitle className="text-popover-foreground">Invoice Details - {record.zohoInvoiceId || record.id}</DialogTitle>
                              <DialogDescription className="text-muted-foreground">View invoice details and download receipts</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* PDF viewer (inline) */}
                              <div>
                                <h4 className="font-medium text-card-foreground mb-2">Preview</h4>
                                <div className="border border-border rounded overflow-hidden h-[480px]">
                                  <iframe
                                    title={`invoice-${record.zohoInvoiceId || record.id}`}
                                    src={`/api/admin/zoho/invoices/${record.zohoInvoiceId || record.id}/pdf?stream=true&disposition=inline&token=${encodeURIComponent(getAuthHeaders().Authorization?.split(' ')[1] || '')}`}
                                    className="w-full h-full"
                                  />
                                </div>
                              </div>

                              {/* Direct Zoho PDF download */}
                              <div>
                                <h4 className="font-medium text-card-foreground mb-2">Invoice PDF</h4>
                                <Button size="sm" asChild>
                                  <a href={`/api/admin/zoho/invoices/${record.zohoInvoiceId || record.id}/pdf?stream=true&disposition=attachment&token=${encodeURIComponent(getAuthHeaders().Authorization?.split(' ')[1] || '')}`}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Get PDF
                                  </a>
                                </Button>
                              </div>

                              {/* Stored receipts (if any) */}
                              <div>
                                <h4 className="font-medium text-card-foreground mb-2">Receipts</h4>
                                {record.receipts.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">No stored receipts. Use &quot;Get PDF&quot; above.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {record.receipts.map((receipt) => (
                                      <div key={receipt.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                                        <div className="flex items-center space-x-2">
                                          <FileText className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm text-card-foreground">{receipt.fileName}</span>
                                        </div>
                                        <Button size="sm" asChild disabled={!receipt.fileUrl}>
                                          <a href={receipt.fileUrl || '#'} target="_blank" rel="noopener noreferrer">
                                            <Download className="h-4 w-4" />
                                          </a>
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">Showing page {data.pagination.page} of {data.pagination.totalPages}</div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1} className="border-border text-card-foreground hover:bg-accent">Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === data.pagination.totalPages} className="border-border text-card-foreground hover:bg-accent">Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

