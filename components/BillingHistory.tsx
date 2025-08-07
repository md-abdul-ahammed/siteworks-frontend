'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, FileText, Calendar, CreditCard, Receipt, Eye, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchBillingHistory = async (page = 1, status = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (status) {
        params.append('status', status);
      }

      const response = await fetch(`/api/billing/history?${params}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch billing history');
      }

      const data = await response.json();
      setBillingData(data.data);
    } catch (error) {
      console.error('Error fetching billing history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingHistory(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  const handleDownloadReceipt = async (receipt: Receipt) => {
    try {
      setDownloadLoading(receipt.id);
      
      const response = await fetch(`/api/billing/receipts/${receipt.id}/download`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }

      const data = await response.json();
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = data.data.downloadUrl;
      link.download = data.data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Billing History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{billingData.summary.totalBills}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(billingData.summary.totalAmount, 'GBP')}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Paid Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(billingData.summary.paidAmount, 'GBP')}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Billing History</span>
          </CardTitle>
          <CardDescription>
            View and download your billing records and receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {billingData?.billingHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No billing records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {billingData?.billingHistory.map((record) => (
                <div
                  key={record.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {record.description || `Payment ${record.id.slice(-8)}`}
                        </span>
                        {getStatusBadge(record.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
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
                        
                        <div className="font-medium text-gray-900">
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
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Receipts ({record.receipts.length})
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Receipts</DialogTitle>
                              <DialogDescription>
                                Download your receipts for this payment
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2">
                              {record.receipts.map((receipt) => (
                                <div
                                  key={receipt.id}
                                  className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                  <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{receipt.fileName}</span>
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
              <div className="text-sm text-gray-600">
                Showing page {billingData.pagination.page} of {billingData.pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === billingData.pagination.totalPages}
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