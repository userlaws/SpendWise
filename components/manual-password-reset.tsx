import React, { useState } from 'react';
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
import { supabase } from '@/lib/supabaseClient';

export function ManualPasswordReset() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please ensure both passwords match.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // First find the user by email or username
      let userData;

      if (email) {
        const { data, error } = await supabase
          .from('users')
          .select('id, user_id, email, username')
          .eq('email', email)
          .single();

        if (error) throw error;
        userData = data;
      } else if (username) {
        const { data, error } = await supabase
          .from('users')
          .select('id, user_id, email, username')
          .eq('username', username)
          .single();

        if (error) throw error;
        userData = data;
      } else {
        throw new Error('Either email or username is required');
      }

      if (!userData) {
        throw new Error('User not found');
      }

      // Create a password reset request with approved status
      const { error: resetError } = await supabase
        .from('password_reset_requests')
        .insert({
          user_id: userData.id,
          username: userData.username,
          email: userData.email,
          full_name: 'Manual Reset',
          new_password: password,
          status: 'approved',
        });

      if (resetError) throw resetError;

      toast({
        title: 'Password Reset Created',
        description: `Password reset has been approved for ${
          userData.username || userData.email
        }. The user can now use this password when logging in.`,
      });

      // Clear the form
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error creating manual password reset:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create password reset',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Manual Password Reset</CardTitle>
        <CardDescription>
          Create an approved password reset for a user
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='username'>Username</Label>
            <Input
              id='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder='Enter username'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter email address'
            />
            <p className='text-xs text-muted-foreground'>
              Provide either username or email to identify the user
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>New Password</Label>
            <Input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder='Enter new password'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm Password</Label>
            <Input
              id='confirmPassword'
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder='Confirm new password'
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Create Password Reset'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
