'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { loginUser } from '@/lib/auth';
import Image from 'next/image'; // Import Image component for logo
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Try the standard login first
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      // If login succeeded, redirect based on user role
      if (!error && data?.user) {
        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (adminData) {
          router.push('/admin');
          return;
        } else {
          router.push('/dashboard');
          return;
        }
      }

      // If login failed, check if this matches an approved reset request
      const resetCheckResponse = await fetch('/api/admin/check-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const resetData = await resetCheckResponse.json();

      // If the password matches a reset request
      if (resetData.match) {
        // Use Supabase's built-in password reset
        const resetResponse = await fetch('/api/admin/reset-by-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
          }),
        });

        const resetResult = await resetResponse.json();

        if (resetResult.success) {
          toast({
            title: 'Password Reset Link Sent',
            description:
              'A password reset link has been sent to your email. Please check your inbox to complete the process.',
          });
        } else {
          setError(
            'Could not send password reset email. Please contact support.'
          );
        }
        return;
      }

      // No reset match found, display standard error
      setError(error?.message || 'Invalid email or password');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center p-4 bg-gray-50'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <Link href='/' className='flex items-center space-x-2'>
            <Image
              src='/logo.png'
              alt='SpendWise Logo'
              width={40}
              height={40}
            />{' '}
            {/* Logo */}
            <CardTitle className='text-2xl font-bold'>SpendWise</CardTitle>{' '}
            {/* SpendWise Name */}
          </Link>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
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
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='password'>Password</Label>
                <Link
                  href='/password-reset-request'
                  className='text-sm text-primary hover:underline'
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id='password'
                name='password'
                type='password'
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>
          <div className='mt-4 text-center'>
            <Link
              href='/password-reset-request'
              className='text-sm text-primary hover:underline'
            >
              Forgot password?
            </Link>
          </div>
        </CardContent>
        <CardFooter className='flex flex-col items-center'>
          <div className='text-sm text-muted-foreground'>
            Don't have an account?{' '}
            <Link href='/signup' className='text-primary hover:underline'>
              Sign up
            </Link>
          </div>
          <div className='mt-4'>
            <Link
              href='/dashboard/demo'
              className='text-sm text-muted-foreground hover:underline'
            >
              Try the demo
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
