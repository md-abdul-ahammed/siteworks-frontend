'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, FileText, Calendar, CreditCard, Receipt, Eye, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface BillingRecord {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'draft';
  description?: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  receipts: Receipt[];
  _count: {
    receipts: number;
  };
  // Zoho-specific fields
  zohoInvoiceId?: string;
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

const BillingHistory: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  const [billingData, setBillingData] = useState<BillingHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Add mounted ref to prevent calls after unmount
  const isMounted = useRef(true);
  
  // Add cache state
  const [cache, setCache] = useState<{
    [key: string]: {
      data: BillingHistoryData;
      timestamp: number;
    };
  }>({});

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  // Add request deduplication
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  
  // Add debounce timeout ref
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getCacheKey = (page: number, status: string) => {
    return `billing-${page}-${status}`;
  };

  const isCacheValid = (timestamp: number) => {
    return Date.now() - timestamp < CACHE_DURATION;
  };

  const fetchBillingHistory = useCallback(async (page = 1, status = '', forceRefresh = false) => {
    // Check if component is still mounted
    if (!isMounted.current) return;
    
    const cacheKey = getCacheKey(page, status);
    const cachedData = cache[cacheKey];

    console.log('🔄 Fetching billing history:', { page, status, forceRefresh, cacheKey });

    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && cachedData && isCacheValid(cachedData.timestamp)) {
      console.log('✅ Using cached data for:', cacheKey);
      if (isMounted.current) {
        setBillingData(cachedData.data);
        setLoading(false);
      }
      return;
    }

    // Check if request is already pending
    if (pendingRequests.has(cacheKey)) {
      console.log('⏳ Request already pending for:', cacheKey);
      return;
    }

    try {
      console.log('📡 Making API request for:', cacheKey);
      if (isMounted.current) {
        setLoading(true);
      }
      setPendingRequests(prev => new Set(prev).add(cacheKey));
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (status) {
        params.append('status', status);
      }

      const authHeaders = await getAuthHeaders();
      const response = await fetch(`/api/billing/history?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch billing history');
      }

      const data = await response.json();
      console.log('✅ API response received for:', cacheKey);
      
      if (isMounted.current) {
        setBillingData(data.data);
      }
      
      // Cache the result
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: data.data,
          timestamp: Date.now()
        }
      }));
    } catch (error) {
      console.error('❌ Error fetching billing history:', error);
      // Show empty state if API fails
      if (isMounted.current) {
        setBillingData({
          billingHistory: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
          summary: { totalBills: 0, totalAmount: 0, paidAmount: 0, pendingAmount: 0 }
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      setPendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(cacheKey);
        return newSet;
      });
    }
  }, [getAuthHeaders]);

  const syncBillingData = async () => {
    try {
      setSyncing(true);
      
      const authHeaders = await getAuthHeaders();
      const response = await fetch('/api/billing/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (!response.ok) {
        throw new Error('Failed to sync billing data');
      }

      const result = await response.json();
      console.log('Sync result:', result);
      
      // Clear cache and refresh billing history after sync
      setCache({});
      await fetchBillingHistory(currentPage, statusFilter, true);
      
    } catch (error) {
      console.error('Error syncing billing data:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    isMounted.current = true; // Set mounted to true when component mounts
    
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Debounce the API call
    debounceTimeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        fetchBillingHistory(currentPage, statusFilter);
      }
    }, 300); // 300ms debounce
    
    return () => {
      isMounted.current = false; // Set mounted to false when component unmounts
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [currentPage, statusFilter]);

  const handleDownloadReceipt = async (receipt: Receipt) => {
    try {
      setDownloadLoading(receipt.id);
      
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`/api/billing/receipts/${receipt.id}/download`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }

      const data = await response.json();
      
      // Create a download link for the PDF
      if (data.data.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.data.downloadUrl;
        link.download = receipt.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
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
      cancelled: { color: 'bg-gray-100 text-gray-800', text: 'Cancelled' },
      draft: { color: 'bg-blue-100 text-blue-800', text: 'Draft' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
      {/* Sync Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-card-foreground">Billing History</h2>
        <Button
          onClick={syncBillingData}
          disabled={syncing}
          variant="outline"
          size="sm"
          className="border-border text-card-foreground hover:bg-accent"
        >
          {syncing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Billing Data
            </>
          )}
        </Button>
      </div>

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
                {formatCurrency(billingData.summary.totalAmount, 'USD')}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(billingData.summary.paidAmount, 'USD')}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {formatCurrency(billingData.summary.pendingAmount, 'USD')}
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
        <Button
          variant={statusFilter === 'draft' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('draft')}
        >
          Draft
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
              <p className="text-sm mt-2">Click &quot;Sync Billing Data&quot; to fetch your billing data</p>
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
                            {record.description || `Payment ${record.zohoInvoiceId || record.id.slice(-8)}`}
                          </span>
                          {record.zohoInvoiceId && (
                            <span className="text-sm text-muted-foreground ml-2">
                              #{record.zohoInvoiceId}
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
                              <DialogTitle className="text-popover-foreground">
                                Invoice Details - {record.zohoInvoiceId || record.id}
                              </DialogTitle>
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