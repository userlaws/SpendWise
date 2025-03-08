'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client
import Image from 'next/image'; // Import Image component for logo

// Create a client component that uses useSearchParams
function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
  });
  const [error, setError] = useState('');
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  // Check if there's an email in the query params (for password reset flow)
  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      setFormData((prev) => ({ ...prev, email }));
      setIsPasswordReset(true);
    }
  }, [searchParams]);

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
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data && data.user) {
        // Create user record in users table
        const { error: profileError } = await supabase.from('users').insert([
          {
            id: data.user.id,
            username: formData.username,
            email: formData.email,
            full_name: formData.fullName,
          },
        ]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          setError('Failed to create user profile');
          return;
        }

        // Show success message
        toast({
          title: isPasswordReset ? 'Account Recreated' : 'Account Created',
          description: isPasswordReset
            ? 'Your account has been recreated with your new password. You can now log in.'
            : 'Your account has been created. Please check your email to confirm your account.',
        });

        // Redirect to login page
        router.push('/login');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center p-4 bg-gray-50'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <div className='flex items-center space-x-2'>
            <Image
              src='/logo.png'
              alt='SpendWise Logo'
              width={40}
              height={40}
            />
            <CardTitle className='text-2xl font-bold'>
              {isPasswordReset ? 'Recreate Account' : 'Create an Account'}
            </CardTitle>
          </div>
          <CardDescription>
            {isPasswordReset
              ? 'Your password reset was approved. Please recreate your account with your new password.'
              : 'Enter your details to create your account'}
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
                readOnly={isPasswordReset}
              />
            </div>
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
            {error && <p className='text-sm text-red-500'>{error}</p>}
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading
                ? 'Creating Account...'
                : isPasswordReset
                ? 'Recreate Account'
                : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <div className='text-sm text-muted-foreground'>
            Already have an account?{' '}
            <Link href='/login' className='text-primary hover:underline'>
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Main page component with Suspense boundary
export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          Loading...
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
