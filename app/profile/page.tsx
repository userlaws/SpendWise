'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw sessionError || new Error('No session found');
        }

        // Fetch user profile data including display name if it exists
        const { data: profileData, error: profileError } = await supabase
          .from('user_preferences')
          .select('display_name')
          .eq('user_id', session.user.id)
          .single();

        if (profileData && profileData.display_name) {
          setDisplayName(profileData.display_name);
        }

        setUser(session.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error loading profile',
          description:
            'Failed to load your profile data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [toast]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: 'Logged out successfully',
      });

      router.push('/login');
    } catch (error: any) {
      toast({
        title: 'Error logging out',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleSaveDisplayName = async () => {
    if (!user) return;

    try {
      setIsSaving(true);

      const { error } = await supabase.from('user_preferences').upsert({
        user_id: user.id,
        display_name: displayName,
      });

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your display name has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating profile',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>Loading...</div>
    );
  }

  return (
    <div className='flex-1 flex flex-col p-6'>
      <div className='flex flex-col items-center justify-center space-y-8'>
        {/* Profile Picture */}
        <Avatar className='h-32 w-32'>
          <AvatarFallback className='bg-purple-600 text-white text-4xl'>
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        {/* Display Name Input */}
        <div className='w-full max-w-md space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='displayName'>Display Name</Label>
            <div className='flex space-x-2'>
              <Input
                id='displayName'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder='Enter your preferred display name'
              />
              <Button onClick={handleSaveDisplayName} disabled={isSaving}>
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant='outline'
          className='border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-700 w-40'
          onClick={handleLogout}
        >
          <LogOut className='h-4 w-4 mr-2' />
          Logout
        </Button>
      </div>

      {/* User Account Info at Bottom */}
      <div className='p-6 border-t'>
        <div className='max-w-md mx-auto'>
          <h3 className='text-lg font-medium mb-4'>Account Information</h3>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='email'>Email Address</Label>
              <Input
                id='email'
                value={user?.email}
                readOnly
                className='bg-gray-50'
              />
              <p className='text-xs text-muted-foreground mt-1'>
                This is your username for logging in
              </p>
            </div>

            <div>
              <Label htmlFor='created'>Account Created</Label>
              <Input
                id='created'
                value={
                  user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : 'N/A'
                }
                readOnly
                className='bg-gray-50'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
