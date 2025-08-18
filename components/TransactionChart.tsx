'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, PieChart as PieChartIcon, TrendingUp, BarChart3, Activity } from 'lucide-react';

interface ChartData {
  monthlyData: Array<{
    month: string;
    paid: number;
    pending: number;
    failed: number;
  }>;
  weeklyData: Array<{
    day: string;
    amount: number;
  }>;
  statusData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

interface TransactionChartProps {
  type: 'line' | 'area' | 'bar' | 'pie';
  title: string;
  height?: number;
}

export const TransactionChart: React.FC<TransactionChartProps> = ({
  type,
  title,
  height = 300,
}) => {
  const [chartData, setChartData] = useState<ChartData>({
    monthlyData: [],
    weeklyData: [],
    statusData: []
  });
  const [loading, setLoading] = useState(true);
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    const fetchChartData = async () => {
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
          setChartData(result.data.charts);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [getAuthHeaders]);

  // Check if data is empty
  const isDataEmpty = () => {
    switch (type) {
      case 'line':
      case 'area':
        return !chartData.monthlyData || chartData.monthlyData.length === 0 || 
               chartData.monthlyData.every(item => item.paid === 0 && item.pending === 0 && item.failed === 0);
      case 'bar':
        return !chartData.weeklyData || chartData.weeklyData.length === 0 || 
               chartData.weeklyData.every(item => item.amount === 0);
      case 'pie':
        return !chartData.statusData || chartData.statusData.length === 0 || 
               chartData.statusData.every(item => item.value === 0);
      default:
        return true;
    }
  };

  // Get appropriate icon for empty state
  const getEmptyStateIcon = () => {
    switch (type) {
      case 'line':
      case 'area':
        return <TrendingUp className="h-12 w-12 text-muted-foreground" />;
      case 'bar':
        return <BarChart3 className="h-12 w-12 text-muted-foreground" />;
      case 'pie':
        return <PieChartIcon className="h-12 w-12 text-muted-foreground" />;
      default:
        return <Activity className="h-12 w-12 text-muted-foreground" />;
    }
  };

  // Get appropriate message for empty state
  const getEmptyStateMessage = () => {
    switch (type) {
      case 'line':
      case 'area':
        return 'No transaction data available';
      case 'bar':
        return 'No weekly performance data available';
      case 'pie':
        return 'No transaction status data available';
      default:
        return 'No data available';
    }
  };

  const renderEmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
        {getEmptyStateIcon()}
        <h3 className="text-lg font-medium text-card-foreground mt-4 mb-2">
          {getEmptyStateMessage()}
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {type === 'pie' 
            ? 'Transaction status data will appear here once you have billing records.'
            : 'Chart data will appear here once transactions are available.'
          }
        </p>
      </div>
    );
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    // Show empty state if no data
    if (isDataEmpty()) {
      return renderEmptyState();
    }

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                  color: '#F9FAFB',
                }}
                formatter={(value, name) => [`$${value}`, name]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="paid"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Paid"
              />
              <Line
                type="monotone"
                dataKey="pending"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                name="Pending"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chartData.monthlyData}>
              <defs>
                <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                  color: '#F9FAFB',
                }}
                formatter={(value, name) => [`$${value}`, name]}
              />
              <Area
                type="monotone"
                dataKey="paid"
                stackId="1"
                stroke="#10B981"
                fill="url(#colorPaid)"
                name="Paid"
              />
              <Area
                type="monotone"
                dataKey="pending"
                stackId="1"
                stroke="#F59E0B"
                fill="url(#colorPending)"
                name="Pending"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="day" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                  color: '#F9FAFB',
                }}
                formatter={(value) => [`$${value}`, 'Amount']}
              />
              <Bar
                dataKey="amount"
                fill="#6366F1"
                radius={[4, 4, 0, 0]}
                name="Daily Amount"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData.statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                  color: '#F9FAFB',
                }}
                formatter={(value) => [`$${value}`, 'Amount']}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">{title}</h3>
      {renderChart()}
    </div>
  );
};

export default TransactionChart;