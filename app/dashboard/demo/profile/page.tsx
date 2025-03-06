'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { mockUser } from '@/lib/data';
import { useToast } from '@/components/ui/use-toast';
import { LogOut } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState(mockUser);
  const [displayName, setDisplayName] = useState(mockUser.name);
  const { toast } = useToast();
  const router = useRouter();

  const handleSaveDisplayName = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Profile Updated',
      description: 'Your display name has been updated successfully.',
    });
  };

  const handleLogout = () => {
    toast({
      title: 'Demo Mode',
      description:
        'In a real account, this would log you out. Redirecting to login page...',
    });

    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 flex flex-col items-center justify-center p-6 space-y-8'>
        {/* Profile Picture */}
        <Avatar className='h-32 w-32'>
          <AvatarFallback className='bg-purple-600 text-white text-4xl'>
            D
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
              <Button onClick={handleSaveDisplayName}>Save</Button>
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
                value='demo@example.com'
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
                value='January 1, 2023'
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
