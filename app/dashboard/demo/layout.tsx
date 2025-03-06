'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, CreditCard, BarChart3, User } from 'lucide-react';

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Define demo routes for navigation
  const demoRoutes = [
    {
      href: '/dashboard/demo/dashboard',
      label: 'Dashboard',
      icon: <Home className='h-5 w-5 mr-2' />,
      active: pathname === '/dashboard/demo/dashboard',
    },
    {
      href: '/dashboard/demo/transactions',
      label: 'Transactions',
      icon: <CreditCard className='h-5 w-5 mr-2' />,
      active: pathname === '/dashboard/demo/transactions',
    },
    {
      href: '/dashboard/demo/budget',
      label: 'Budget',
      icon: <BarChart3 className='h-5 w-5 mr-2' />,
      active: pathname === '/dashboard/demo/budget',
    },
    {
      href: '/dashboard/demo/profile',
      label: 'Profile',
      icon: <User className='h-5 w-5 mr-2' />,
      active: pathname === '/dashboard/demo/profile',
    },
  ];

  return (
    <>
      <div className='bg-yellow-500 text-black py-1 px-4 text-center text-sm font-medium'>
        Demo Mode - Sample data only. No account required.
      </div>
      <div className='flex min-h-screen'>
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
            {demoRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                  route.active
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {route.icon}
                {route.label}
              </Link>
            ))}
            {/* Exit Demo Button */}
            <Link
              href='/'
              className='mt-4 flex items-center gap-3 rounded-md bg-purple-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-900'
            >
              Exit Demo
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <div className='flex-1 p-6'>{children}</div>
      </div>
    </>
  );
}
