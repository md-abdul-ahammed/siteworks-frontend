'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, FileText, Calendar, CreditCard, Receipt, Eye, Loader2 } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';

interface BillingRecord {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  description?: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  receipts: Receipt[];
  _count: {
    receipts: number;
  };
  // Zoho-specific fields
  invoiceNumber?: string;
  reference?: string;
  customerName?: string;
  customerId?: string;
  balance?: number;
  total?: number;
  notes?: string;
  terms?: string;
  lineItems?: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    taxPercentage: number;
    total: number;
  }>;
}

interface Receipt {
  id: string;
  fileName: string;
  fileUrl: string;
  isDownloaded: boolean;
  createdAt: string;
}

interface BillingSummary {
  totalBills: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

interface BillingHistoryData {
  billingHistory: BillingRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: BillingSummary;
}

// Dummy data for demonstration - Zoho-like structure
const dummyBillingData: BillingHistoryData = {
  billingHistory: [
    {
      id: 'INV-2024-001',
      amount: 299.99,
      currency: 'GBP',
      status: 'paid',
      description: 'Monthly Website Hosting - January 2024',
      dueDate: '2024-01-15T00:00:00Z',
      paidAt: '2024-01-12T14:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      // Zoho-specific fields
      invoiceNumber: 'INV-2024-001',
      reference: 'HOSTING-JAN-2024',
      customerName: 'John Smith',
      customerId: 'CUST-001',
      balance: 0,
      total: 299.99,
      notes: 'Monthly hosting service for website maintenance',
      terms: 'Payment due on receipt',
      lineItems: [
        {
          name: 'Website Hosting',
          description: 'Monthly hosting service',
          quantity: 1,
          unitPrice: 299.99,
          taxPercentage: 0,
          total: 299.99
        }
      ],
      receipts: [
        {
          id: 'receipt_001',
          fileName: 'invoice_INV-2024-001.pdf',
          fileUrl: '#',
          isDownloaded: false,
          createdAt: '2024-01-12T14:30:00Z'
        }
      ],
      _count: { receipts: 1 }
    },
    {
      id: 'INV-2024-002',
      amount: 149.50,
      currency: 'GBP',
      status: 'pending',
      description: 'Domain Registration Renewal',
      dueDate: '2024-02-20T00:00:00Z',
      createdAt: '2024-02-01T00:00:00Z',
      invoiceNumber: 'INV-2024-002',
      reference: 'DOMAIN-RENEWAL-2024',
      customerName: 'John Smith',
      customerId: 'CUST-001',
      balance: 149.50,
      total: 149.50,
      notes: 'Annual domain registration renewal',
      terms: 'Payment due within 30 days',
      lineItems: [
        {
          name: 'Domain Registration',
          description: 'Annual domain renewal for example.com',
          quantity: 1,
          unitPrice: 149.50,
          taxPercentage: 0,
          total: 149.50
        }
      ],
      receipts: [],
      _count: { receipts: 0 }
    },
    {
      id: 'INV-2024-003',
      amount: 599.99,
      currency: 'GBP',
      status: 'paid',
      description: 'Premium Support Package - Q1 2024',
      dueDate: '2024-03-01T00:00:00Z',
      paidAt: '2024-02-28T09:15:00Z',
      createdAt: '2024-02-15T00:00:00Z',
      invoiceNumber: 'INV-2024-003',
      reference: 'SUPPORT-Q1-2024',
      customerName: 'John Smith',
      customerId: 'CUST-001',
      balance: 0,
      total: 599.99,
      notes: 'Quarterly premium support package including 24/7 assistance',
      terms: 'Payment due on receipt',
      lineItems: [
        {
          name: 'Premium Support',
          description: 'Q1 2024 Premium Support Package',
          quantity: 1,
          unitPrice: 599.99,
          taxPercentage: 0,
          total: 599.99
        }
      ],
      receipts: [
        {
          id: 'receipt_002',
          fileName: 'invoice_INV-2024-003.pdf',
          fileUrl: '#',
          isDownloaded: true,
          createdAt: '2024-02-28T09:15:00Z'
        },
        {
          id: 'receipt_003',
          fileName: 'support_contract_Q1_2024.pdf',
          fileUrl: '#',
          isDownloaded: false,
          createdAt: '2024-02-28T09:15:00Z'
        }
      ],
      _count: { receipts: 2 }
    },
    {
      id: 'INV-2024-004',
      amount: 89.99,
      currency: 'GBP',
      status: 'failed',
      description: 'SSL Certificate Renewal',
      dueDate: '2024-02-10T00:00:00Z',
      createdAt: '2024-02-01T00:00:00Z',
      invoiceNumber: 'INV-2024-004',
      reference: 'SSL-RENEWAL-2024',
      customerName: 'John Smith',
      customerId: 'CUST-001',
      balance: 89.99,
      total: 89.99,
      notes: 'SSL certificate renewal for secure website',
      terms: 'Payment due immediately',
      lineItems: [
        {
          name: 'SSL Certificate',
          description: 'Annual SSL certificate renewal',
          quantity: 1,
          unitPrice: 89.99,
          taxPercentage: 0,
          total: 89.99
        }
      ],
      receipts: [],
      _count: { receipts: 0 }
    },
    {
      id: 'INV-2024-005',
      amount: 199.99,
      currency: 'GBP',
      status: 'paid',
      description: 'Website Maintenance - February 2024',
      dueDate: '2024-02-28T00:00:00Z',
      paidAt: '2024-02-25T16:45:00Z',
      createdAt: '2024-02-01T00:00:00Z',
      invoiceNumber: 'INV-2024-005',
      reference: 'MAINTENANCE-FEB-2024',
      customerName: 'John Smith',
      customerId: 'CUST-001',
      balance: 0,
      total: 199.99,
      notes: 'Monthly website maintenance and updates',
      terms: 'Payment due on receipt',
      lineItems: [
        {
          name: 'Website Maintenance',
          description: 'February 2024 maintenance service',
          quantity: 1,
          unitPrice: 199.99,
          taxPercentage: 0,
          total: 199.99
        }
      ],
      receipts: [
        {
          id: 'receipt_004',
          fileName: 'invoice_INV-2024-005.pdf',
          fileUrl: '#',
          isDownloaded: false,
          createdAt: '2024-02-25T16:45:00Z'
        }
      ],
      _count: { receipts: 1 }
    },
    {
      id: 'INV-2024-006',
      amount: 399.99,
      currency: 'GBP',
      status: 'pending',
      description: 'E-commerce Integration Service',
      dueDate: '2024-03-15T00:00:00Z',
      createdAt: '2024-03-01T00:00:00Z',
      invoiceNumber: 'INV-2024-006',
      reference: 'ECOMMERCE-INTEGRATION',
      customerName: 'John Smith',
      customerId: 'CUST-001',
      balance: 399.99,
      total: 399.99,
      notes: 'E-commerce platform integration and setup',
      terms: 'Payment due within 15 days',
      lineItems: [
        {
          name: 'E-commerce Integration',
          description: 'Complete e-commerce platform setup',
          quantity: 1,
          unitPrice: 399.99,
          taxPercentage: 0,
          total: 399.99
        }
      ],
      receipts: [],
      _count: { receipts: 0 }
    },
    {
      id: 'INV-2024-007',
      amount: 129.99,
      currency: 'GBP',
      status: 'paid',
      description: 'SEO Optimization Package',
      dueDate: '2024-01-31T00:00:00Z',
      paidAt: '2024-01-29T11:20:00Z',
      createdAt: '2024-01-15T00:00:00Z',
      invoiceNumber: 'INV-2024-007',
      reference: 'SEO-OPTIMIZATION-JAN',
      customerName: 'John Smith',
      customerId: 'CUST-001',
      balance: 0,
      total: 129.99,
      notes: 'Search engine optimization services',
      terms: 'Payment due on receipt',
      lineItems: [
        {
          name: 'SEO Optimization',
          description: 'January 2024 SEO optimization service',
          quantity: 1,
          unitPrice: 129.99,
          taxPercentage: 0,
          total: 129.99
        }
      ],
      receipts: [
        {
          id: 'receipt_005',
          fileName: 'invoice_INV-2024-007.pdf',
          fileUrl: '#',
          isDownloaded: false,
          createdAt: '2024-01-29T11:20:00Z'
        }
      ],
      _count: { receipts: 1 }
    },
    {
      id: 'INV-2024-008',
      amount: 79.99,
      currency: 'GBP',
      status: 'cancelled',
      description: 'Additional Storage Upgrade',
      dueDate: '2024-02-05T00:00:00Z',
      createdAt: '2024-02-01T00:00:00Z',
      invoiceNumber: 'INV-2024-008',
      reference: 'STORAGE-UPGRADE',
      customerName: 'John Smith',
      customerId: 'CUST-001',
      balance: 0,
      total: 79.99,
      notes: 'Additional storage space upgrade (cancelled)',
      terms: 'Payment due immediately',
      lineItems: [
        {
          name: 'Storage Upgrade',
          description: 'Additional 100GB storage space',
          quantity: 1,
          unitPrice: 79.99,
          taxPercentage: 0,
          total: 79.99
        }
      ],
      receipts: [],
      _count: { receipts: 0 }
    }
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 8,
    totalPages: 1
  },
  summary: {
    totalBills: 8,
    totalAmount: 1758.43,
    paidAmount: 1129.46,
    pendingAmount: 628.97
  }
};

const BillingHistory: React.FC = () => {
  // const { getAuthHeaders } = useAuth();
  const [billingData, setBillingData] = useState<BillingHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchBillingHistory = async (page = 1, status = '') => {
    try {
      setLoading(true);
      
      // For now, always use dummy data since API endpoint doesn't exist yet
      console.log('Using dummy data for billing history');
      const filteredData = filterDummyData(dummyBillingData, status);
      setBillingData(filteredData);
      
      // TODO: Uncomment when API is ready
      // const params = new URLSearchParams({
      //   page: page.toString(),
      //   limit: '10'
      // });
      
      // if (status) {
      //   params.append('status', status);
      // }

      // const response = await fetch(`/api/billing/history?${params}`, {
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${authService.getAccessToken()}`
      //   }
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to fetch billing history');
      // }

      // const data = await response.json();
      // setBillingData(data.data);
    } catch (error) {
      console.error('Error fetching billing history:', error);
      // Use dummy data when API fails
      console.log('Using dummy data due to API error');
      const filteredData = filterDummyData(dummyBillingData, status);
      setBillingData(filteredData);
    } finally {
      setLoading(false);
    }
  };

  const filterDummyData = (data: BillingHistoryData, status: string): BillingHistoryData => {
    if (!status) {
      return data;
    }

    const filteredHistory = data.billingHistory.filter(record => record.status === status);
    
    // Recalculate summary based on filtered data
    const summary = {
      totalBills: filteredHistory.length,
      totalAmount: filteredHistory.reduce((sum, record) => sum + record.amount, 0),
      paidAmount: filteredHistory
        .filter(record => record.status === 'paid')
        .reduce((sum, record) => sum + record.amount, 0),
      pendingAmount: filteredHistory
        .filter(record => record.status === 'pending')
        .reduce((sum, record) => sum + record.amount, 0)
    };

    return {
      ...data,
      billingHistory: filteredHistory,
      summary,
      pagination: {
        ...data.pagination,
        total: filteredHistory.length,
        totalPages: Math.ceil(filteredHistory.length / data.pagination.limit)
      }
    };
  };

  useEffect(() => {
    fetchBillingHistory(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  const handleDownloadReceipt = async (receipt: Receipt) => {
    try {
      setDownloadLoading(receipt.id);
      
      // Simulate download delay for dummy data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For dummy data, just show a success message
      console.log(`Downloading receipt: ${receipt.fileName}`);
      
      // TODO: Uncomment when API is ready
      // const response = await fetch(`/api/billing/receipts/${receipt.id}/download`, {
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${authService.getAccessToken()}`
      //   }
      // });
      
    } catch (error) {
      console.error('Error downloading receipt:', error);
    } finally {
      setDownloadLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', text: 'Paid' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
      cancelled: { color: 'bg-gray-100 text-gray-800', text: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency || 'GBP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-card-foreground">
            <Receipt className="h-5 w-5" />
            <span>Billing History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {billingData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{billingData.summary.totalBills}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {formatCurrency(billingData.summary.totalAmount, 'GBP')}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(billingData.summary.paidAmount, 'GBP')}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {formatCurrency(billingData.summary.pendingAmount, 'GBP')}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('')}
        >
          All
        </Button>
        <Button
          variant={statusFilter === 'paid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('paid')}
        >
          Paid
        </Button>
        <Button
          variant={statusFilter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={statusFilter === 'failed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('failed')}
        >
          Failed
        </Button>
      </div>

      {/* Billing Records */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-card-foreground">
            <Receipt className="h-5 w-5" />
            <span>Billing History</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            View and download your billing records and receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {billingData?.billingHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>No billing records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {billingData?.billingHistory.map((record) => (
                <div
                  key={record.id}
                  className="border border-border rounded-lg p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="font-medium text-card-foreground">
                            {record.description || `Payment ${record.id.slice(-8)}`}
                          </span>
                          {record.invoiceNumber && (
                            <span className="text-sm text-muted-foreground ml-2">
                              #{record.invoiceNumber}
                            </span>
                          )}
                          {record.reference && (
                            <span className="text-sm text-muted-foreground ml-2">
                              Ref: {record.reference}
                            </span>
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
                        
                        <div className="font-medium text-card-foreground">
                          {formatCurrency(record.amount, record.currency)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {record.receipts.length > 0 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRecord(record)}
                              className="border-border text-card-foreground hover:bg-accent"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Receipts ({record.receipts.length})
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-popover border-border">
                            <DialogHeader>
                              <DialogTitle className="text-popover-foreground">Invoice Details - {record.invoiceNumber || record.id}</DialogTitle>
                              <DialogDescription className="text-muted-foreground">
                                View invoice details and download receipts
                              </DialogDescription>
                            </DialogHeader>
                            
                            {/* Invoice Details */}
                            <div className="space-y-4">
                              {/* Customer Info */}
                              {record.customerName && (
                                <div className="bg-accent p-3 rounded-lg">
                                  <h4 className="font-medium text-card-foreground mb-1">Customer</h4>
                                  <p className="text-sm text-muted-foreground">{record.customerName}</p>
                                  {record.customerId && (
                                    <p className="text-xs text-muted-foreground">ID: {record.customerId}</p>
                                  )}
                                </div>
                              )}
                              
                              {/* Line Items */}
                              {record.lineItems && record.lineItems.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-card-foreground mb-2">Items</h4>
                                  <div className="space-y-2">
                                    {record.lineItems.map((item, index) => (
                                      <div key={index} className="flex justify-between items-center p-2 border border-border rounded">
                                        <div className="flex-1">
                                          <p className="font-medium text-sm text-card-foreground">{item.name}</p>
                                          {item.description && (
                                            <p className="text-xs text-muted-foreground">{item.description}</p>
                                          )}
                                          <p className="text-xs text-muted-foreground">
                                            Qty: {item.quantity} × {formatCurrency(item.unitPrice, record.currency)}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-medium text-sm text-card-foreground">
                                            {formatCurrency(item.total, record.currency)}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Notes and Terms */}
                              {(record.notes || record.terms) && (
                                <div className="space-y-2">
                                  {record.notes && (
                                    <div>
                                      <h4 className="font-medium text-card-foreground mb-1">Notes</h4>
                                      <p className="text-sm text-muted-foreground">{record.notes}</p>
                                    </div>
                                  )}
                                  {record.terms && (
                                    <div>
                                      <h4 className="font-medium text-card-foreground mb-1">Terms</h4>
                                      <p className="text-sm text-muted-foreground">{record.terms}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Receipts */}
                              <div>
                                <h4 className="font-medium text-card-foreground mb-2">Receipts</h4>
                                <div className="space-y-2">
                                  {record.receipts.map((receipt) => (
                                    <div
                                      key={receipt.id}
                                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-card-foreground">{receipt.fileName}</span>
                                      </div>
                                      <Button
                                        size="sm"
                                        onClick={() => handleDownloadReceipt(receipt)}
                                        disabled={downloadLoading === receipt.id}
                                      >
                                        {downloadLoading === receipt.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Download className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {billingData && billingData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing page {billingData.pagination.page} of {billingData.pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-border text-card-foreground hover:bg-accent"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === billingData.pagination.totalPages}
                  className="border-border text-card-foreground hover:bg-accent"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingHistory; 