'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export default function ManualResetPage() {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First find the user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      // Create a password reset request with approved status
      const response = await fetch('/api/admin/approve-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'manual-' + Date.now(), // Generate a unique ID
          userId: user.id,
          newPassword: newPassword,
          isManual: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reset password');
      }

      toast({
        title: 'Success',
        description: 'Password has been reset successfully',
      });

      // Clear the form
      setUsername('');
      setNewPassword('');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='max-w-2xl mx-auto p-4 space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Manual Password Reset</CardTitle>
          <CardDescription>
            Use this form to manually reset a user's password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className='mb-6'>
            <InfoIcon className='h-4 w-4' />
            <AlertDescription>
              This will immediately reset the user's password. Use with caution.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium mb-1'
              >
                Username
              </label>
              <Input
                id='username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder='Enter username'
                required
              />
            </div>

            <div>
              <label
                htmlFor='newPassword'
                className='block text-sm font-medium mb-1'
              >
                New Password
              </label>
              <Input
                id='newPassword'
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder='Enter new password'
                required
              />
            </div>

            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
