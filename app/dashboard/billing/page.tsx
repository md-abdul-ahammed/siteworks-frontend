'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
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


      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default BillingPage; 