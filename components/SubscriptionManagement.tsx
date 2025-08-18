import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, X, AlertTriangle, Clock, FileText, RefreshCw, Pause, StopCircle, Activity } from 'lucide-react';
import toast from '@/lib/toast';


interface Subscription {
  id: string;
  status: string;
  amount: number;
  currency: string;
  interval: string;
  intervalCount: number;
  name: string;
  description: string;
  startDate: string;
  nextPaymentDate: string;
  mandateStatus: string;
}

interface SubscriptionData {
  hasSubscription: boolean;
  subscriptions: Subscription[];
  subscription: Subscription | null; // For backward compatibility
}

const SubscriptionManagement: React.FC = () => {
  const { getAuthHeaders, user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);



  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        console.log('❌ User not authenticated during fetch');
        return;
      }

      // Debug logging
      console.log('🔍 SubscriptionManagement - User state:', {
        user: user,
        isAuthenticated: isAuthenticated,
        hasUser: !!user
      });

      const authHeaders = await getAuthHeaders();
      console.log('🔍 SubscriptionManagement - Auth headers:', {
        hasAuthorization: !!authHeaders.Authorization,
        authorizationLength: authHeaders.Authorization?.length || 0,
        tokenPreview: authHeaders.Authorization ? authHeaders.Authorization.substring(0, 50) + '...' : 'No token'
      });

      const response = await fetch('/api/billing/subscription', {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Subscription API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        // Handle authentication errors
        if (response.status === 401) {
          console.log('🔐 Authentication error, redirecting to sign-in...');
          
          // Check if it's a specific auth required error
          if (errorData.code === 'AUTH_REQUIRED') {
            toast.error('Please sign in to access subscription management');
          } else {
            toast.error('Session expired. Please sign in again.');
          }
          
          router.push('/sign-in');
          return;
        }
        
        throw new Error(errorData.error || 'Failed to fetch subscription data');
      }

      const data = await response.json();
      console.log('📊 Subscription data received:', data);
      
      // Log each subscription status for debugging
      if (data.subscriptions && Array.isArray(data.subscriptions)) {
        console.log('🔍 Subscription statuses:');
        data.subscriptions.forEach((sub: Subscription, index: number) => {
          console.log(`   ${index + 1}. ${sub.name}: ${sub.status} (ID: ${sub.id})`);
        });
      }
      
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, getAuthHeaders, router]);

  // Check authentication on component mount
  useEffect(() => {
    const init = async () => {
      // Only check if user is authenticated, don't be aggressive about token refresh
      if (isAuthenticated && user) {
        console.log('✅ User authenticated:', user?.email);
        fetchSubscription();
      } else {
        console.log('❌ User not authenticated, redirecting to sign-in...');
        toast.error('Please sign in to access subscription management');
        router.push('/sign-in');
      }
    };
    
    init();
  }, [isAuthenticated, user, router, fetchSubscription]);

  const handleCancelSubscription = async (subscriptionId?: string) => {
    console.log('🔍 handleCancelSubscription called with:', subscriptionId);
    
    if (!subscriptionData?.subscriptions || subscriptionData.subscriptions.length === 0) {
      console.log('❌ No subscriptions data available');
      return;
    }

    // Use provided subscriptionId or the first subscription's ID
    const targetSubscriptionId = subscriptionId || subscriptionData.subscriptions[0]?.id;
    console.log('🔍 Target subscription ID:', targetSubscriptionId);
    
    if (!targetSubscriptionId) {
      console.log('❌ No target subscription ID found');
      return;
    }

    try {
      setIsActionLoading(true);

      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        console.log('❌ User not authenticated during cancel');
        return;
      }

      const authHeaders = await getAuthHeaders();
      console.log('🔍 Making DELETE request to /api/billing/subscription');
      console.log('🔍 Request body:', { subscriptionId: targetSubscriptionId });
      
      const response = await fetch('/api/billing/subscription', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({ subscriptionId: targetSubscriptionId })
      });
      
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response status text:', response.statusText);

      const data = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          console.log('🔐 Authentication error during cancel, redirecting to sign-in...');
          toast.error('Session expired. Please sign in again.');
          router.push('/sign-in');
          return;
        }
        
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      // Check if the backend returned an error even with 200 status
      if (data.success === false) {
        console.error('❌ Backend returned error:', data);
        throw new Error(data.message || 'Cancellation failed');
      }

      // Show appropriate message based on response
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.success('Subscription cancelled successfully!');
      }
      
      // Add a small delay to allow GoCardless to update the status
      console.log('⏳ Waiting for GoCardless to update subscription status...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Always refresh subscription data to get latest status from GoCardless
      await fetchSubscription();
      
      // If the subscription is still showing as active, try one more time after a longer delay
      const currentData = await fetch('/api/billing/subscription', {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
      }).then(res => res.json());
      
      const targetSubscription = currentData.subscriptions?.find((sub: Subscription) => sub.id === targetSubscriptionId);
      if (targetSubscription && targetSubscription.status === 'active') {
        console.log('⚠️ Subscription still showing as active, waiting longer...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await fetchSubscription();
        
        // If still active after retry, show a message to the user
        const finalData = await fetch('/api/billing/subscription', {
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          },
        }).then(res => res.json());
        
        const finalSubscription = finalData.subscriptions?.find((sub: Subscription) => sub.id === targetSubscriptionId);
        if (finalSubscription && finalSubscription.status === 'active') {
          toast.info('Cancellation request sent. Status may take a few minutes to update. Click "Sync" to refresh.');
        }
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('already cancelled')) {
          toast.info('This subscription has already been cancelled');
          // Refresh data to show current status
          await fetchSubscription();
        } else {
          toast.error(`Failed to cancel subscription: ${error.message}`);
        }
      } else {
        toast.error('Failed to cancel subscription. Please try again.');
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSyncSubscriptions = async () => {
    try {
      setIsActionLoading(true);

      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        console.log('❌ User not authenticated during sync');
        return;
      }

      const authHeaders = await getAuthHeaders();
      const response = await fetch('/api/billing/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          console.log('🔐 Authentication error during sync, redirecting to sign-in...');
          toast.error('Session expired. Please sign in again.');
          router.push('/sign-in');
          return;
        }
        
        throw new Error(data.error || 'Failed to sync subscriptions');
      }

      toast.success(data.message || 'Subscriptions synced successfully!');
      fetchSubscription();
    } catch (error) {
      console.error('Error syncing subscriptions:', error);
      toast.error(`Failed to sync subscriptions: ${error instanceof Error ? error.message : 'Please try again'}`);
    } finally {
      setIsActionLoading(false);
    }
  };





  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100);
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
      <Card className="bg-card border-border shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border px-4 py-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-background rounded-lg shadow-sm border border-border">
                <FileText className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">Subscription Status</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-muted border-t-foreground mx-auto mb-3"></div>
              <p className="text-muted-foreground font-medium text-sm">Loading subscription details...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border px-4 py-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-background rounded-lg shadow-sm border border-border">
                <FileText className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">Subscription Status</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full mb-3">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">Unable to Load Subscription</h3>
            <p className="text-muted-foreground mb-4 max-w-sm mx-auto text-sm">{error}</p>
            <Button 
              onClick={fetchSubscription} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 text-sm"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Enhanced status badge with better visual indicators
  const getEnhancedStatusBadge = (status: string) => {
    const statusConfig = {
      active: { 
        icon: Activity, 
        color: 'bg-green-500/15 text-green-600 border-green-500/30',
        pulse: true 
      },
      paused: { 
        icon: Pause, 
        color: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30',
        pulse: false 
      },
      cancelled: { 
        icon: StopCircle, 
        color: 'bg-red-500/15 text-red-600 border-red-500/30',
        pulse: false 
      },
      pending: { 
        icon: Clock, 
        color: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
        pulse: true 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.pulse && <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />}
        <span className="capitalize">{status.replace('_', ' ')}</span>
      </div>
    );
  };

  return (
    <Card className="bg-card border-border shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border px-6 py-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Subscription Management</h2>
              <p className="text-sm text-muted-foreground">Manage your active subscriptions and billing</p>
            </div>
          </div>
          <Button
            onClick={handleSyncSubscriptions}
            disabled={isActionLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-primary/5"
          >
            <RefreshCw className={`h-4 w-4 ${isActionLoading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {subscriptionData?.hasSubscription && subscriptionData.subscriptions && subscriptionData.subscriptions.length > 0 ? (
          <div className="overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold text-foreground">Subscription</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground">Amount</TableHead>
                    <TableHead className="font-semibold text-foreground">Billing Cycle</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptionData.subscriptions.map((subscription, index) => (
                    <TableRow key={subscription.id} className="hover:bg-muted/30 transition-colors group">
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-2">
                              {subscription.name}
                              {index === 0 && (
                                <Badge variant="secondary" className="text-xs">Primary</Badge>
                              )}
                            </div>
                            {subscription.description && (
                              <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                                {subscription.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getEnhancedStatusBadge(subscription.status)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-semibold text-foreground">
                          {formatCurrency(subscription.amount, subscription.currency)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {subscription.intervalCount > 1 
                            ? `Every ${subscription.intervalCount} ${subscription.interval}s`
                            : `Every ${subscription.interval}`
                          }
                        </div>
                      </TableCell>
                      
                       <TableCell className="text-right">
                         {subscription.status === 'active' && (
                           <Button
                             variant="destructive"
                             size="sm"
                             onClick={() => handleCancelSubscription(subscription.id)}
                             disabled={isActionLoading}
                             className="transition-all hover:shadow-md"
                           >
                             {isActionLoading ? (
                               <>
                                 <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                                 Cancelling...
                               </>
                             ) : (
                               <>
                                 <X className="h-3 w-3 mr-1" />
                                 Cancel
                               </>
                             )}
                           </Button>
                         )}
                         {subscription.status === 'paused' && (
                           <Button
                             variant="destructive"
                             size="sm"
                             onClick={() => handleCancelSubscription(subscription.id)}
                             disabled={isActionLoading}
                             className="transition-all hover:shadow-md"
                           >
                             <X className="h-3 w-3 mr-1" />
                             Cancel
                           </Button>
                         )}
                         {subscription.status === 'cancelled' && (
                           <Badge variant="secondary" className="text-xs">
                             Cancelled
                           </Badge>
                         )}
                         {/* Handle any other status */}
                         {!['active', 'paused', 'cancelled'].includes(subscription.status) && (
                           <Badge variant="outline" className="text-xs">
                             {subscription.status}
                           </Badge>
                         )}
                       </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {subscriptionData.subscriptions.map((subscription, index) => (
                <Card key={subscription.id} className="border-border/50 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            {subscription.name}
                            {index === 0 && (
                              <Badge variant="secondary" className="text-xs">Primary</Badge>
                            )}
                          </div>
                          <div className="mt-1">
                            {getEnhancedStatusBadge(subscription.status)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-foreground">
                          {formatCurrency(subscription.amount, subscription.currency)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          per {subscription.interval}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Started</div>
                        <div className="text-sm font-medium">{formatDate(subscription.startDate)}</div>
                      </div>
                      {subscription.nextPaymentDate && (
                        <div className="bg-blue-500/10 rounded-lg p-3">
                          <div className="text-xs text-blue-600 mb-1">Next Payment</div>
                          <div className="text-sm font-medium">{formatDate(subscription.nextPaymentDate)}</div>
                        </div>
                      )}
                    </div>



                    {(subscription.status === 'active' || subscription.status === 'paused') && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelSubscription(subscription.id)}
                        disabled={isActionLoading}
                        className="w-full"
                      >
                        <X className="h-3 w-3 mr-2" />
                        Cancel Subscription
                      </Button>
                    )}
                    {subscription.status === 'cancelled' && (
                      <div className="text-center py-2">
                        <Badge variant="secondary" className="text-xs">
                          Subscription Cancelled
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {isActionLoading && (
              <div className="flex items-center justify-center py-6 border-t border-border">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-muted border-t-foreground"></div>
                <span className="ml-3 text-muted-foreground font-medium">Processing...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 px-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-muted/30 rounded-full mb-6">
              <CreditCard className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">No Active Subscriptions</h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              You don&apos;t have any active subscriptions at the moment. Contact support to set up a new subscription.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagement;
