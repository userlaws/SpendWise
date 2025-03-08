'use client';

import Link from 'next/link';
import { LogOut, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function UserNav({
  user,
  isDemo = false,
}: {
  user: any;
  isDemo?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('admins')
          .select('*')
          .eq('email', session.user.email)
          .single();

        setIsAdmin(!!data);
      }
    };

    checkAdmin();
  }, []);

  const handleLogout = async () => {
    if (isDemo) {
      router.push('/login');
      return;
    }

    try {
      const { error } = await logoutUser();
      if (error) throw error;
      toast({
        title: 'Logged out successfully',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        title: 'Error logging out',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  // Demo user display logic
  if (isDemo) {
    return (
      <div className='flex items-center gap-3'>
        <div className='h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600'>
          <span className='text-sm font-medium'>D</span>
        </div>
        <div className='flex flex-col'>
          <p className='text-sm font-medium'>Demo User</p>
          <p className='text-xs text-gray-500'>demo@example.com</p>
        </div>
      </div>
    );
  }

  // Regular user display logic
  return (
    <div className='flex items-center gap-3'>
      <div className='h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600'>
        <span className='text-sm font-medium'>
          {user?.first_name?.[0] || user?.email?.[0] || 'U'}
        </span>
      </div>
      <div className='flex flex-col'>
        <p className='text-sm font-medium'>
          {user?.first_name
            ? `${user.first_name} ${user.last_name || ''}`
            : user?.email?.split('@')[0] || 'User'}
        </p>
        <p className='text-xs text-gray-500'>{user?.email}</p>
      </div>
      <button
        onClick={handleLogout}
        className='ml-auto text-gray-500 hover:text-gray-700'
        aria-label='Logout'
      >
        <LogOut className='h-4 w-4' />
      </button>
    </div>
  );
}
