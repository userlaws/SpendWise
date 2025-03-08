'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function AdminPrompt() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Skip everything for demo users
  if (pathname?.includes('/demo')) {
    return null;
  }

  // If already on admin page, don't show prompt
  const isAlreadyOnAdminPage = pathname?.includes('/admin');

  useEffect(() => {
    // Check if we've already shown the prompt in this session
    const promptShown = sessionStorage.getItem('adminPromptShown');
    if (promptShown === 'true') {
      return;
    }

    // Only run if we're on the main dashboard page and not already on an admin page
    if (pathname !== '/dashboard' || isAlreadyOnAdminPage) {
      return;
    }

    // Check if user is admin
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Check for admin status
        const { data } = await supabase
          .from('admins')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (data) {
          setIsAdmin(true);
          setOpen(true);
          // Remember we've shown the prompt
          sessionStorage.setItem('adminPromptShown', 'true');
        }
      }
    };

    checkAdmin();
  }, [pathname, isAlreadyOnAdminPage]);

  // Don't render anything if not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl'>
            <Shield className='h-5 w-5 text-purple-600' />
            Admin Access
          </DialogTitle>
          <DialogDescription>
            You have admin privileges. Choose where you'd like to go.
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-4 py-4'>
          <p className='text-sm text-gray-500'>
            You can manage password reset requests and perform admin actions in
            the Admin Dashboard, or continue to the regular SpendWise dashboard.
          </p>
        </div>
        <DialogFooter className='flex flex-row justify-between sm:justify-between'>
          <Button
            variant='outline'
            onClick={() => {
              setOpen(false);
            }}
          >
            Stay on Dashboard
          </Button>
          <Button
            onClick={() => {
              setOpen(false);
              router.push('/admin/password-requests');
            }}
            className='bg-purple-600 hover:bg-purple-700'
          >
            <Shield className='mr-2 h-4 w-4' />
            Go to Admin Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
