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

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
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
  }, [router, isDemo, pathname]);

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

  // Define navigation routes including the admin route if user is admin
  // Adjust paths based on whether we're in demo mode or not
  const baseUrl = isDemo ? '/dashboard/demo' : '/dashboard';

  const navRoutes = [
    {
      href: isDemo ? '/dashboard/demo' : '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className='h-5 w-5' />,
      active: isDemo
        ? pathname === '/dashboard/demo'
        : pathname === '/dashboard',
    },
    {
      href: `${baseUrl}/transactions`,
      label: 'Transactions',
      icon: <Receipt className='h-5 w-5' />,
      active: pathname?.includes('/transactions'),
    },
    {
      href: `${baseUrl}/budget`,
      label: 'Budget',
      icon: <PieChart className='h-5 w-5' />,
      active: pathname?.includes('/budget'),
    },
    {
      href: `${baseUrl}/profile`,
      label: 'Profile',
      icon: <User className='h-5 w-5' />,
      active: pathname?.includes('/profile'),
    },
    // Only add admin route if user is admin and not in demo mode
    ...(isAdmin && !isDemo
      ? [
          {
            href: '/admin/password-requests',
            label: 'Admin Dashboard',
            icon: <Shield className='h-5 w-5' />,
            active: pathname?.includes('/admin'),
          },
        ]
      : []),
  ];

  return (
    <div className='flex min-h-screen'>
      {/* Sidebar Navigation */}
      <div className='w-64 bg-white border-r shadow-sm min-h-screen'>
        <div className='p-4 border-b'>
          <Link
            href={isDemo ? '/dashboard/demo' : '/dashboard'}
            className='flex items-center gap-2 font-semibold text-xl'
          >
            <div className='h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white'>
              <span>SW</span>
            </div>
            SpendWise
          </Link>
        </div>

        <nav className='p-4'>
          <ul className='space-y-2'>
            {navRoutes.map((route) => (
              <li key={route.href}>
                <Link
                  href={route.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                    route.active
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {route.icon}
                  <span>{route.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className='mt-auto p-4 border-t'>
          {user && <UserNav user={user} isDemo={isDemo} />}

          {isDemo ? (
            <Link
              href='/login'
              className='w-full mt-4 flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900'
            >
              <LogOut className='h-4 w-4' />
              <span>Exit Demo</span>
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
              className='w-full mt-4 flex items-center gap-2 text-gray-700 hover:text-gray-900'
            >
              <LogOut className='h-4 w-4' />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 flex flex-col'>
        <header className='bg-white border-b p-4 flex items-center justify-between'>
          <h1 className='text-xl font-semibold'>
            {pathname === '/dashboard' || pathname === '/dashboard/demo'
              ? 'Dashboard'
              : pathname?.includes('/transactions')
              ? 'Transactions'
              : pathname?.includes('/budget')
              ? 'Budget'
              : pathname?.includes('/profile')
              ? 'Profile'
              : pathname?.includes('/admin')
              ? 'Admin Dashboard'
              : 'SpendWise'}
          </h1>

          {/* Admin Panel button only for admins and not in demo mode */}
          {isAdmin && !isDemo && pathname !== '/admin/password-requests' && (
            <Link
              href='/admin/password-requests'
              className='inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-200 transition-colors'
            >
              <Shield className='h-4 w-4' />
              <span>Admin Panel</span>
            </Link>
          )}

          {/* Exit Demo button in header for demo mode */}
          {isDemo && (
            <Link
              href='/login'
              className='inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors'
            >
              <LogOut className='h-4 w-4' />
              <span>Exit Demo</span>
            </Link>
          )}
        </header>

        <main className='flex-1 p-6'>
          {isDemo && (
            <div className='bg-yellow-100 p-2 rounded-md mb-4 text-sm text-center'>
              <p>
                You are viewing a demo version.{' '}
                <Link href='/signup' className='text-primary hover:underline'>
                  Sign up
                </Link>{' '}
                to create your own account.
              </p>
            </div>
          )}
          {children}
        </main>

        <footer className='border-t py-4 text-center text-sm text-muted-foreground'>
          <p>
            &copy; {new Date().getFullYear()} SpendWise. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
