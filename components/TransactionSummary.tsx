'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Clock, 
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SummaryCardProps {
  title: string;
  amount: number;
  currency?: string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
  description?: string;
  loading?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  amount,
  currency = '$',
  change,
  changeType,
  icon,
  color,
  description,
  loading = false,
}) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getChangeColor = (changeType?: 'increase' | 'decrease') => {
    if (!changeType) return 'text-muted-foreground';
    return changeType === 'increase' ? 'text-green-400' : 'text-red-400';
  };

  const getChangeIcon = (changeType?: 'increase' | 'decrease') => {
    if (!changeType) return null;
    return changeType === 'increase' ? (
      <ArrowUpRight className="h-4 w-4" />
    ) : (
      <ArrowDownRight className="h-4 w-4" />
    );
  };

  return (
    <Card className="relative overflow-hidden bg-card border-border">
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-5`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg bg-gradient-to-r ${color} bg-opacity-10`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-card-foreground">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            formatAmount(amount)
          )}
        </div>
        {change !== undefined && !loading && (
          <div className={`flex items-center text-xs ${getChangeColor(changeType)} mt-1`}>
            {getChangeIcon(changeType)}
            <span className="ml-1">
              {changeType === 'increase' ? '+' : ''}{Math.abs(change).toFixed(1)}% from last month
            </span>
          </div>
        )}
        {description && !loading && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface TransactionSummaryProps {
  data?: {
    totalRevenue: number;
    totalPaid: number;
    totalPending: number;
    totalFailed: number;
    monthlyGrowth: number;
    transactionCount: number;
  };
}

export const TransactionSummary: React.FC<TransactionSummaryProps> = ({ data }) => {
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
    totalFailed: 0,
    monthlyGrowth: 0,
    transactionCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        const authHeaders = await getAuthHeaders();
        const response = await fetch('/api/dashboard/analytics', {
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          }
        });

        if (response.ok) {
          const result = await response.json();
          setSummaryData(result.data.summary);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [getAuthHeaders]);

  // Use provided data if available, otherwise use fetched data
  const finalData = data || summaryData;

  const summaryCards = [
    {
      title: 'Total Revenue',
      amount: finalData.totalRevenue,
      change: finalData.monthlyGrowth,
      changeType: finalData.monthlyGrowth >= 0 ? 'increase' as const : 'decrease' as const,
      icon: <DollarSign className="h-5 w-5 text-blue-400" />,
      color: 'from-blue-500 to-blue-600',
      description: 'All-time revenue generated',
    },
    {
      title: 'Paid Transactions',
      amount: finalData.totalPaid,
      change: finalData.transactionCount > 0 ? ((finalData.totalPaid / finalData.totalRevenue) * 100) : 0,
      changeType: 'increase' as const,
      icon: <CheckCircle className="h-5 w-5 text-green-400" />,
      color: 'from-green-500 to-green-600',
      description: 'Successfully completed payments',
    },
    {
      title: 'Pending Payments',
      amount: finalData.totalPending,
      change: finalData.transactionCount > 0 ? ((finalData.totalPending / finalData.totalRevenue) * 100) : 0,
      changeType: 'decrease' as const,
      icon: <Clock className="h-5 w-5 text-yellow-400" />,
      color: 'from-yellow-500 to-yellow-600',
      description: 'Awaiting payment confirmation',
    },
    {
      title: 'Failed Transactions',
      amount: finalData.totalFailed,
      change: finalData.transactionCount > 0 ? ((finalData.totalFailed / finalData.totalRevenue) * 100) : 0,
      changeType: 'decrease' as const,
      icon: <AlertCircle className="h-5 w-5 text-red-400" />,
      color: 'from-red-500 to-red-600',
      description: 'Unsuccessful payment attempts',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <SummaryCard key={index} {...card} loading={loading} />
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground">
              Transaction Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Transactions</span>
                <span className="text-lg font-semibold text-card-foreground">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : finalData.transactionCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="text-lg font-semibold text-green-400">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                    finalData.totalRevenue > 0 ? ((finalData.totalPaid / finalData.totalRevenue) * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Transaction</span>
                <span className="text-lg font-semibold text-card-foreground">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                    finalData.transactionCount > 0 ? `$${(finalData.totalRevenue / finalData.transactionCount).toFixed(0)}` : '$0'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground">
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Growth Rate</span>
                <div className="flex items-center text-green-400">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-lg font-semibold">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                      `${finalData.monthlyGrowth >= 0 ? '+' : ''}${finalData.monthlyGrowth.toFixed(1)}%`}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="text-lg font-semibold text-card-foreground">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                    `$${(finalData.totalRevenue * 0.15).toFixed(0)}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Projected</span>
                <span className="text-lg font-semibold text-blue-400">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                    `$${(finalData.totalRevenue * 1.125).toFixed(0)}`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionSummary;