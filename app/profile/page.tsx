'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Home, CreditCard, BarChart3, User, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Define routes for navigation
  const routes = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <Home className='h-5 w-5 mr-2' />,
      active: pathname === '/dashboard',
    },
    {
      href: '/transactions',
      label: 'Transactions',
      icon: <CreditCard className='h-5 w-5 mr-2' />,
      active: pathname === '/transactions',
    },
    {
      href: '/budget',
      label: 'Budget',
      icon: <BarChart3 className='h-5 w-5 mr-2' />,
      active: pathname === '/budget',
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: <User className='h-5 w-5 mr-2' />,
      active: pathname === '/profile',
    },
  ];

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
    <div className='flex min-h-screen'>
      <aside className='w-64 border-r bg-white dark:bg-gray-950'>
        {/* Logo */}
        <div className='flex items-center gap-2 p-6'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white font-bold'>
            SW
          </div>
          <span className='text-xl font-semibold text-purple-600'>
            SpendWise
          </span>
        </div>

        {/* Navigation */}
        <nav className='mt-6 px-4'>
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium mb-1 ${
                route.active
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {route.icon}
              {route.label}
            </Link>
          ))}

          {/* Logout Button */}
          <Button
            variant='ghost'
            className='w-full mt-6 flex items-center justify-start text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            onClick={handleLogout}
          >
            <LogOut className='h-5 w-5 mr-2' />
            Logout
          </Button>
        </nav>
      </aside>

      {/* Main content */}
      <div className='flex-1 flex flex-col'>
        <main className='flex-1 p-6'>
          <div className='max-w-4xl mx-auto space-y-6'>
            <div>
              <h1 className='text-2xl font-bold'>Profile Settings</h1>
              <p className='text-muted-foreground'>
                Manage your account settings and preferences
              </p>
            </div>

            <div className='grid gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex flex-col items-center space-y-4'>
                    <Avatar className='h-24 w-24'>
                      <AvatarFallback className='bg-purple-600 text-white text-3xl'>
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='space-y-1 text-center'>
                      <h3 className='font-medium'>
                        {displayName || 'Set display name'}
                      </h3>
                      <p className='text-sm text-muted-foreground'>
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='displayName'>Display Name</Label>
                    <div className='flex space-x-2'>
                      <Input
                        id='displayName'
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder='Enter your preferred display name'
                      />
                      <Button
                        onClick={handleSaveDisplayName}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email Address</Label>
                    <Input
                      id='email'
                      value={user?.email}
                      readOnly
                      className='bg-gray-50'
                    />
                    <p className='text-xs text-muted-foreground'>
                      This is your username for logging in
                    </p>
                  </div>

                  <div className='space-y-2'>
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
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <footer className='border-t py-4 text-center text-sm text-muted-foreground'>
          <p>
            &copy; {new Date().getFullYear()} SpendWise. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
