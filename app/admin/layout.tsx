'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get current user's session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // Not logged in, redirect to login
          router.push('/login');
          return;
        }

        // Check if the user's email is in the admins table
        const { data: adminData, error } = await supabase
          .from('admins')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (error || !adminData) {
          // Not an admin, redirect to dashboard
          router.push('/dashboard');
          return;
        }

        // User is an admin
        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [router]);

  if (isLoading) {
    return <div>Checking permissions...</div>;
  }

  if (!isAdmin) {
    return null; // This shouldn't render as the router redirects non-admins
  }

  return (
    <div className='admin-layout'>
      <div className='admin-header'>
        <h1>Admin Dashboard</h1>
      </div>
      <div className='admin-content'>{children}</div>
    </div>
  );
}
