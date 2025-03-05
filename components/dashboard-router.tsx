'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardRouter() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow access to all demo routes without redirection
    if (pathname?.includes('/dashboard/demo')) {
      setIsLoading(false);
      return;
    }

    // Check if we're already on a specific dashboard page
    if (
      pathname?.includes('/dashboard/') &&
      !pathname?.includes('/dashboard/demo')
    ) {
      setIsLoading(false);
      return;
    }

    const checkUserStatus = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // Not logged in, redirect to login
          router.push('/login');
          return;
        }

        // Check if user has completed setup
        const { data: userData, error } = await supabase
          .from('users')
          .select('has_completed_setup')
          .eq('user_id', session.user.id)
          .single();

        if (error) throw error;

        if (userData && userData.has_completed_setup) {
          // User has completed setup, show regular dashboard
          router.push('/dashboard');
        } else {
          // New user, show new user dashboard
          router.push('/new-user-dashboard');
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        // Default to regular dashboard on error
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, [router, pathname]);

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-center'>
        <h2 className='text-xl font-semibold mb-2'>Loading...</h2>
        <p className='text-muted-foreground'>
          Just a moment while we prepare your dashboard.
        </p>
      </div>
    </div>
  );
}
