'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'; // Using relative path
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use Supabase's built-in reset password functionality
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      // Even if the email doesn't exist, Supabase will return success for security reasons
      setIsEmailSent(true);
      toast({
        title: 'Reset Email Sent',
        description: 'Check your email for a password reset link.',
      });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      // We don't want to expose if an email exists or not
      // So we show the same success message
      setIsEmailSent(true);
      toast({
        title: 'Reset Email Sent',
        description:
          'If an account with this email exists, you will receive a password reset link.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className='flex min-h-screen items-center justify-center p-4 bg-gray-50'>
        <Card className='w-full max-w-md'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl font-bold'>
              Check Your Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='mb-4'>
              We've sent a password reset link to <strong>{email}</strong>.
            </p>
            <p className='mb-4'>
              Please check your email and follow the instructions to reset your
              password.
            </p>
            <div className='flex justify-center mt-6'>
              <Button variant='outline' asChild>
                <Link href='/login'>Return to Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center p-4 bg-gray-50'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold'>Forgot Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='john.doe@example.com'
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
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
