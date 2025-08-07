'use client';

import React from 'react';
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
  ArrowDownRight
} from 'lucide-react';

interface SummaryCardProps {
  title: string;
  amount: number;
  currency?: string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
  description?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  amount,
  currency = '£',
  change,
  changeType,
  icon,
  color,
  description,
}) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
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
          {formatAmount(amount)}
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-xs ${getChangeColor(changeType)} mt-1`}>
            {getChangeIcon(changeType)}
            <span className="ml-1">
              {changeType === 'increase' ? '+' : ''}{change}% from last month
            </span>
          </div>
        )}
        {description && (
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
  // Default data if none provided
  const defaultData = {
    totalRevenue: 14600,
    totalPaid: 12800,
    totalPending: 1480,
    totalFailed: 320,
    monthlyGrowth: 12.5,
    transactionCount: 156,
  };

  const summaryData = data || defaultData;

  const summaryCards = [
    {
      title: 'Total Revenue',
      amount: summaryData.totalRevenue,
      change: summaryData.monthlyGrowth,
      changeType: 'increase' as const,
      icon: <DollarSign className="h-5 w-5 text-blue-400" />,
      color: 'from-blue-500 to-blue-600',
      description: 'All-time revenue generated',
    },
    {
      title: 'Paid Transactions',
      amount: summaryData.totalPaid,
      change: 8.2,
      changeType: 'increase' as const,
      icon: <CheckCircle className="h-5 w-5 text-green-400" />,
      color: 'from-green-500 to-green-600',
      description: 'Successfully completed payments',
    },
    {
      title: 'Pending Payments',
      amount: summaryData.totalPending,
      change: -15.3,
      changeType: 'decrease' as const,
      icon: <Clock className="h-5 w-5 text-yellow-400" />,
      color: 'from-yellow-500 to-yellow-600',
      description: 'Awaiting payment confirmation',
    },
    {
      title: 'Failed Transactions',
      amount: summaryData.totalFailed,
      change: -22.1,
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
          <SummaryCard key={index} {...card} />
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
                  {summaryData.transactionCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="text-lg font-semibold text-green-400">
                  {((summaryData.totalPaid / summaryData.totalRevenue) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Transaction</span>
                <span className="text-lg font-semibold text-card-foreground">
                  £{(summaryData.totalRevenue / summaryData.transactionCount).toFixed(0)}
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
                    +{summaryData.monthlyGrowth}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="text-lg font-semibold text-card-foreground">
                  £{(summaryData.totalRevenue * 0.15).toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Projected</span>
                <span className="text-lg font-semibold text-blue-400">
                  £{(summaryData.totalRevenue * 1.125).toFixed(0)}
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