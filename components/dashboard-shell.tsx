'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserNav } from '@/components/user-nav';
import { cn } from '@/lib/utils';
import { getCurrentSession, getUserData, logoutUser } from '@/lib/auth';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  User,
  Shield,
  LogOut,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const isDemo = pathname?.includes('/demo');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (isDemo) {
        setIsLoading(false);
        return;
      }

      try {
        const { session, error } = await getCurrentSession();

        if (error || !session) {
          console.error('Authentication error:', error);
          router.push('/login');
          return;
        }

        const { userData, error: userError } = await getUserData(
          session.user.id
        );

        if (userError) {
          console.error('Error fetching user data:', userError);
        }

        setUser({
          ...session.user,
          ...userData,
        });
      } catch (error) {
        console.error('Session verification error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, isDemo]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (isDemo) return; // Skip admin check for demo users

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        // Check if user's email exists in the admins table
        const { data } = await supabase
          .from('admins')
          .select('*')
          .eq('email', session.user.email)
          .single();

        setIsAdmin(!!data);
      }
    };

    checkAdmin();
  }, [isDemo]);

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p>Loading...</p>
      </div>
    );
  }

  // Define navigation routes based on mode (demo or regular)
  const navItems = [
    {
      href: isDemo ? '/dashboard/demo' : '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className='h-5 w-5' />,
      active: isDemo
        ? pathname === '/dashboard/demo'
        : pathname === '/dashboard',
    },
    {
      href: isDemo ? '/dashboard/demo/transactions' : '/dashboard/transactions',
      label: 'Transactions',
      icon: <Receipt className='h-5 w-5' />,
      active: pathname?.includes('/transactions'),
    },
    {
      href: isDemo ? '/dashboard/demo/budget' : '/dashboard/budget',
      label: 'Budget',
      icon: <PieChart className='h-5 w-5' />,
      active: pathname?.includes('/budget'),
    },
    {
      href: isDemo ? '/dashboard/demo/profile' : '/dashboard/profile',
      label: 'Profile',
      icon: <User className='h-5 w-5' />,
      active: pathname?.includes('/profile'),
    },
  ];

  // Add admin route if applicable
  if (isAdmin && !isDemo) {
    navItems.push({
      href: '/admin/password-requests',
      label: 'Admin Dashboard',
      icon: <Shield className='h-5 w-5' />,
      active: pathname?.includes('/admin'),
    });
  }

  return (
    <div className='flex min-h-screen'>
      {/* Sidebar */}
      <div className='hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r'>
        <div className='flex-1 flex flex-col min-h-0'>
          {/* Logo */}
          <div className='flex items-center h-16 flex-shrink-0 px-4 border-b'>
            <Link
              href={isDemo ? '/dashboard/demo' : '/dashboard'}
              className='flex items-center gap-2 font-semibold text-xl'
            >
              <div className='h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white'>
                <span>SW</span>
              </div>
              <span>SpendWise</span>
            </Link>
          </div>

          {/* Navigation */}
          <div className='flex-1 flex flex-col overflow-y-auto pt-5 pb-4'>
            <nav className='mt-5 flex-1 px-4 space-y-1'>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    item.active
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {item.icon}
                  <span className='ml-3'>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* User section */}
          <div className='flex-shrink-0 flex flex-col border-t p-4'>
            {isDemo ? (
              <div className='flex items-center gap-3'>
                <div className='h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600'>
                  <span className='text-sm font-medium'>D</span>
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-medium'>Demo User</p>
                  <p className='text-xs text-gray-500'>demo@example.com</p>
                </div>
              </div>
            ) : (
              user && (
                <div className='flex items-center gap-3'>
                  <div className='h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600'>
                    <span className='text-sm font-medium'>
                      {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                    </span>
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>
                      {user?.first_name
                        ? `${user.first_name} ${user.last_name || ''}`
                        : user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className='text-xs text-gray-500'>{user?.email}</p>
                  </div>
                </div>
              )
            )}

            {/* Conditional logout or exit demo button */}
            {isDemo ? (
              <Link
                href='/login'
                className='mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
              >
                <LogOut className='mr-2 h-4 w-4' />
                Exit Demo
              </Link>
            ) : (
              <button
                onClick={async () => {
                  try {
                    const { error } = await logoutUser();
                    if (error) throw error;
                    router.push('/login');
                  } catch (error) {
                    console.error('Error logging out:', error);
                    toast({
                      title: 'Error logging out',
                      description: 'Please try again',
                      variant: 'destructive',
                    });
                  }
                }}
                className='mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
              >
                <LogOut className='mr-2 h-4 w-4' />
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className='md:pl-64 flex flex-col flex-1'>
        <div className='sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white border-b'>
          <div className='flex items-center justify-between'>
            <Link
              href={isDemo ? '/dashboard/demo' : '/dashboard'}
              className='flex items-center gap-2 font-semibold text-xl p-2'
            >
              <div className='h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white'>
                <span>SW</span>
              </div>
              <span>SpendWise</span>
            </Link>

            {/* Admin badge if applicable */}
            {isAdmin && !isDemo && (
              <Link
                href='/admin/password-requests'
                className='inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 mr-4 rounded-md'
              >
                <Shield className='h-4 w-4' />
                <span>Admin</span>
              </Link>
            )}

            {/* Demo badge */}
            {isDemo && (
              <Link
                href='/login'
                className='inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 mr-4 rounded-md'
              >
                <LogOut className='h-4 w-4' />
                <span>Exit Demo</span>
              </Link>
            )}
          </div>
        </div>

        {/* Main content */}
        <main className='flex-1'>
          {/* Demo notice */}
          {isDemo && (
            <div className='bg-yellow-100 p-2 text-sm text-center'>
              <p>
                You are viewing a demo version.{' '}
                <Link
                  href='/signup'
                  className='text-purple-600 hover:underline'
                >
                  Sign up
                </Link>{' '}
                to create your own account.
              </p>
            </div>
          )}

          {/* Page content */}
          <div className='py-6 px-4 sm:px-6 lg:px-8'>{children}</div>
        </main>

        {/* Footer */}
        <footer className='bg-white border-t py-4 text-center text-sm text-gray-500'>
          <p>
            &copy; {new Date().getFullYear()} SpendWise. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
