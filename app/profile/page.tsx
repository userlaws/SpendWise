'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/lib/avatar-utils';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

interface UserPreferences {
  preferred_currency: string;
  notifications_enabled: boolean;
  budget_alerts: boolean;
  weekly_summary: boolean;
  theme: string;
}

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferred_currency: 'USD',
    notifications_enabled: true,
    budget_alerts: true,
    weekly_summary: true,
    theme: 'system',
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: '',
    username: '',
  });

  const { toast } = useToast();

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);

        // Get user session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          console.error('No active session found');
          window.location.href = '/login';
          return;
        }

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData) {
          setProfile({
            user_id: profileData.user_id,
            username: profileData.username,
            email: session.user.email || '',
            full_name: profileData.full_name || '',
            avatar_url: profileData.avatar_url,
          });

          setEditedProfile({
            full_name: profileData.full_name || '',
            username: profileData.username,
          });
        }

        // Fetch user preferences
        const { data: prefsData, error: prefsError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (!prefsError && prefsData) {
          setPreferences({
            preferred_currency: prefsData.preferred_currency || 'USD',
            notifications_enabled: prefsData.notifications_enabled ?? true,
            budget_alerts: prefsData.budget_alerts ?? true,
            weekly_summary: prefsData.weekly_summary ?? true,
            theme: prefsData.theme || 'system',
          });
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
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

    fetchProfileData();
  }, [toast]);

  // Update profile information
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) return;

    try {
      setIsUpdating(true);

      const { error } = await supabase
        .from('users')
        .update({
          full_name: editedProfile.full_name,
          username: editedProfile.username,
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      // Update local state
      setProfile({
        ...profile,
        full_name: editedProfile.full_name,
        username: editedProfile.username,
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error updating profile',
        description: 'Failed to update your profile. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Update user preferences
  const handleUpdatePreferences = async (
    key: keyof UserPreferences,
    value: any
  ) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: 'Not authenticated',
          description: 'Please log in to update your preferences',
          variant: 'destructive',
        });
        return;
      }

      // Update local state first for a responsive UI
      setPreferences({
        ...preferences,
        [key]: value,
      });

      // Try to update existing record
      const { error } = await supabase.from('user_preferences').upsert({
        user_id: session.user.id,
        [key]: value,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error updating preferences',
        description:
          'Failed to update your preferences. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Get avatar URL with fallback
  const avatarUrl = profile?.avatar_url
    ? profile.avatar_url
    : getAvatarUrl('', profile?.full_name || profile?.username || '');

  return (
    <div className='flex flex-col p-4 md:p-8 gap-6'>
      <div>
        <h1 className='text-2xl md:text-3xl font-bold'>Profile</h1>
        <p className='text-muted-foreground'>
          Manage your account settings and preferences
        </p>
      </div>

      {isLoading ? (
        <div className='text-center py-8'>
          <p>Loading your profile data...</p>
        </div>
      ) : !profile ? (
        <div className='text-center py-8'>
          <p>Unable to load profile data. Please try again later.</p>
          <Button
            onClick={() => window.location.reload()}
            variant='outline'
            className='mt-2'
          >
            Reload
          </Button>
        </div>
      ) : (
        <div className='grid gap-6'>
          <Card>
            <CardHeader className='flex flex-row items-center gap-4'>
              <Avatar className='h-16 w-16'>
                <AvatarImage
                  src={avatarUrl}
                  alt={profile.full_name || profile.username}
                />
                <AvatarFallback>
                  {(profile.full_name || profile.username)
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{profile.full_name || profile.username}</CardTitle>
                <CardDescription>{profile.email}</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue='general'>
            <TabsList className='grid w-full grid-cols-2 md:w-auto md:inline-flex'>
              <TabsTrigger value='general'>General</TabsTrigger>
              <TabsTrigger value='preferences'>Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value='general' className='mt-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='full-name'>Full Name</Label>
                      <Input
                        id='full-name'
                        value={editedProfile.full_name}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            full_name: e.target.value,
                          })
                        }
                        placeholder='Your full name'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='username'>Username</Label>
                      <Input
                        id='username'
                        value={editedProfile.username}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            username: e.target.value,
                          })
                        }
                        placeholder='Your username'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='email'>Email</Label>
                      <Input
                        id='email'
                        value={profile.email}
                        disabled
                        readOnly
                        placeholder='Your email'
                      />
                      <p className='text-xs text-muted-foreground'>
                        Email cannot be changed directly. Contact support for
                        help.
                      </p>
                    </div>
                    <Button type='submit' disabled={isUpdating}>
                      {isUpdating ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='preferences' className='mt-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Customize your application settings
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div>
                    <h3 className='text-lg font-medium mb-4'>
                      General Settings
                    </h3>
                    <div className='space-y-4'>
                      <div className='grid gap-2'>
                        <Label htmlFor='currency'>Preferred Currency</Label>
                        <select
                          id='currency'
                          value={preferences.preferred_currency}
                          onChange={(e) =>
                            handleUpdatePreferences(
                              'preferred_currency',
                              e.target.value
                            )
                          }
                          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                        >
                          <option value='USD'>US Dollar (USD)</option>
                          <option value='EUR'>Euro (EUR)</option>
                          <option value='GBP'>British Pound (GBP)</option>
                          <option value='CAD'>Canadian Dollar (CAD)</option>
                          <option value='AUD'>Australian Dollar (AUD)</option>
                          <option value='JPY'>Japanese Yen (JPY)</option>
                        </select>
                      </div>

                      <div className='grid gap-2'>
                        <Label htmlFor='theme'>Theme</Label>
                        <select
                          id='theme'
                          value={preferences.theme}
                          onChange={(e) =>
                            handleUpdatePreferences('theme', e.target.value)
                          }
                          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                        >
                          <option value='system'>System Default</option>
                          <option value='light'>Light</option>
                          <option value='dark'>Dark</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className='text-lg font-medium mb-4'>Notifications</h3>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div className='space-y-0.5'>
                          <Label htmlFor='notifications'>
                            Email Notifications
                          </Label>
                          <p className='text-sm text-muted-foreground'>
                            Receive email notifications about your account
                          </p>
                        </div>
                        <Switch
                          id='notifications'
                          checked={preferences.notifications_enabled}
                          onCheckedChange={(checked) =>
                            handleUpdatePreferences(
                              'notifications_enabled',
                              checked
                            )
                          }
                        />
                      </div>

                      <div className='flex items-center justify-between'>
                        <div className='space-y-0.5'>
                          <Label htmlFor='budget-alerts'>Budget Alerts</Label>
                          <p className='text-sm text-muted-foreground'>
                            Get notified when you're close to exceeding your
                            budget
                          </p>
                        </div>
                        <Switch
                          id='budget-alerts'
                          checked={preferences.budget_alerts}
                          onCheckedChange={(checked) =>
                            handleUpdatePreferences('budget_alerts', checked)
                          }
                          disabled={!preferences.notifications_enabled}
                        />
                      </div>

                      <div className='flex items-center justify-between'>
                        <div className='space-y-0.5'>
                          <Label htmlFor='weekly-summary'>Weekly Summary</Label>
                          <p className='text-sm text-muted-foreground'>
                            Receive a weekly summary of your spending
                          </p>
                        </div>
                        <Switch
                          id='weekly-summary'
                          checked={preferences.weekly_summary}
                          onCheckedChange={(checked) =>
                            handleUpdatePreferences('weekly_summary', checked)
                          }
                          disabled={!preferences.notifications_enabled}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className='text-lg font-medium mb-4'>
                      Account Actions
                    </h3>
                    <div className='space-y-4'>
                      <Button variant='outline'>Change Password</Button>
                      <Button variant='destructive'>Delete Account</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
