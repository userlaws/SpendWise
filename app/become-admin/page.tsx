'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function BecomeAdminPage() {
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkUserAndAdminStatus();
  }, []);

  const checkUserAndAdminStatus = async () => {
    try {
      // Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: 'Not authenticated',
          description: 'You must be logged in to become an admin',
          variant: 'destructive',
        });
        return;
      }

      setUserId(session.user.id);
      setUserEmail(session.user.email);

      // Check if user is already an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!adminError && adminData) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const handleBecomeAdmin = async () => {
    try {
      setIsLoading(true);

      // First check if admins table exists
      const { error: tableCheckError } = await supabase
        .from('admins')
        .select('count')
        .limit(1);

      // If table doesn't exist, create it
      if (
        tableCheckError &&
        tableCheckError.message.includes('does not exist')
      ) {
        // Create admins table via a SQL query
        const { error: createTableError } = await supabase.rpc(
          'create_admins_table'
        );

        if (createTableError) {
          console.log('Error creating table, trying alternative method');
          // Alternative method if RPC doesn't exist
          await fetch('/api/admin/create-admin-table', { method: 'POST' });
        }
      }

      // Insert current user as admin
      const { data, error } = await supabase
        .from('admins')
        .insert([{ user_id: userId, email: userEmail }]);

      if (error) {
        if (error.code === '23505') {
          // Unique violation
          toast({
            title: 'Already an admin',
            description: 'Your account is already registered as an admin',
          });
          setIsAdmin(true);
          return;
        }
        throw error;
      }

      toast({
        title: 'Success!',
        description: 'You are now an admin',
      });

      setIsAdmin(true);
    } catch (error) {
      console.error('Error becoming admin:', error);
      toast({
        title: 'Error',
        description:
          'Failed to set admin permissions. Check the console for details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>
            Set up admin access for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!userId ? (
            <p className='text-center text-muted-foreground'>
              You must be logged in to become an admin
            </p>
          ) : isAdmin ? (
            <div className='text-center space-y-4'>
              <p className='text-green-500 font-medium'>
                You already have admin access
              </p>
              <div className='bg-muted p-4 rounded-md'>
                <p className='font-mono text-xs break-all'>User ID: {userId}</p>
                <p className='font-mono text-xs break-all'>
                  Email: {userEmail}
                </p>
              </div>
            </div>
          ) : (
            <div className='text-center space-y-4'>
              <p>
                Click the button below to grant admin access to your account
              </p>
              <div className='bg-muted p-4 rounded-md'>
                <p className='font-mono text-xs break-all'>User ID: {userId}</p>
                <p className='font-mono text-xs break-all'>
                  Email: {userEmail}
                </p>
              </div>
              <Button
                onClick={handleBecomeAdmin}
                disabled={isLoading}
                className='w-full'
              >
                {isLoading ? 'Processing...' : 'Become Admin'}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Button variant='outline' asChild>
            <Link href='/admin/password-requests'>
              Go to Password Reset Requests
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
