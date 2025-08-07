'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import { Edit, Save, X, User, MapPin, Phone, Mail, Loader2 } from 'lucide-react';
import BillingHistory from '@/components/BillingHistory';

const DashboardPage: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    companyName: user?.companyName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: user?.addressLine1 || '',
    addressLine2: user?.addressLine2 || '',
    city: user?.city || '',
    state: user?.state || '',
    postcode: user?.postcode || '',
  });

  // Update editForm when user data changes
  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        companyName: user.companyName || '',
        email: user.email || '',
        phone: user.phone || '',
        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        city: user.city || '',
        state: user.state || '',
        postcode: user.postcode || '',
      });
    }
  }, [user]);

  // Individual field editing states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  
  // Field-specific loading states
  const [loadingFields, setLoadingFields] = useState<Set<string>>(new Set());

  const handleLogout = async () => {
    await logout();
  };

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const saveField = async (field: string) => {
    try {
      // Set loading state for this specific field
      setLoadingFields(prev => new Set(prev).add(field));
      
      const updatedForm = { ...editForm, [field]: tempValue };
      console.log('Sending profile update with data:', updatedForm);
      await updateProfile(updatedForm);
      setEditForm(updatedForm);
      setEditingField(null);
      setTempValue('');
    } catch (error) {
      console.error('Error updating field:', error);
    } finally {
      // Clear loading state for this specific field
      setLoadingFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValue('');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const renderEditableField = (field: string, label: string, value: string, icon?: React.ReactNode) => {
    const isEditing = editingField === field;
    const isLoading = loadingFields.has(field);
    
    return (
      <div
        className={`flex ${
          isEditing ? "items-end" : "items-center"
        } items-center justify-between p-3 bg-gray-50 rounded-lg`}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {icon && <div className="text-gray-500 flex-shrink-0">{icon}</div>}
          <div className="flex-1 min-w-0">
            <Label className="text-xs font-medium text-gray-500">{label}</Label>
            {isEditing ? (
              <Input
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="mt-1 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                autoFocus
                disabled={isLoading}
              />
            ) : (
              <p className="text-gray-900 font-medium truncate">{value || "Not provided"}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
          {isEditing ? (
            <>
              <Button
                size="sm"
                onClick={() => saveField(field)}
                disabled={isLoading}
                className="bg-gray-700 hover:bg-gray-800 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Saving...
                  </>
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={cancelEditing}
                disabled={isLoading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startEditing(field, value)}
              disabled={isLoading}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Edit className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute useDashboardSkeleton={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Image
                    src="/logo.webp"
                    alt="SiteWorks Logo"
                    width={120}
                    height={40}
                    className="h-8 w-auto"
                  />
                </div>
                
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Welcome back,</span>
                  <span className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/01.png" alt={user?.firstName} />
                        <AvatarFallback className="bg-gray-600 text-white">
                          {getInitials(user?.firstName || '', user?.lastName || '')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/avatars/01.png" alt={user?.firstName} />
                  <AvatarFallback className="bg-gray-600 text-white text-lg">
                    {getInitials(user?.firstName || '', user?.lastName || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h2>
                  <p className="text-gray-600">Here&apos;s what&apos;s happening with your account today.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.isActive 
                      ? 'bg-gray-200 text-gray-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.isVerified 
                      ? 'bg-gray-200 text-gray-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user?.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Member Since</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-gray-400 to-gray-500 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Last Login</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'N/A'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">Personal Information</CardTitle>
                <CardDescription className="text-gray-600">Your basic profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderEditableField('firstName', 'First Name', editForm.firstName, <User className="h-4 w-4" />)}
                {renderEditableField('lastName', 'Last Name', editForm.lastName, <User className="h-4 w-4" />)}
                {renderEditableField('companyName', 'Company Name', editForm.companyName, <User className="h-4 w-4" />)}
                {renderEditableField('email', 'Email', editForm.email, <Mail className="h-4 w-4" />)}
                {renderEditableField('phone', 'Phone', editForm.phone, <Phone className="h-4 w-4" />)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">Address Information</CardTitle>
                <CardDescription className="text-gray-600">Your contact address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderEditableField('addressLine1', 'Address Line 1', editForm.addressLine1, <MapPin className="h-4 w-4" />)}
                {renderEditableField('addressLine2', 'Address Line 2', editForm.addressLine2, <MapPin className="h-4 w-4" />)}
                {renderEditableField('city', 'City', editForm.city, <MapPin className="h-4 w-4" />)}
                {renderEditableField('state', 'State', editForm.state, <MapPin className="h-4 w-4" />)}
                {renderEditableField('postcode', 'Postcode', editForm.postcode, <MapPin className="h-4 w-4" />)}
              </CardContent>
            </Card>
          </div>

          {/* Billing History */}
          <BillingHistory />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage; 