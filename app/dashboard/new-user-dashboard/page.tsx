'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertCircle,
  ArrowRight,
  Plus,
  DollarSign,
  Settings,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculatePercentage, formatCurrency } from '@/lib/utils';

// Interface for user settings/preferences
interface UserPreferences {
  hasCompletedSetup: boolean;
  preferredCurrency: string;
  notificationsEnabled: boolean;
}

// Empty categories to initialize new users
const emptyCategories = [
  { id: 'groceries', name: 'Groceries', budget: 0, spent: 0 },
  { id: 'dining', name: 'Dining', budget: 0, spent: 0 },
  { id: 'transportation', name: 'Transportation', budget: 0, spent: 0 },
  { id: 'utilities', name: 'Utilities', budget: 0, spent: 0 },
  { id: 'entertainment', name: 'Entertainment', budget: 0, spent: 0 },
  { id: 'health', name: 'Health & Medical', budget: 0, spent: 0 },
  { id: 'shopping', name: 'Shopping', budget: 0, spent: 0 },
  { id: 'other', name: 'Other', budget: 0, spent: 0 },
];

export default function NewUserDashboardPage() {
  const [username, setUsername] = useState<string>('');
  const [categories, setCategories] = useState(emptyCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [setupStage, setSetupStage] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>({
    hasCompletedSetup: false,
    preferredCurrency: 'USD',
    notificationsEnabled: true,
  });
  const { toast } = useToast();

  // Fetch user information on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // If no session, redirect to login
          window.location.href = '/login';
          return;
        }

        // Get user profile data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (userError) throw userError;

        if (userData) {
          setUsername(userData.username);

          // Check if user has any transactions (to determine if they should move to regular dashboard)
          const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('order_id')
            .eq('user_id', session.user.id)
            .limit(1);

          if (ordersError) throw ordersError;

          // If user has transactions and has completed setup, redirect to regular dashboard
          if (orders && orders.length > 0 && userData.has_completed_setup) {
            window.location.href = '/dashboard';
            return;
          }

          // Get user preferences if they exist
          const { data: prefsData, error: prefsError } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (!prefsError && prefsData) {
            setPreferences({
              hasCompletedSetup: prefsData.has_completed_setup || false,
              preferredCurrency: prefsData.preferred_currency || 'USD',
              notificationsEnabled: prefsData.notifications_enabled || true,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your profile data',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

  // Function to handle setting up a budget category
  const handleSetBudget = (categoryId: string, amount: number) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, budget: amount } : cat
      )
    );
  };

  // Function to save budget categories
  const handleSaveCategories = async () => {
    try {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // Save categories to database
      for (const category of categories) {
        if (category.budget > 0) {
          const { error } = await supabase.from('budget_categories').upsert({
            user_id: session.user.id,
            category_id: category.id,
            category_name: category.name,
            budget_amount: category.budget,
            spent_amount: 0, // Initialize with zero spent
          });

          if (error) throw error;
        }
      }

      // Move to next setup stage
      setSetupStage(setupStage + 1);

      toast({
        title: 'Budget saved',
        description: 'Your budget categories have been saved',
      });
    } catch (error) {
      console.error('Error saving categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your budget categories',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to complete setup
  const handleCompleteSetup = async () => {
    try {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // Update user preferences to mark setup as complete
      const { error } = await supabase.from('user_preferences').upsert({
        user_id: session.user.id,
        has_completed_setup: true,
        preferred_currency: preferences.preferredCurrency,
        notifications_enabled: preferences.notificationsEnabled,
      });

      if (error) throw error;

      // Also update the main users table
      await supabase
        .from('users')
        .update({ has_completed_setup: true })
        .eq('user_id', session.user.id);

      toast({
        title: 'Setup complete',
        description: "You're all set! Redirecting to your dashboard.",
      });

      // Short delay then redirect to main dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (error) {
      console.error('Error completing setup:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete setup',
      });
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold mb-2'>
            Loading your dashboard...
          </h2>
          <p className='text-muted-foreground'>
            Just a moment while we prepare your personal finance hub.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col p-4 md:p-8 gap-6'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-3xl font-bold'>
          Welcome to SpendWise, {username}!
        </h1>
        <p className='text-muted-foreground'>
          Let's set up your personal finance dashboard.
        </p>
      </div>

      <Tabs
        defaultValue={`stage-${setupStage}`}
        value={`stage-${setupStage}`}
        className='w-full'
      >
        <TabsList className='grid grid-cols-3 mb-6'>
          <TabsTrigger value='stage-0' disabled={setupStage !== 0}>
            1. Budget Setup
          </TabsTrigger>
          <TabsTrigger value='stage-1' disabled={setupStage !== 1}>
            2. Financial Goals
          </TabsTrigger>
          <TabsTrigger value='stage-2' disabled={setupStage !== 2}>
            3. Final Steps
          </TabsTrigger>
        </TabsList>

        {/* Budget Setup Stage */}
        <TabsContent value='stage-0'>
          <div className='grid gap-6'>
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Getting Started</AlertTitle>
              <AlertDescription>
                Let's start by setting up your budget categories. You can always
                modify these later.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Budget Categories</CardTitle>
                <CardDescription>
                  Set monthly budgets for each spending category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className='flex items-center justify-between'
                    >
                      <div>
                        <h3 className='font-medium'>{category.name}</h3>
                        <p className='text-sm text-muted-foreground'>
                          Budget: {formatCurrency(category.budget)}
                        </p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <input
                          type='number'
                          min='0'
                          value={category.budget}
                          onChange={(e) =>
                            handleSetBudget(
                              category.id,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className='w-24 rounded-md border border-input px-3 py-2 text-sm'
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={handleSaveCategories} className='mt-6 w-full'>
                  Save Budget & Continue
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Goals Stage */}
        <TabsContent value='stage-1'>
          <div className='grid gap-6'>
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Set Financial Goals</AlertTitle>
              <AlertDescription>
                Setting clear financial goals can help you stay motivated and
                track your progress.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Your Financial Goals</CardTitle>
                <CardDescription>
                  What would you like to achieve?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid gap-4'>
                  <div className='rounded-lg border p-4'>
                    <h3 className='font-medium mb-2'>Savings Goal</h3>
                    <p className='text-sm text-muted-foreground mb-4'>
                      How much would you like to save each month?
                    </p>
                    <div className='flex items-center gap-2'>
                      <DollarSign className='h-4 w-4 text-muted-foreground' />
                      <input
                        type='number'
                        placeholder='Amount'
                        className='w-full rounded-md border border-input px-3 py-2 text-sm'
                      />
                    </div>
                  </div>

                  <div className='rounded-lg border p-4'>
                    <h3 className='font-medium mb-2'>Debt Reduction</h3>
                    <p className='text-sm text-muted-foreground mb-4'>
                      How much debt would you like to pay off?
                    </p>
                    <div className='flex items-center gap-2'>
                      <DollarSign className='h-4 w-4 text-muted-foreground' />
                      <input
                        type='number'
                        placeholder='Amount'
                        className='w-full rounded-md border border-input px-3 py-2 text-sm'
                      />
                    </div>
                  </div>

                  <div className='rounded-lg border p-4'>
                    <h3 className='font-medium mb-2'>Major Purchase</h3>
                    <p className='text-sm text-muted-foreground mb-4'>
                      Are you saving for a major purchase?
                    </p>
                    <div className='flex flex-col gap-2'>
                      <input
                        type='text'
                        placeholder='What are you saving for?'
                        className='w-full rounded-md border border-input px-3 py-2 text-sm'
                      />
                      <div className='flex items-center gap-2 mt-2'>
                        <DollarSign className='h-4 w-4 text-muted-foreground' />
                        <input
                          type='number'
                          placeholder='Target amount'
                          className='w-full rounded-md border border-input px-3 py-2 text-sm'
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setSetupStage(2)}
                  className='mt-6 w-full'
                >
                  Continue to Final Steps
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Final Setup Stage */}
        <TabsContent value='stage-2'>
          <div className='grid gap-6'>
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Almost Done!</AlertTitle>
              <AlertDescription>
                Just a few more preferences to set up, then you're all set to
                start managing your finances.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='font-medium'>Currency</h3>
                      <p className='text-sm text-muted-foreground'>
                        Select your preferred currency
                      </p>
                    </div>
                    <select
                      value={preferences.preferredCurrency}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          preferredCurrency: e.target.value,
                        })
                      }
                      className='rounded-md border border-input px-3 py-2 text-sm'
                    >
                      <option value='USD'>USD ($)</option>
                      <option value='EUR'>EUR (€)</option>
                      <option value='GBP'>GBP (£)</option>
                      <option value='JPY'>JPY (¥)</option>
                      <option value='CAD'>CAD (C$)</option>
                    </select>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='font-medium'>Notifications</h3>
                      <p className='text-sm text-muted-foreground'>
                        Receive alerts about your spending
                      </p>
                    </div>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        className='sr-only peer'
                        checked={preferences.notificationsEnabled}
                        onChange={() =>
                          setPreferences({
                            ...preferences,
                            notificationsEnabled:
                              !preferences.notificationsEnabled,
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className='space-y-4 mt-8'>
                  <h3 className='font-medium'>Quick Tips</h3>
                  <div className='grid gap-4'>
                    <div className='rounded-lg bg-muted p-4'>
                      <h4 className='text-sm font-medium mb-1'>
                        💡 Add Transactions
                      </h4>
                      <p className='text-xs text-muted-foreground'>
                        Record your expenses in the Transactions tab to track
                        your spending accurately.
                      </p>
                    </div>
                    <div className='rounded-lg bg-muted p-4'>
                      <h4 className='text-sm font-medium mb-1'>
                        💡 Check Your Budget
                      </h4>
                      <p className='text-xs text-muted-foreground'>
                        Regularly review your budget to ensure you're staying on
                        track with your financial goals.
                      </p>
                    </div>
                    <div className='rounded-lg bg-muted p-4'>
                      <h4 className='text-sm font-medium mb-1'>
                        💡 Adjust Categories
                      </h4>
                      <p className='text-xs text-muted-foreground'>
                        You can always modify your budget categories in the
                        Budget section as your needs change.
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleCompleteSetup} className='mt-8 w-full'>
                  Complete Setup & Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
