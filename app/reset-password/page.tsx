'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

// Client component that uses searchParams
function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  // Import useSearchParams inside the client component
  const { useSearchParams } = require('next/navigation');
  const searchParams = useSearchParams();

  // Check if we have the necessary token when the page loads
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      // If no active session after loading the reset page with proper URL params,
      // this likely means the token is invalid or expired
      if (
        !data.session &&
        !searchParams.has('type') &&
        !searchParams.has('access_token')
      ) {
        toast({
          title: 'Invalid or expired reset link',
          description: 'Please request a new password reset link.',
          variant: 'destructive',
        });
        router.push('/forget-password');
      }
    };

    checkSession();
  }, [router, searchParams, toast]);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setPasswordError('');

    // Validate password
    const error = validatePassword(password);
    if (error) {
      setPasswordError(error);
      setIsLoading(false);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Update the user's password
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully updated.',
      });

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Error',
        description:
          (error as Error).message ||
          'Failed to update password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center p-4 bg-gray-50'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold'>
            Reset Your Password
          </CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='password'>New Password</Label>
              <Input
                id='password'
                name='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {passwordError && (
                <p className='text-sm text-red-500'>{passwordError}</p>
              )}
              <p className='text-xs text-muted-foreground'>
                Password must be at least 8 characters long
              </p>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Confirm Password</Label>
              <Input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Updating Password...' : 'Reset Password'}
            </Button>
            <div className='text-center mt-4'>
              <Link
                href='/login'
                className='text-sm text-primary hover:underline'
              >
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Main component that wraps the client component in Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
