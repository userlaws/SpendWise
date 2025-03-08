'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { calculatePercentage, formatCurrency } from '@/lib/utils';
import {
  Edit,
  Plus,
  Home,
  CreditCard,
  BarChart3,
  User,
  LogOut,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Select as BasicSelect,
  SelectItem as BasicSelectItem,
} from '@/components/ui/select';

interface BudgetCategory {
  category_id: string;
  category_name: string;
  budget_amount: number;
  spent_amount: number;
  color: string;
  user_id: string;
}

export default function BudgetPage() {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    budget: '',
    color: '#6d28d9', // Default purple color to match theme
  });
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

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

  // Calculate totals
  const totalBudget = categories.reduce(
    (sum, cat) => sum + cat.budget_amount,
    0
  );
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent_amount, 0);
  const totalPercentage = calculatePercentage(totalSpent, totalBudget);

  // Fetch budget categories
  useEffect(() => {
    const fetchBudgetData = async () => {
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

        // Try to fetch budget categories
        try {
          const { data, error } = await supabase
            .from('budget_categories')
            .select('*')
            .eq('user_id', session.user.id);

          // Only set categories if fetch was successful
          if (!error && data) {
            setCategories(data);
          } else {
            // Table may not exist yet, use empty array
            setCategories([]);
          }
        } catch (error) {
          console.log('Budget categories table may not exist yet');
          setCategories([]);
        }
      } catch (error) {
        console.error('Error loading budget data:', error);
        // Don't show error toast for new users
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgetData();
  }, [toast]);

  const handleEditClick = (categoryId: string, currentBudget: number) => {
    setEditingCategory(categoryId);
    setEditValue(currentBudget);
  };

  const handleSaveClick = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('budget_categories')
        .update({ budget_amount: editValue })
        .eq('category_id', categoryId);

      if (error) throw error;

      setCategories(
        categories.map((cat) =>
          cat.category_id === categoryId
            ? { ...cat, budget_amount: editValue }
            : cat
        )
      );
      setEditingCategory(null);

      toast({
        title: 'Budget Updated',
        description: 'Your budget has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating budget:', error);
      toast({
        title: 'Error',
        description: 'Failed to update budget. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategory.name || parseFloat(newCategory.budget) <= 0) {
      toast({
        title: 'Error',
        description: 'Please provide a valid category name and budget amount.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Use the server-side API to add the category
      const response = await fetch('/api/budget/add-category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryName: newCategory.name,
          budgetAmount: parseFloat(newCategory.budget),
          color: newCategory.color,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add budget category');
      }

      // Refresh categories list
      const { data: updatedCategories, error: fetchError } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('user_id', supabase.auth.user()?.id);

      if (!fetchError && updatedCategories) {
        setCategories(updatedCategories);
      }

      toast({
        title: 'Success',
        description: 'Budget category added successfully!',
      });

      // Reset form fields
      setNewCategory({
        name: '',
        budget: '',
        color: '#6d28d9',
      });
      setIsAddDialogOpen(false);
    } catch (error: any) {
      console.error('Error in add category:', error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        <main className='flex-1'>
          <div className='p-6 space-y-6'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
              <div>
                <h1 className='text-2xl font-bold'>Budget</h1>
                <p className='text-muted-foreground'>
                  Manage your monthly budget allocations
                </p>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className='h-4 w-4 mr-2' />
                Add Category
              </Button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Budget
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {formatCurrency(totalBudget)}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Monthly allocation
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Spent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {formatCurrency(totalSpent)}
                  </div>
                  <p className='text-xs text-muted-foreground'>This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Remaining
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {formatCurrency(totalBudget - totalSpent)}
                  </div>
                  <Progress
                    value={Math.min(100, totalPercentage)}
                    className='h-2 mt-2'
                    indicatorClassName={
                      totalSpent > totalBudget ? 'bg-destructive' : undefined
                    }
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Budget Categories</CardTitle>
                <CardDescription>
                  Manage your budget allocations by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className='text-center py-4'>Loading budget data...</div>
                ) : categories.length === 0 ? (
                  <div className='text-center py-4'>
                    <p className='text-muted-foreground mb-2'>
                      No budget categories found
                    </p>
                    <Button
                      variant='outline'
                      onClick={() => setIsAddDialogOpen(true)}
                      size='sm'
                    >
                      Create Your First Budget Category
                    </Button>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {categories.map((category) => (
                      <div
                        key={category.category_id}
                        className='border rounded-lg p-2'
                      >
                        <div className='flex justify-between items-center mb-1'>
                          <div className='flex items-center'>
                            <div
                              className='w-4 h-4 rounded-full mr-1'
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <h3 className='font-medium text-sm'>
                              {category.category_name}
                            </h3>
                          </div>
                          <div className='flex items-center space-x-1'>
                            {editingCategory === category.category_id ? (
                              <>
                                <Input
                                  type='number'
                                  value={editValue}
                                  onChange={(e) =>
                                    setEditValue(parseFloat(e.target.value))
                                  }
                                  className='w-20 h-8 text-sm'
                                />
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() =>
                                    handleSaveClick(category.category_id)
                                  }
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                              </>
                            ) : (
                              <>
                                <span className='font-medium text-sm'>
                                  {formatCurrency(category.budget_amount)}
                                </span>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() =>
                                    handleEditClick(
                                      category.category_id,
                                      category.budget_amount
                                    )
                                  }
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className='space-y-1'>
                          <div className='flex justify-between text-xs'>
                            <span className='text-muted-foreground'>
                              {formatCurrency(category.spent_amount)} spent
                            </span>
                            <span
                              className={
                                category.spent_amount > category.budget_amount
                                  ? 'text-destructive'
                                  : 'text-muted-foreground'
                              }
                            >
                              {calculatePercentage(
                                category.spent_amount,
                                category.budget_amount
                              ).toFixed(0)}
                              % of budget
                            </span>
                          </div>
                          <Progress
                            value={Math.min(
                              100,
                              calculatePercentage(
                                category.spent_amount,
                                category.budget_amount
                              )
                            )}
                            className='h-2'
                            indicatorClassName={
                              category.spent_amount > category.budget_amount
                                ? 'bg-destructive'
                                : undefined
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Budget Category Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent className='sm:max-w-[400px]'>
                <DialogHeader>
                  <DialogTitle>Add Budget Category</DialogTitle>
                  <DialogDescription>
                    Create a new budget category to track your spending.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCategory}>
                  <div className='grid gap-2 py-2'>
                    <div className='grid gap-1'>
                      <Label htmlFor='name'>Category Name</Label>
                      <Input
                        id='name'
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className='grid gap-1'>
                      <Label htmlFor='budget'>Monthly Budget</Label>
                      <Input
                        id='budget'
                        type='number'
                        step='0.01'
                        value={newCategory.budget}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            budget: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className='grid gap-1'>
                      <Label htmlFor='color'>Color</Label>
                      <div className='flex items-center space-x-1'>
                        <div
                          className='w-6 h-6 rounded border'
                          style={{ backgroundColor: newCategory.color }}
                        ></div>
                        <Input
                          id='color'
                          type='color'
                          value={newCategory.color}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              color: e.target.value,
                            })
                          }
                          className='w-full h-8'
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type='submit'
                      className='bg-purple-600 hover:bg-purple-700'
                      size='sm'
                    >
                      Save Category
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
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
