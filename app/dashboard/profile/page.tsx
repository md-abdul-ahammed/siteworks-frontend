'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Save, X, User, MapPin, Phone, Mail, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
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
        } items-center justify-between p-3 bg-accent rounded-lg`}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {icon && <div className="text-muted-foreground flex-shrink-0">{icon}</div>}
          <div className="flex-1 min-w-0">
            <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
            {isEditing ? (
              <Input
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="mt-1 border-border focus:border-ring focus:ring-ring bg-input text-input-foreground"
                autoFocus
                disabled={isLoading}
              />
            ) : (
              <p className="text-card-foreground font-medium truncate">{value || "Not provided"}</p>
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
                className="border-border text-card-foreground hover:bg-accent"
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
              className="text-muted-foreground hover:text-card-foreground hover:bg-accent"
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
      <DashboardLayout>
        {/* Profile Header */}
        <div className="mb-8">
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/avatars/01.png" alt={user?.firstName} />
                <AvatarFallback className="bg-accent text-accent-foreground text-xl">
                  {getInitials(user?.firstName || '', user?.lastName || '')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-card-foreground">Profile Settings</h1>
                <p className="text-muted-foreground">Manage your personal information and contact details</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Personal Information</CardTitle>
              <CardDescription className="text-muted-foreground">Your basic profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderEditableField('firstName', 'First Name', editForm.firstName, <User className="h-4 w-4" />)}
              {renderEditableField('lastName', 'Last Name', editForm.lastName, <User className="h-4 w-4" />)}
              {renderEditableField('companyName', 'Company Name', editForm.companyName, <User className="h-4 w-4" />)}
              {renderEditableField('email', 'Email', editForm.email, <Mail className="h-4 w-4" />)}
              {renderEditableField('phone', 'Phone', editForm.phone, <Phone className="h-4 w-4" />)}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Address Information</CardTitle>
              <CardDescription className="text-muted-foreground">Your contact address</CardDescription>
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
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ProfilePage; 