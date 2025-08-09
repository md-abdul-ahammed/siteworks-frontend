'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Redirect if not admin (only if user is loaded and not admin)
  if (user && user.role !== 'admin') {
    console.log('❌ AdminLayout: User is not admin, redirecting to dashboard');
    router.push('/dashboard');
    return null;
  }

  // Show loading state while auth is initializing
  if (!user && isLoading) {
    console.log('⏳ AdminLayout: Loading auth state...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/admin/dashboard',
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      current: pathname === '/admin/users',
    },
    {
      name: 'Billing',
      href: '/admin/billing',
      icon: CreditCard,
      current: pathname === '/admin/billing',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex dashboard-dark">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and close button (aligned with DashboardLayout) */}
          <div className="flex items-center justify-center p-4 border-b border-border relative">
            <div className="flex items-center justify-center">
              <Image
                src="/logo.webp"
                alt="SiteWorks Logo"
                width={100}
                height={100}
                className="w-24 object-contain"
                priority
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-foreground hover:bg-accent absolute right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User profile section */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center space-x-2 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/01.png" alt={user?.firstName} />
                <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                  {getInitials(user?.firstName || '', user?.lastName || '')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs border-border text-foreground hover:bg-accent">
                  <LogOut className="h-3 w-3 mr-2" />
                  Logout
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-popover border-border" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-popover-foreground">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive hover:bg-accent">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top header */}
        <header className="bg-card shadow-sm border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14 sm:py-0 lg:py-[31px]">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-foreground hover:bg-accent"
              >
                <Menu className="h-5 w-5" />
              </Button>
              {/* <div className="ml-4 lg:ml-0">
                <h1 className="text-lg font-semibold text-foreground">
                  {navigation.find(item => item.current)?.name || 'Admin'}
                </h1>
              </div> */}
            </div>

            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-7 w-7 rounded-full text-foreground hover:bg-accent">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src="/avatars/01.png" alt={user?.firstName} />
                      <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                        {getInitials(user?.firstName || '', user?.lastName || '')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-popover-foreground">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive hover:bg-accent">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 