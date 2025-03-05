'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserNav } from '@/components/user-nav';
import { NavigationItem } from '@/types';
import { cn } from '@/lib/utils';
import { getCurrentSession, getUserData } from '@/lib/auth';

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

  return (
    <div className='flex min-h-screen'>
      {/* Sidebar */}
      <aside className='w-64 border-r bg-white dark:bg-gray-950'>
        {/* Logo */}
        <div className='flex items-center gap-2 p-6'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white font-bold'>
            SW
          </div>
          <span className='text-xl font-semibold text-purple-600'>
            SpendWise
          </span>
        </div>

        {/* Navigation */}
        <nav className='mt-6 px-4'>
          {routes.map((route) => {
            const href = isDemo
              ? `/demo${route.href.replace('/dashboard', '')}`
              : route.href;
            const isActive = pathname === href;

            return (
              <Link
                key={route.href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50'
                )}
              >
                {route.icon && (
                  <route.icon
                    className={cn(
                      'h-5 w-5',
                      isActive ? 'text-purple-600' : 'text-gray-500'
                    )}
                  />
                )}
                {route.name}
              </Link>
            );
          })}
        </nav>

        {/* User section at bottom of sidebar */}
        <div className='mt-auto p-4 border-t absolute bottom-0 w-full'>
          <UserNav isDemo={isDemo} user={user} />
        </div>
      </aside>

      {/* Main content */}
      <div className='flex-1 flex flex-col'>
        <header className='sticky top-0 z-50 flex h-16 items-center border-b bg-white dark:bg-gray-950 px-6'>
          <h1 className='text-xl font-semibold'>
            {routes.find((route) => pathname === route.href)?.name ||
              'Dashboard'}
          </h1>
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
