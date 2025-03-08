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
import { resetPassword } from '@/lib/password-reset';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

// Define the type for password reset requests
interface PasswordResetRequest {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  email: string;
  new_password: string;
  status: string;
  created_at: string;
}

export default function AdminPasswordRequestsPage() {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);

      // First check if the user is authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: 'Not authenticated',
          description: 'You must be logged in to access this page',
          variant: 'destructive',
        });
        return;
      }

      // TEMPORARY SOLUTION: Skip admin check for testing
      // Get password reset requests regardless of admin status
      console.log('Current user ID:', session.user.id);

      /*
      // Original admin check - commented out for testing
      // Get current user's role
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (userRoleError || !userRoleData) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access this page',
          variant: 'destructive',
        });
        return;
      }
      */

      // Fetch pending password reset requests
      const { data, error } = await supabase
        .from('password_reset_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching password reset requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load password reset requests',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request: PasswordResetRequest) => {
    try {
      setProcessingId(request.id);

      // First, mark the request as approved
      const { error: approveError } = await supabase
        .from('password_reset_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

      if (approveError) {
        throw new Error(`Failed to approve request: ${approveError.message}`);
      }

      // Then send a password reset email directly to the user
      const resetResponse = await fetch('/api/admin/reset-by-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: request.email,
        }),
      });

      const resetResult = await resetResponse.json();

      if (!resetResponse.ok || !resetResult.success) {
        throw new Error(resetResult.error || 'Failed to send reset email');
      }

      toast({
        title: 'Password Reset Approved',
        description:
          "The password reset request has been approved and a reset link has been sent to the user's email.",
      });

      // Refresh the list to remove the approved request
      fetchRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve request',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeny = async (requestId: string) => {
    try {
      setProcessingId(requestId);

      const { error } = await supabase
        .from('password_reset_requests')
        .update({ status: 'denied' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Password Reset Denied',
        description: 'The password reset request has been denied',
      });

      // Refresh the list of requests
      fetchRequests();
    } catch (error) {
      console.error('Error denying password reset:', error);
      toast({
        title: 'Error',
        description: 'Failed to deny password reset request',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatRequestTime = (timestamp: string) => {
    try {
      // Create a date object from the timestamp
      const date = new Date(timestamp);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      // Format the date and time
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };

      return date.toLocaleString(undefined, options);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return timestamp || 'Unknown';
    }
  };

  const setupPasswordResetFunction = async () => {
    try {
      setIsSettingUp(true);

      const response = await fetch('/api/admin/create-reset-function', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Failed to set up password reset function'
        );
      }

      toast({
        title: 'Setup Complete',
        description: 'Password reset function has been set up in the database',
      });
    } catch (error: any) {
      console.error('Setup error:', error);
      toast({
        title: 'Setup Error',
        description:
          error.message || 'Failed to set up password reset function',
        variant: 'destructive',
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Password Reset Requests</h1>
        <Button variant='outline' asChild>
          <Link href='/admin/manual-reset'>Manual Password Reset</Link>
        </Button>
      </div>

      {/* Alert explaining the process */}
      <Alert>
        <InfoIcon className='h-4 w-4' />
        <AlertTitle>Important Information</AlertTitle>
        <AlertDescription>
          Due to security limitations, we're using a two-step process for
          password resets. When you approve a request, it will be marked as
          approved in the database. The user will then be able to log in with
          their new password.
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <div className='flex justify-center py-8'>
          <p>Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className='flex items-center justify-center py-10'>
            <p className='text-muted-foreground'>
              No pending password reset requests
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-6'>
          {requests.map((request) => (
            <Card key={request.id} className='overflow-hidden'>
              <CardHeader className='bg-muted pb-4'>
                <CardTitle className='text-lg'>Reset Request</CardTitle>
                <p className='text-xs text-muted-foreground'>
                  Submitted on {formatRequestTime(request.created_at)}
                </p>
              </CardHeader>
              <CardContent className='pt-6'>
                <div className='space-y-2'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm font-medium'>Username:</p>
                      <p className='text-muted-foreground'>
                        {request.username}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Full Name:</p>
                      <p className='text-muted-foreground'>
                        {request.full_name}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Email:</p>
                      <p className='text-muted-foreground'>{request.email}</p>
                    </div>
                    <div>
                      <p className='text-sm font-medium'>User ID:</p>
                      <p className='text-muted-foreground'>
                        {request.user_id || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className='flex justify-end gap-2 mt-6'>
                    <Button
                      variant='outline'
                      onClick={() => handleDeny(request.id)}
                      disabled={processingId === request.id}
                    >
                      Deny
                    </Button>
                    <Button
                      onClick={() => handleApprove(request)}
                      disabled={processingId === request.id}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
