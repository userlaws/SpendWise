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

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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
    if (!formData.email || !formData.password) {
      toast({
        title: 'Validation Error',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Use our login function
      const result = await loginUser(formData.email, formData.password);

      if (result.error) {
        toast({
          title: 'Login Failed',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      // Success - display toast and redirect
      toast({
        title: 'Login Successful',
        description: 'Welcome back to SpendWise!',
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Error',
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
                  href='/forget-password'
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
