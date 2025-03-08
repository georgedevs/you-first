"use client"

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import {
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  Calendar,
  User,
  Settings
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getUser();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('You have been signed out');
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Function to determine if a nav item is active
  const isNavItemActive = (itemHref: string) => {
    // Exact match for the dashboard home
    if (itemHref === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    
    // For other items, check if the pathname matches the href or is a sub-route
    // but don't mark dashboard as active for sub-routes
    if (itemHref !== '/dashboard' && pathname.startsWith(itemHref)) {
      return true;
    }
    
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - desktop */}
      <div
        className={`fixed inset-y-0 left-0 bg-white shadow-lg z-30 transition-all duration-300 transform lg:translate-x-0 lg:static lg:inset-0 w-64 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } hidden lg:block`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="9" />
                  <line x1="8" y1="7" x2="8" y2="17" />
                  <line x1="16" y1="7" x2="16" y2="17" />
                  <line x1="7" y1="10.5" x2="17" y2="10.5" />
                  <line x1="7" y1="13.5" x2="17" y2="13.5" />
                  <line x1="8" y1="7" x2="16" y2="17" />
                </svg>
              </div>
              <span className="text-lg font-bold">You-First</span>
            </Link>
            <button 
              className="lg:hidden text-gray-500 focus:outline-none"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav links */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = isNavItemActive(item.href);
              const Icon = item.icon;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-brand-blue text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick actions */}
          <div className="p-4">
            <button 
              className="w-full flex items-center justify-center space-x-2 bg-brand-orange hover:bg-brand-orange-dark text-white py-3 px-4 rounded-lg shadow-sm transition-colors"
              onClick={() => router.push('/customers/add')}
            >
              <Plus size={20} />
              <span>New Customer</span>
            </button>
          </div>

          {/* User profile & logout */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Patricia
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Admin
                </p>
              </div>
            </div>
            <button 
              className="w-full flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
              onClick={handleSignOut}
            >
              <LogOut size={18} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 bg-white shadow-lg z-30 transition-all duration-300 transform lg:translate-x-0 lg:static lg:inset-0 w-64 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="9" />
                  <line x1="8" y1="7" x2="8" y2="17" />
                  <line x1="16" y1="7" x2="16" y2="17" />
                  <line x1="7" y1="10.5" x2="17" y2="10.5" />
                  <line x1="7" y1="13.5" x2="17" y2="13.5" />
                  <line x1="8" y1="7" x2="16" y2="17" />
                </svg>
              </div>
              <span className="text-lg font-bold">You-First</span>
            </Link>
            <button 
              className="text-gray-500 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Mobile nav links */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = isNavItemActive(item.href);
              const Icon = item.icon;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-brand-blue text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile quick actions */}
          <div className="p-4">
            <button 
              className="w-full flex items-center justify-center space-x-2 bg-brand-orange hover:bg-brand-orange-dark text-white py-3 px-4 rounded-lg shadow-sm transition-colors"
              onClick={() => {
                router.push('/customers/add');
                setIsMobileMenuOpen(false);
              }}
            >
              <Plus size={20} />
              <span>New Customer</span>
            </button>
          </div>

          {/* Mobile user profile & logout */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Patricia
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Admin
                </p>
              </div>
            </div>
            <button 
              className="w-full flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
              onClick={handleSignOut}
            >
              <LogOut size={18} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top navigation */}
        <div className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <button
                  className="px-4 text-gray-500 focus:outline-none lg:hidden"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu size={24} />
                </button>
              </div>
              <div className="flex items-center">
                <button className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none relative">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}