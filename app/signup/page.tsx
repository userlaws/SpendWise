'use client';

import React, { useState, useEffect } from 'react';
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
import { registerUser } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
  });
  const [connectionStatus, setConnectionStatus] = useState(
    'Checking connection...'
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check Supabase connection status
    const checkConnection = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        setConnectionStatus('Disconnected');
      } else {
        setConnectionStatus('Connected');
      }
    };

    checkConnection();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password || !formData.username) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(''); // Reset error message

      // Use our combined registration function
      const result = await registerUser(
        formData.email,
        formData.password,
        formData.username,
        {
          full_name: formData.fullName,
          is_onboarded: false,
          preferences: { currency: 'USD', theme: 'light' },
        }
      );

      if (result.error) {
        setErrorMessage(result.error); // Set error message
        toast({
          title: 'Registration Failed',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      // Success - display toast and redirect
      toast({
        title: 'Account Created',
        description: 'Your account has been created successfully.',
      });

      // Redirect to dashboard or onboarding
      router.push('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.'); // Set error message
      toast({
        title: 'Registration Error',
        description: 'An unexpected error occurred. Please try again.',
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
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your information to create your SpendWise account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='mb-4'>
            <p>Status: {connectionStatus}</p>
            {errorMessage && (
              <div className='mt-2 p-2 border border-red-500 text-red-500 bg-red-100 rounded'>
                {errorMessage}
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='username'>Username</Label>
              <Input
                id='username'
                name='username'
                placeholder='johndoe'
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='fullName'>Full Name</Label>
              <Input
                id='fullName'
                name='fullName'
                placeholder='John Doe'
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>
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
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                name='password'
                type='password'
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Confirm Password</Label>
              <Input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className='flex flex-col items-center gap-2'>
          <div className='text-sm text-muted-foreground'>
            Already have an account?{' '}
            <Link href='/login' className='text-primary hover:underline'>
              Log in
            </Link>
          </div>
          <div className='text-xs text-muted-foreground'>
            By creating an account, you agree to our{' '}
            <Link
              href='/terms'
              className='text-muted-foreground hover:underline'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy'
              className='text-muted-foreground hover:underline'
            >
              Privacy Policy
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
