'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserNav } from '@/components/user-nav';
import { NavigationItem } from '@/types';
import { cn } from '@/lib/utils';
import { getCurrentSession, getUserData } from '@/lib/auth';
import { LayoutDashboard, Receipt, PieChart, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface DashboardLayoutProps {
  children: React.ReactNode;
  routes: NavigationItem[];
}

export function DashboardLayout({ children, routes }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const isDemo = pathname?.includes('/demo');

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

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p>Loading...</p>
      </div>
    );
  }

  const navRoutes = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className='h-5 w-5 mr-2' />,
      active: pathname === '/dashboard',
    },
    {
      href: '/transactions',
      label: 'Transactions',
      icon: <Receipt className='h-5 w-5 mr-2' />,
      active: pathname === '/transactions',
    },
    {
      href: '/budget',
      label: 'Budget',
      icon: <PieChart className='h-5 w-5 mr-2' />,
      active: pathname === '/budget',
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: <User className='h-5 w-5 mr-2' />,
      active: pathname === '/profile',
    },
  ];

  return (
    <div className='flex min-h-screen'>
      {/* Main content */}
      <div className='flex-1 flex flex-col'>
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
