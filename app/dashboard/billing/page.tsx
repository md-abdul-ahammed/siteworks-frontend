'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreditCard, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import BillingHistory from '@/components/BillingHistory';
import DashboardLayout from '@/components/DashboardLayout';

const BillingPage: React.FC = () => {
  const { user } = useAuth();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <ProtectedRoute useDashboardSkeleton={true}>
      <DashboardLayout>
        {/* Billing Header */}
        <div className="mb-8">
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent rounded-lg">
                <CreditCard className="h-8 w-8 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-card-foreground">Billing & Payments</h1>
                <p className="text-muted-foreground">Manage your billing information and payment history</p>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span className="text-2xl font-bold">$0.00</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span className="text-2xl font-bold">$0.00</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-gray-400 to-gray-500 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm">No payments yet</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Billing History */}
        <div className="mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Payment History</CardTitle>
              <CardDescription className="text-muted-foreground">View all your past transactions and invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <BillingHistory />
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Payment Methods</CardTitle>
              <CardDescription className="text-muted-foreground">Manage your saved payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No payment methods added yet</p>
                <p className="text-sm text-muted-foreground mt-2">Add a payment method to get started</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Billing Address</CardTitle>
              <CardDescription className="text-muted-foreground">Your billing address for invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                  <span className="text-sm text-muted-foreground">Address</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {user?.addressLine1 || 'Not provided'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                  <span className="text-sm text-muted-foreground">City</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {user?.city || 'Not provided'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                  <span className="text-sm text-muted-foreground">State</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {user?.state || 'Not provided'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                  <span className="text-sm text-muted-foreground">Postcode</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {user?.postcode || 'Not provided'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default BillingPage; 