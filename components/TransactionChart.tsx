'use client';

import React from 'react';
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

// Sample transaction data for charts
const monthlyData = [
  { month: 'Jan', paid: 1200, pending: 300, failed: 50 },
  { month: 'Feb', paid: 1800, pending: 150, failed: 25 },
  { month: 'Mar', paid: 2400, pending: 200, failed: 75 },
  { month: 'Apr', paid: 1600, pending: 400, failed: 100 },
  { month: 'May', paid: 2200, pending: 250, failed: 30 },
  { month: 'Jun', paid: 2800, pending: 180, failed: 40 },
];

const statusData = [
  { name: 'Paid', value: 12800, color: '#10B981' },
  { name: 'Pending', value: 1480, color: '#F59E0B' },
  { name: 'Failed', value: 320, color: '#EF4444' },
];

const weeklyData = [
  { day: 'Mon', amount: 420 },
  { day: 'Tue', amount: 680 },
  { day: 'Wed', amount: 520 },
  { day: 'Thu', amount: 890 },
  { day: 'Fri', amount: 750 },
  { day: 'Sat', amount: 340 },
  { day: 'Sun', amount: 280 },
];

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
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `£${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                  color: '#F9FAFB',
                }}
                formatter={(value, name) => [`£${value}`, name]}
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
            <AreaChart data={monthlyData}>
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
                tickFormatter={(value) => `£${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                  color: '#F9FAFB',
                }}
                formatter={(value, name) => [`£${value}`, name]}
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
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="day" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `£${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                  color: '#F9FAFB',
                }}
                formatter={(value) => [`£${value}`, 'Amount']}
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
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
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
                formatter={(value) => [`£${value}`, 'Amount']}
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